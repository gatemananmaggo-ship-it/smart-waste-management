/**
 * LORA RE-02 VITALS CHECK
 * This script bypasses the LoRa library to check if the ESP8266 
 * can see the chip ID over SPI. 
 * Use this to verify physical connectivity.
 */
#include <SPI.h>

// Pins as per your current TRANSMITTER setup
// For GATEWAY, change RST to D0 and DIO0 to D2 if needed.
const int NSS_PIN = D4;  // GPIO2
const int RST_PIN = D0;  // GPIO16
const int SCK_PIN = D5;  // GPIO14
const int MISO_PIN = D6; // GPIO12
const int MOSI_PIN = D7; // GPIO13

void setup() {
  Serial.begin(74880);
  delay(2000);
  Serial.println("\n====================================");
  Serial.println("   LORA HARDWARE SPI DIAGNOSTIC   ");
  Serial.println("====================================");

  pinMode(NSS_PIN, OUTPUT);
  digitalWrite(NSS_PIN, HIGH);
  pinMode(RST_PIN, OUTPUT);

  // 1. Hardware Reset Pulse
  Serial.println("Step 1: Resetting LoRa Module...");
  digitalWrite(RST_PIN, LOW);
  delay(100);
  digitalWrite(RST_PIN, HIGH);
  delay(100);

  // 2. Start SPI
  Serial.println("Step 2: Starting SPI Bus...");
  SPI.begin();
  // Set slow speed for diagnostic (1MHz)
  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));

  // 3. Read RegVersion (0x42)
  // According to SX1278 datasheet, this should ALWAYS return 0x12
  Serial.println("Step 3: Reading Chip Version Register (0x42)...");
  
  digitalWrite(NSS_PIN, LOW);
  SPI.transfer(0x42 & 0x7F); // 0x42 with MSB 0 for read
  uint8_t version = SPI.transfer(0x00);
  digitalWrite(NSS_PIN, HIGH);
  
  SPI.endTransaction();

  Serial.print(">> Raw Register Data: 0x"); 
  if (version < 0x10) Serial.print("0");
  Serial.println(version, HEX);

  Serial.println("------------------------------------");
  if (version == 0x12) {
    Serial.println("RESULT: SUCCESS!");
    Serial.println("The ESP8266 can communicate with the LoRa chip.");
    Serial.println("The issue is likely in the LoRa library setup or Frequency.");
  } else if (version == 0x00 || version == 0xFF) {
    Serial.println("RESULT: TOTAL FAILURE");
    Serial.println("Possible Causes:");
    Serial.println(" 1. No Power: Check if 3.3V and GND are solid.");
    Serial.println(" 2. Wiring: MISO/MOSI/SCK/NSS might be swapped.");
    Serial.println(" 3. Dead Chip: The module might be faulty.");
  } else {
    Serial.println("RESULT: UNSTABLE / WRONG CHIP");
    Serial.println("Received: 0x" + String(version, HEX));
    Serial.println("Expected: 0x12");
    Serial.println("Check for noise or long wires (use shorter jumpers).");
  }
  Serial.println("------------------------------------");
}

void loop() {
  // Just blink the built-in LED to show we are alive
  digitalWrite(LED_BUILTIN, LOW); delay(500);
  digitalWrite(LED_BUILTIN, HIGH); delay(500);
}
