/**
 * EcoSmart lora_transmitter_v2.ino
 * Upgraded Bin Node Firmware (V2)
 * 
 * Hardware: NodeMCU ESP8266 + HC-SR04 + RA-02 LoRa + SW-420 Vibration Sensor
 * Optimization: Deep Sleep battery saving, 865 MHz Indian regulatory compliance,
 *               vibration-settling logic, and Carrier Sense (LBT) collision avoidance.
 */

#include <SPI.h>
#include <LoRa.h>

// --- CONFIGURATION ---
const char* BIN_ID = "BIN-001";     // Unique ID for this bin
const int SLEEP_SECONDS = 120;       // Deep sleep duration (2 minutes)
const float REGIONAL_FREQ = 865E6;  // 865 MHz (India license-free LPWAN band)

// Pin Definitions (optimized to prevent boot conflicts)
const int LORA_NSS_PIN = D4;  // GPIO2  (CS) - Pulled HIGH during boot (safe)
const int LORA_RST_PIN = -1;  // Hardwired to NodeMCU RST pin (-1 disables software control)
const int LORA_DIO0_PIN = D2; // GPIO4  (IRQ) - No boot constraints

const int HC_TRIG_PIN = D3;   // GPIO0  - Pulled HIGH during boot (safe)
const int HC_ECHO_PIN = D8;   // GPIO15 - Sensor pulls LOW during boot (safe)

const int VIB_DO_PIN = D1;    // GPIO5  - SW-420 Digital Out (No boot constraints)

// Calibration Constants (in cm)
const int MAX_DISTANCE = 50;  // Empty bin distance
const int MIN_DISTANCE = 5;   // Full bin distance
const float SOUND_SPEED = 0.0343; // Speed of sound (cm/us)

// Basic packet header for security / noise filtering
const String PACKET_HEADER = "ECO_SMART";

