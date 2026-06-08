/*
 * EcoSmart lora_gateway_v2.ino
 * Upgraded Receiver Node (V2)
 * 
 * Hardware: NodeMCU ESP8266 + LoRa RA-02 + WiFi
 * Logic: Listens for V2 LoRa packets at 865 MHz, validates packet header 
 *        and checksum, logs signal quality (RSSI/SNR), and forwards payload 
 *        to the live AWS backend.
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <SPI.h>
#include <LoRa.h>

// --- CONFIGURATION ---
const char* ssid = "Airtel_Samar_5g";
const char* password = "Maggosamar0383@";
const char* serverBaseUrl = "http://13.232.18.222:5000";
const float REGIONAL_FREQ = 865E6;  // 865 MHz (India license-free LPWAN band)

// LoRa RA-02 SPI Pin Definitions (Original CS/RST configuration)
const int NSS_PIN = D8;  // GPIO15 (CS)
const int RST_PIN = D0;  // GPIO16 (Reset)
const int DIO0_PIN = D2; // GPIO4  (IRQ)

// Valid packet validation header
const String PACKET_HEADER = "ECO_SMART";

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Initialize Onboard LED (Active LOW on NodeMCU)
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH); // Turn LED OFF initially

  // Manual Reset pulse to wake the LoRa RA-02 chip
  pinMode(RST_PIN, OUTPUT);
  digitalWrite(RST_PIN, LOW);
  delay(100);
  digitalWrite(RST_PIN, HIGH);
  delay(100);

  // Initialize LoRa
  SPI.begin();
  LoRa.setPins(NSS_PIN, RST_PIN, DIO0_PIN);
  LoRa.setSPIFrequency(1000000); // Consistent with transmitter SPI rate

  Serial.println("\n=============================================");
  Serial.println("   ESPMART LoRa GATEWAY V2 INITIALIZING      ");
  Serial.println("=============================================");

  Serial.printf("Initializing LoRa at %.2f MHz...\n", REGIONAL_FREQ / 1E6);
  if (!LoRa.begin(REGIONAL_FREQ)) {
    // Error Indicator: Rapid LED flashing
    for (int i = 0; i < 15; i++) {
      digitalWrite(LED_BUILTIN, LOW); delay(80);
      digitalWrite(LED_BUILTIN, HIGH); delay(80);
    }
    Serial.println("---------------------------------------------");
    Serial.println("CRITICAL ERROR: LoRa RA-02 failed to start!");
    Serial.println("Check physical pin wiring: CS->D8, SCK->D5, MISO->D6, MOSI->D7, RST->D0, DIO0->D2");
    Serial.println("---------------------------------------------");
    delay(5000);
    ESP.restart(); // Restart the node to recover automatically
  }
  Serial.println("LoRa RA-02 Initialized successfully!");

  // Establish WiFi Connection
  WiFi.begin(ssid, password);
  Serial.printf("Connecting to Wi-Fi SSID: %s\n", ssid);
  
  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 30) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected Successfully!");
    Serial.printf("IP Assigned: %s\n", WiFi.localIP().toString().c_str());
    // Solid LED indicates normal operational state
    digitalWrite(LED_BUILTIN, LOW); 
  } else {
    Serial.println("\nWiFi connection failed! Continuing in offline receiver mode.");
  }

  Serial.println("--- EcoSmart Gateway is actively listening ---");
}

void loop() {
  // Check for incoming LoRa packet
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // Visual flash indicating packet receipt
    digitalWrite(LED_BUILTIN, HIGH); delay(50);
    digitalWrite(LED_BUILTIN, LOW);

    // Read packet payload
    String payload = "";
    while (LoRa.available()) {
      payload += (char)LoRa.read();
    }

    // Read signal strength indicators
    int rssi = LoRa.packetRssi();
    float snr = LoRa.packetSnr();

    Serial.println("\n---------------------------------------------");
    Serial.printf("LoRa Transmission Received! Size: %d bytes\n", packetSize);
    Serial.printf("Signal RSSI: %d dBm | SNR: %.2f dB\n", rssi, snr);
    Serial.printf("Raw Payload: '%s'\n", payload.c_str());

    // --- PARSING & INTEGRITY CHECK ---
    // Expected Format: ECO_SMART,BIN_ID,FILL_LEVEL,STATUS,CHECKSUM
    
    // Parse using simple comma splits
    int index1 = payload.indexOf(',');
    int index2 = payload.indexOf(',', index1 + 1);
    int index3 = payload.indexOf(',', index2 + 1);
    int index4 = payload.indexOf(',', index3 + 1);

    if (index1 != -1 && index2 != -1 && index3 != -1 && index4 != -1) {
      String header = payload.substring(0, index1);
      String binId = payload.substring(index1 + 1, index2);
      String fillLevelStr = payload.substring(index2 + 1, index3);
      String status = payload.substring(index3 + 1, index4);
      String checksumStr = payload.substring(index4 + 1);

      // Validate Header
      if (header != PACKET_HEADER) {
        Serial.println("[Security Warning] Ignored packet with invalid header matching.");
        return;
      }

      int fillLevel = fillLevelStr.toInt();
      int receivedChecksum = checksumStr.toInt();

      // Recalculate checksum
      int computedChecksum = 0;
      for (int i = 0; i < binId.length(); i++) {
        computedChecksum += binId[i];
      }
      computedChecksum += fillLevel;

      // Validate Checksum
      if (computedChecksum != receivedChecksum) {
        Serial.printf("[Corrupt Warning] Checksum verification failed. Computed: %d, Received: %d. Dropping.\n", computedChecksum, receivedChecksum);
        return;
      }

      // Valid packet parsed successfully
      Serial.println("Packet Checksum Verified OK!");
      Serial.printf("  Bin ID     : %s\n", binId.c_str());
      Serial.printf("  Fill Level : %d%%\n", fillLevel);
      Serial.printf("  Status     : %s\n", status.c_str());
      Serial.println("---------------------------------------------");

      // Push telemetry up to AWS Cloud
      sendToCloud(binId, fillLevelStr, status);

    } else {
      Serial.println("[Format Warning] Malformed packet structure. Dropping.");
    }
  }

  // Periodic WiFi reconnection watchdog
  if (WiFi.status() != WL_CONNECTED && millis() % 30000 < 100) {
    Serial.println("[WiFi Watchdog] Attempting to reconnect WiFi...");
    WiFi.begin(ssid, password);
  }
}

// REST Backend PATCH dispatch function
void sendToCloud(String binId, String fillLevel, String status) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    String fullUrl = String(serverBaseUrl) + "/api/bins/" + binId;
    http.begin(client, fullUrl);
    http.addHeader("Content-Type", "application/json");

    // Construct JSON payload
    String jsonPayload = "{\"fillLevel\":" + fillLevel + ",\"status\":\"" + status + "\"}";

    Serial.printf("Dispatching PATCH request to AWS Server => %s\n", jsonPayload.c_str());
    int httpResponseCode = http.PATCH(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.printf("Success! Server response code: %d\n", httpResponseCode);
    } else {
      Serial.printf("Network / Server error. Error code: %d (%s)\n", httpResponseCode, http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  } else {
    Serial.println("[Offline Error] WiFi connection unavailable. Telemetry cache discarded.");
  }
}
