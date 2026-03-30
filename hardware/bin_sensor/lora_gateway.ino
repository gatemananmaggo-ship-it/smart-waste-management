/**
 * EcoSmart lora_gateway.ino
 * Receiver Node: Listens for LoRa packets and forwards to Cloud.
 * Hardware: NodeMCU ESP8266 + RYLR998 LoRa + WiFi
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SoftwareSerial.h>

// --- CONFIGURATION ---
const char *ssid = "Airtel_Raptor 5g";
const char *password = "up80gd0383";
const char *serverBaseUrl = "http://13.232.18.222:5000";

// Pin Definitions
const int LORA_RX = D1; // NodeMCU D1 -> RYLR998 TX
const int LORA_TX = D2; // NodeMCU D2 -> RYLR998 RX

SoftwareSerial loraSerial(LORA_RX, LORA_TX);

void setup() {
  Serial.begin(115200);
  loraSerial.begin(115200); // RYLR998 default baud

  // 1. Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  Serial.println("--- EcoSmart Gateway Initialized (Listening...) ---");
}

void loop() {
  // 2. Listen for LoRa Data
  if (loraSerial.available()) {
    String loraIncoming = loraSerial.readStringUntil('\n');
    loraIncoming.trim();

    // Check if it's a valid RCV packet
    // Format: +RCV=<ADDRESS>,<LENGTH>,<DATA>,<RSSI>,<SNR>
    if (loraIncoming.startsWith("+RCV=")) {
      Serial.println("LoRa Received: " + loraIncoming);

      // Simple Parsing (Extracting DATA)
      // Example: +RCV=0,15,BIN-001,85,Filling,-45,15
      
      // 1. Find the 3rd comma (start of BIN_ID)
      int firstComma = loraIncoming.indexOf(',');
      int secondComma = loraIncoming.indexOf(',', firstComma + 1);
      int thirdComma = loraIncoming.indexOf(',', secondComma + 1);
      
      // Find the 4th comma (end of STATUS, before RSSI)
      // Actually, my data has its own commas (BIN_ID,FILL,STATUS)
      // +RCV=0,25,BIN-001,45,Filling,-45,15
      // 1st comma after +RCV=0 (index 5-ish)
      // 2nd comma after length (index 8-ish)
      // THE DATA starts after the 2nd comma and ends before the 3rd-to-last comma?
      // Better strategy: split by comma but be careful.
      
      // Let's manually parse based on comma index
      // Data starts after 2nd comma
      int dataStart = secondComma + 1;
      
      // Data ends before RSSI. RSSI is the 2nd-to-last field.
      int snrComma = loraIncoming.lastIndexOf(',');
      int rssiComma = loraIncoming.lastIndexOf(',', snrComma - 1);
      int dataEnd = rssiComma;

      String payload = loraIncoming.substring(dataStart, dataEnd);
      Serial.println("Extracted Payload: " + payload);

      // Now parse Payload: BIN_ID,FILL_LEVEL,STATUS
      int pComma1 = payload.indexOf(',');
      int pComma2 = payload.indexOf(',', pComma1 + 1);

      if (pComma1 != -1 && pComma2 != -1) {
        String binId = payload.substring(0, pComma1);
        String fillLevel = payload.substring(pComma1 + 1, pComma2);
        String status = payload.substring(pComma2 + 1);

        // 3. Forward to Cloud
        sendToCloud(binId, fillLevel, status);
      }
    }
  }
}

void sendToCloud(String binId, String fillLevel, String status) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    String fullUrl = String(serverBaseUrl) + "/api/bins/" + binId;

    http.begin(client, fullUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"fillLevel\":" + fillLevel + ",\"status\":\"" + status + "\"}";
    
    Serial.print("Uploading to Cloud: ");
    Serial.println(json);
    
    int httpResponseCode = http.PATCH(json);
    
    if (httpResponseCode > 0) {
      Serial.println("Success! HTTP Response: " + String(httpResponseCode));
    } else {
      Serial.println("HTTP Error: " + String(httpResponseCode));
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected. Cannot send data.");
  }
}
