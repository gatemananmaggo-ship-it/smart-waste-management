#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>

/**
 * EcoSmart bin_sensor.ino (NodeMCU Version)
 * Distance measurement and Cloud Reporting using ESP8266/NodeMCU
 */

// --- CONFIGURATION ---
const char *ssid = "Airtel_Raptor 5g";
const char *password = "up80gd0383";

// The unique ID for this specific bin (must match the one registered in the web
// UI)
const char *hardwareId = "BIN-001";

// Server base URL
const char *serverBaseUrl =
    "https://smart-waste-api-epmw.onrender.com"; // Live Render server

// Bin Calibration (in cm)
const int MAX_DISTANCE = 50; // Distance when bin is EMPTY
const int MIN_DISTANCE = 5;  // Distance when bin is FULL

// Pin Definitions for NodeMCU (D-Pins map to GPIO numbers)
const int TRIG_PIN = D5; // NodeMCU D5 corresponds to GPIO 14
const int ECHO_PIN = D6; // NodeMCU D6 corresponds to GPIO 12

// Constants
const float SOUND_VELOCITY = 0.034; // cm/us
const int REPORT_INTERVAL = 10000;  // Send data every 10 seconds

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // WiFi Connection
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  Serial.println("--- EcoSmart Bin Sensor (NodeMCU) Initialized ---");
}

void loop() {
  // 1. Measure Distance
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  float distanceCm = duration * SOUND_VELOCITY / 2;

  if (duration == 0) {
    Serial.println("Error: Hardware sensor failure.");
    delay(2000);
    return;
  }

  // 2. Calculate Fill Level Percentage
  float constrainedDist = constrain(distanceCm, MIN_DISTANCE, MAX_DISTANCE);
  int fillLevel = map(constrainedDist, MAX_DISTANCE, MIN_DISTANCE, 0, 100);

  // Determine Status
  String status = "Filling";
  if (fillLevel >= 90)
    status = "Full";
  else if (fillLevel <= 10)
    status = "Empty";

  Serial.printf("Distance: %.2f cm | Fill: %d%% | Status: %s\n", distanceCm,
                fillLevel, status.c_str());

  // 3. Send to Cloud (if WiFi is connected)
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // Disable SSL certificate verification for NodeMCU
    HTTPClient http;
    String fullUrl = String(serverBaseUrl) + "/api/bins/" + String(hardwareId);

    // Begin request
    http.begin(client, fullUrl);
    http.addHeader("Content-Type", "application/json");

    // Construct JSON payload
    String httpRequestData = "{\"fillLevel\":" + String(fillLevel) +
                             ",\"status\":\"" + status + "\"}";

    Serial.print("Sending to cloud... ");
    int httpResponseCode = http.PATCH(httpRequestData);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }

  delay(REPORT_INTERVAL);
}
