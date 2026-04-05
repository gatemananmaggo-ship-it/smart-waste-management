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
const int TRIG_PIN = D1; // GPIO5
const int ECHO_PIN = D3; // GPIO0

// LoRa RA-02 SPI Pin Definitions
const int NSS_PIN = D8;  // GPIO15 (CS)
const int RST_PIN = D4;  // GPIO2  (Reset)  -- Changed from D0 to allow Deep Sleep Wake!
const int DIO0_PIN = D2; // GPIO4  (IRQ)

// Distance Calibration (cm)
const int MAX_DISTANCE = 50; 
const int MIN_DISTANCE = 5;

void setup() {
  Serial.begin(115200);
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Serial.println("\n--- Bin Transmitter Initialized ---");
  
  // 1. Initialize LoRa
  LoRa.setPins(NSS_PIN, RST_PIN, DIO0_PIN);
  
  // Start LoRa at 433 MHz
  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed! Check wiring / power.");
    while (1); // Halt execution if LoRa fails
  }
  Serial.println("LoRa RA-02 Initialized Successfully!");
  
  // 2. Measure Distance
  long duration;
  float distanceCm;
  
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  duration = pulseIn(ECHO_PIN, HIGH);
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

    Serial.printf("Distance: %.2f cm | Fill: %d%%\n", distanceCm, fillLevel);

    // 4. Send over LoRa via SPI
    // Format: BIN_ID,FILL_LEVEL,STATUS
    String payload = String(binId) + "," + String(fillLevel) + "," + status;
    
    Serial.print("Sending LoRa Packet: ");
    Serial.println(payload);
    
    // Transmit packet byte-by-byte instantly
    LoRa.beginPacket();
    LoRa.print(payload);
    LoRa.endPacket();
    
    Serial.println("Packet Send Complete!");
    delay(500); // Give LoRa module time to power down cleanly
  }

  // 5. Enter Deep Sleep
  Serial.println("Going to Deep Sleep for 2 minutes...");
  
  // WARNING: To wake up from deep sleep on a NodeMCU ESP8266,
  // YOU MUST physically wire pin D0 (GPIO16) to the RST pin!
  ESP.deepSleep(SLEEP_SECONDS * 1000000); 
}

void loop() {
  // Never reached due to Deep Sleep architecture
}
