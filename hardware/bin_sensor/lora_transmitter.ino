/**
 * EcoSmart lora_transmitter.ino
 * Bin Node: Measures distance and sends to Gateway via LoRa.
 * Hardware: NodeMCU ESP8266 + HC-SR04 + RYLR998 LoRa
 */

#include <SoftwareSerial.h>

// --- CONFIGURATION ---
const char* binId = "BIN-001"; // Unique ID for this bin
const int SLEEP_SECONDS = 900; // 15 minutes (900 seconds)

// Pin Definitions
const int TRIG_PIN = D5;
const int ECHO_PIN = D6;
const int LORA_RX = D1; // NodeMCU D1 -> RYLR998 TX
const int LORA_TX = D2; // NodeMCU D2 -> RYLR998 RX

// Distance Calibration (cm)
const int MAX_DISTANCE = 50; 
const int MIN_DISTANCE = 5;

SoftwareSerial loraSerial(LORA_RX, LORA_TX);

void setup() {
  Serial.begin(115200);
  loraSerial.begin(115200); // RYLR998 default baud
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Serial.println("\n--- Bin Transmitter Initialized ---");
  
  // 1. Measure Distance
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
    Serial.println("Error: Sensor failure.");
  } else {
    // 2. Calculate Fill Level
    float constrainedDist = constrain(distanceCm, MIN_DISTANCE, MAX_DISTANCE);
    int fillLevel = map(constrainedDist, MAX_DISTANCE, MIN_DISTANCE, 0, 100);
    
    String status = "Filling";
    if (fillLevel >= 90) status = "Full";
    else if (fillLevel <= 10) status = "Empty";

    Serial.printf("Distance: %.2f cm | Fill: %d%%\n", distanceCm, fillLevel);

    // 3. Send over LoRa
    // Format: BIN_ID,FILL_LEVEL,STATUS
    String payload = String(binId) + "," + String(fillLevel) + "," + status;
    
    // AT+SEND=<ADDRESS>,<PAYLOAD_LENGTH>,<DATA>
    // Using Address 0 for Gateway (ensure Gateway is also on Address 0 or use its specific address)
    String loraCommand = "AT+SEND=0," + String(payload.length()) + "," + payload + "\r\n";
    
    Serial.print("Sending LoRa: ");
    Serial.print(loraCommand);
    loraSerial.print(loraCommand);
    
    delay(500); // Give LoRa module time to process
  }

  // 4. Enter Deep Sleep
  Serial.println("Going to Deep Sleep for 15 minutes...");
  // Connect RST and D0 for this to work!
  ESP.deepSleep(SLEEP_SECONDS * 1000000); 
}

void loop() {
  // Never reached due to Deep Sleep
}
