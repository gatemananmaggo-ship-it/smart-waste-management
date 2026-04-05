/**
 * EcoSmart lora_gateway.ino
 * Receiver Node: Listens for LoRa packets continuously via SPI and forwards to AWS Cloud.
 * Hardware: NodeMCU ESP8266 + LoRa RA-02 + WiFi
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <LoRa.h>

// --- CONFIGURATION ---
const char *ssid = "Airtel_Raptor 5g";
const char *password = "up80gd0383";
const char *serverBaseUrl = "http://13.232.18.222:5000";

// LoRa RA-02 SPI Pin Definitions
const int NSS_PIN = D8;  // GPIO15 (CS)
const int RST_PIN = D4;  // GPIO2  (Reset)  -- Changed to keep identical with Sender
const int DIO0_PIN = D2; // GPIO4  (IRQ)

void setup() {
  Serial.begin(115200);

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

  // 2. Initialize LoRa Component
  LoRa.setPins(NSS_PIN, RST_PIN, DIO0_PIN);
  
  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed! Check SPI wiring / power.");
    while (1); // Halt execution
  }
  Serial.println("LoRa RA-02 Initialized Successfully!");

  Serial.println("--- EcoSmart Gateway is now ACTIVELY LISTENING on 433 MHz ---");
}

void loop() {
  // 3. Listen for LoRa Packets Event
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // We captured a packet from the air
    Serial.print("Incoming LoRa Transmission Received! Size: ");
    Serial.print(packetSize);
    Serial.print(" bytes. Signal RSSI: ");
    Serial.println(LoRa.packetRssi());

    // 4. Read the payload
    String payload = "";
    while (LoRa.available()) {
      payload += (char)LoRa.read();
    }
    
    Serial.print("Decoded Payload: '");
    Serial.print(payload);
    Serial.println("'");
    
    // 5. Parse Data Stream
    // The payload format from Sender is precisely: BIN_ID,FILL_LEVEL,STATUS
    // E.g., "BIN-001,85,Filling"

    int firstComma = payload.indexOf(',');
    int secondComma = payload.indexOf(',', firstComma + 1);

    if (firstComma != -1 && secondComma != -1) {
      String binId = payload.substring(0, firstComma);
      String fillLevel = payload.substring(firstComma + 1, secondComma);
      String status = payload.substring(secondComma + 1);

      // Verify cleanly
      Serial.println("--- Parse Results ---");
      Serial.println("Bin ID : " + binId);
      Serial.println("Fill   : " + fillLevel + "%");
      Serial.println("Status : " + status);
      Serial.println("---------------------");

      // 6. Push event to Cloud
      sendToCloud(binId, fillLevel, status);
    } else {
      Serial.println("Warning: Received malformed packet structure. Dropping.");
    }
    
    Serial.println("Listening for next packet...");
    Serial.println();
  }
}

// REST Backend Integration Function
void sendToCloud(String binId, String fillLevel, String status) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    
    String fullUrl = String(serverBaseUrl) + "/api/bins/" + binId;
    http.begin(client, fullUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"fillLevel\":" + fillLevel + ",\"status\":\"" + status + "\"}";
    
    Serial.print("Initiating PATCH Request to AWS => ");
    Serial.println(json);
    
    int httpResponseCode = http.PATCH(json);
    
    if (httpResponseCode > 0) {
      Serial.println("Success! Backend responded with HTTP Code: " + String(httpResponseCode));
    } else {
      Serial.println("Failure! Network or AWS Server error code: " + String(httpResponseCode));
    }
    http.end();
  } else {
    Serial.println("Error: NodeMCU lost WiFi connection! Cannot forward to backend.");
  }
}
