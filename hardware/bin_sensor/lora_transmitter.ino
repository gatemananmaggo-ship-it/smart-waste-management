/**
 * EcoSmart lora_transmitter.ino
 * Bin Node: Measures distance and sends to Gateway via LoRa.
 * Hardware: NodeMCU ESP8266 + HC-SR04 + RA-02 LoRa
 */

#include <SPI.h>
#include <LoRa.h>

// --- CONFIGURATION ---
const char* binId = "BIN-001"; // Unique ID for this bin
const int SLEEP_SECONDS = 120; // 2 minutes (120 seconds)

// HC-SR04 Pin Definitions
const int TRIG_PIN = D3; // GPIO0
const int ECHO_PIN = D2; // GPIO4

// LoRa RA-02 SPI Pin Definitions
const int NSS_PIN = D4;  // GPIO2  (CS) - Moved from D8 (GPIO15) to prevent "waiting for host" boot crash
const int RST_PIN = D0;  // GPIO16 (Reset) - Moved from D4 to match Gateway and prevent boot issues
const int DIO0_PIN = D1; // GPIO5  (IRQ)

// Distance Calibration (cm)
const int MAX_DISTANCE = 50; 
const int MIN_DISTANCE = 5;

void setup() {
  Serial.begin(74880); // Using 74880 to exactly match the hardware bootloader's baud rate.
  
  // Force NSS HIGH immediately to prevent SPI noise interference during boot
  pinMode(D4, OUTPUT);
  digitalWrite(D4, HIGH);
  
  delay(2000); // Wait for Serial Monitor to catch up and power to stabilize
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Serial.println("\n====================================");
  Serial.println("   ESPMART LoRa TRANSMITTER BOOT   ");
  Serial.println("====================================");
  
  // 1. Initialize LoRa
  Serial.println("Performing Manual Reset of LoRa module...");
  pinMode(RST_PIN, OUTPUT);
  digitalWrite(RST_PIN, LOW);
  delay(100);
  digitalWrite(RST_PIN, HIGH);
  delay(100);

  SPI.begin(); 
  LoRa.setPins(NSS_PIN, RST_PIN, DIO0_PIN);
  LoRa.setSPIFrequency(1000000); // 1MHz for stability (matched with gateway)
  
  Serial.println("Attempting to connect to LoRa module at 433 MHz...");
  
  if (!LoRa.begin(433E6)) {
    Serial.println("------------------------------------");
    Serial.println("CRITICAL ERROR: Starting LoRa failed!");
    Serial.println("Check Physical Wiring:");
    Serial.println("  NSS  -> D4");
    Serial.println("  SCK  -> D5");
    Serial.println("  MISO -> D6");
    Serial.println("  MOSI -> D7");
    Serial.println("  RST  -> D0");
    Serial.println("  DIO0 -> D1");
    Serial.println("------------------------------------");
    Serial.println("Retrying in 5 seconds...");
    delay(5000);
    ESP.restart(); // Restart the board instead of hanging to prevent WDT reset
  }
  Serial.println("LoRa RA-02 Initialized Successfully!");
  
  Serial.println("Starting continuous loop mode...");
}

void loop() {
  // 2. Measure Distance
  long duration;
  float distanceCm;
  
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  duration = pulseIn(ECHO_PIN, HIGH);
  // Speed of sound wave divided by 2 (go and back)
  distanceCm = duration * 0.034 / 2;

  if (duration == 0) {
    Serial.println("Error: Sensor failure / HC-SR04 timeout.");
  } else {
    // 3. Calculate Fill Level
    float constrainedDist = constrain(distanceCm, MIN_DISTANCE, MAX_DISTANCE);
    int fillLevel = map(constrainedDist, MAX_DISTANCE, MIN_DISTANCE, 0, 100);
    
    String status = "Filling";
    if (fillLevel >= 90) status = "Full";
    else if (fillLevel <= 10) status = "Empty";

    Serial.println("------------------------------------");
    Serial.println("Bin Status Update:");
    Serial.print("  Bin ID     : "); Serial.println(binId);
    Serial.print("  Distance   : "); Serial.print(distanceCm); Serial.println(" cm");
    Serial.print("  Fill Level : "); Serial.print(fillLevel); Serial.println("%");
    Serial.print("  Status     : "); Serial.println(status);
    Serial.println("------------------------------------");

    // 4. Send over LoRa via SPI
    // Format: BIN_ID,FILL_LEVEL,STATUS
    String payload = String(binId) + "," + String(fillLevel) + "," + status;
    
    Serial.print(">> Sending LoRa Packet: ");
    Serial.println(payload);
    
    // Transmit packet byte-by-byte instantly
    LoRa.beginPacket();
    LoRa.print(payload);
    LoRa.endPacket();
    
    Serial.println(">> Packet Sent Successfully!");
  }

  // 5. Wait before next reading
  Serial.println("\nWaiting for " + String(SLEEP_SECONDS) + " seconds before next update...");
  Serial.flush();
  
  // Wait using standard delay
  delay(SLEEP_SECONDS * 1000); 
}