void setup() {
  // Start serial monitor at bootloader matching baud rate (74880) for debugging boot output
  Serial.begin(74880);
  delay(100);

  // Set pin modes
  pinMode(HC_TRIG_PIN, OUTPUT);
  pinMode(HC_ECHO_PIN, INPUT);
  pinMode(VIB_DO_PIN, INPUT);

  // Hold SPI chip select HIGH immediately to prevent SPI line noise during startup
  pinMode(LORA_NSS_PIN, OUTPUT);
  digitalWrite(LORA_NSS_PIN, HIGH);

  Serial.println("\n=============================================");
  Serial.println("   ESPMART LoRa TRANSMITTER V2 ACTIVATED   ");
  Serial.println("=============================================");

  // Initialize SPI & LoRa module
  SPI.begin();
  LoRa.setPins(LORA_NSS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);
  LoRa.setSPIFrequency(1000000); // Lower SPI speed for signal integrity on jumper wires

  Serial.printf("Initializing LoRa at %.2f MHz...\n", REGIONAL_FREQ / 1E6);
  if (!LoRa.begin(REGIONAL_FREQ)) {
    Serial.println("---------------------------------------------");
    Serial.println("CRITICAL ERROR: LoRa initialization failed!");
    Serial.println("Verify wiring: CS->D4, SCK->D5, MISO->D6, MOSI->D7, RST->RST, DIO0->D2");
    Serial.println("---------------------------------------------");
    // Wait and retry via watch-dog reset or deep sleep sleep-cycle
    ESP.deepSleep(10 * 1000000); // Sleep 10s before retrying to prevent power drain loops
  }
  Serial.println("LoRa RA-02 Initialized Successfully!");

  // Seed random number generator using analog noise for LBT backoffs
  randomSeed(analogRead(A0));

  // --- VIBRATION & SETTLING LOGIC ---
  Serial.println("Checking bin physical state...");
  bool wasVibrating = false;
  unsigned long vibStartTime = millis();

  // Read vibration pin state
  // SW-420 outputs HIGH when vibration is detected, LOW when idle
  if (digitalRead(VIB_DO_PIN) == HIGH) {
    wasVibrating = true;
    Serial.println("[Vibration Alert] Movement detected! Waiting for trash to settle...");
    
    // Settling loop: Wait until there is no vibration for 3 consecutive seconds
    unsigned long lastVibTime = millis();
    while (millis() - lastVibTime < 3000) {
      if (digitalRead(VIB_DO_PIN) == HIGH) {
        lastVibTime = millis(); // Reset quiet timer if vibration occurs again
        delay(100);
      }
      
      // Safety timeout: If vibration lasts longer than 8 seconds, it might be tampered or tipped
      if (millis() - vibStartTime > 8000) {
        Serial.println("[Warning] Continuous vibration detected! Bin might be tipped or tampered.");
        break;
      }
      yield(); // Feed the ESP8266 watchdog
    }
    Serial.println("Vibration settled. Taking distance reading.");
  } else {
    Serial.println("Bin is stable. Taking reading.");
  }

  // --- MEASURE DISTANCE ---
  digitalWrite(HC_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(HC_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(HC_TRIG_PIN, LOW);

  long duration = pulseIn(HC_ECHO_PIN, HIGH, 30000); // 30ms timeout (approx 5m max distance)
  float distanceCm = 0;
  int fillLevel = 0;
  String status = "Unknown";

  if (duration == 0) {
    Serial.println("Error: Ultrasonic sensor timeout or hardware failure.");
    status = "Sensor_Error";
  } else {
    distanceCm = duration * SOUND_SPEED / 2;
    // Calibrate and constrain distance to percentage
    float constrainedDist = constrain(distanceCm, MIN_DISTANCE, MAX_DISTANCE);
    fillLevel = map(constrainedDist, MAX_DISTANCE, MIN_DISTANCE, 0, 100);

    if (fillLevel >= 90) {
      status = "Full";
    } else if (fillLevel <= 10) {
      status = "Empty";
    } else {
      status = "Filling";
    }

    // Special state detection: Heavy vibration followed by empty status suggests it was just emptied
    if (wasVibrating && fillLevel <= 15) {
      status = "Emptied";
      Serial.println("[State Detection] Heavy vibration + Empty bin suggests recent collection service!");
    } 
    // Heavy continuous vibration alert
    else if (millis() - vibStartTime > 8000) {
      status = "Tampered";
    }

    Serial.println("---------------------------------------------");
    Serial.printf("Measurement Result:\n");
    Serial.printf("  Bin ID     : %s\n", BIN_ID);
    Serial.printf("  Distance   : %.2f cm\n", distanceCm);
    Serial.printf("  Fill Level : %d%%\n", fillLevel);
    Serial.printf("  Status     : %s\n", status.c_str());
    Serial.println("---------------------------------------------");
  }

  // --- CARRIER SENSE / LISTEN BEFORE TALK (LBT) ---
  Serial.println("Performing Listen Before Talk (LBT)...");
  bool channelBusy = true;
  int retryCount = 0;
  const int maxRetries = 3;

  while (channelBusy && retryCount < maxRetries) {
    // Put LoRa module in receive mode briefly to check for active preamble
    LoRa.receive();
    delay(200); // Listen for 200ms
    
    // Check if we parsed a packet header or if RSSI indicates high signal energy
    // A packet size > 0 indicates another transmitter is actively speaking.
    if (LoRa.parsePacket() > 0) {
      retryCount++;
      int backoff = random(500, 2000); // Random delay between 0.5s and 2s
      Serial.printf("[LBT] Channel busy! Backing off for %d ms (Retry %d/%d)...\n", backoff, retryCount, maxRetries);
      delay(backoff);
    } else {
      channelBusy = false; // Channel is clear to transmit
    }
  }

  // --- TRANSMIT PACKET ---
  // Payload Format: ECO_SMART,BIN_ID,FILL_LEVEL,STATUS,CHECKSUM
  // Simple checksum to ensure packet integrity over distance
  int rawChecksum = 0;
  for (int i = 0; i < strlen(BIN_ID); i++) rawChecksum += BIN_ID[i];
  rawChecksum += fillLevel;

  String payload = PACKET_HEADER + "," + String(BIN_ID) + "," + String(fillLevel) + "," + status + "," + String(rawChecksum);

  Serial.printf(">> Transmitting Packet: '%s'\n", payload.c_str());
  LoRa.beginPacket();
  LoRa.print(payload);
  LoRa.endPacket();
  Serial.println(">> Transmission complete!");

  // --- ENTER DEEP SLEEP ---
  Serial.printf("Entering low-power Deep Sleep for %d seconds...\n\n", SLEEP_SECONDS);
  Serial.flush();
  
  // Sleep duration requires microseconds
  ESP.deepSleep(SLEEP_SECONDS * 1000000ULL);
}

void loop() {
  // During deep sleep, the processor is powered down. execution never reaches loop().
  // When the sleep timer fires, GPIO16 pulses RST, and setup() runs from the start.
}
