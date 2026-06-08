# LoRa RA-02 V2 Wiring Maps

This document outlines the pin configuration and wiring mapping for the **EcoSmart Smart Waste Management System (V2)**. 

These maps are optimized for **ultra-low power consumption** (Deep Sleep support on the transmitter), **regional regulatory compliance** (865 MHz for India), and **boot-loop prevention** on the NodeMCU ESP8266.

---

## 1. Transmitter Node (Smart Bin - Battery Powered)

The transmitter node measures the bin's fill level and sends telemetry reports. It uses deep sleep to save power, waking up when the internal timer fires or when strong vibration is detected.

> [!IMPORTANT]
> **Deep Sleep Wake-up Loop:** 
> * You must connect a physical jumper wire between NodeMCU pin **D0 (GPIO16)** and the **RST** pin. Without this physical connection, the ESP8266 cannot wake itself up from deep sleep!
>
> **LoRa Auto-Reset Connection:**
> * Connect the LoRa RA-02 **RST** pin directly to the NodeMCU's **RST** pin. When the NodeMCU wakes up or resets, the LoRa module will reset automatically. This saves a GPIO pin for other uses.

### Power Wiring Map

| From Component | Pin | To Component | Pin | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Battery** | Positive (+) | **TP4056** | B+ | 3.7V Li-Ion battery source |
| **Battery** | Negative (-) | **TP4056** | B- | Common Ground reference |
| **TP4056** | OUT+ | **MT3608** | VIN+ | Protected battery output to booster |
| **TP4056** | OUT- | **MT3608** | VIN- | |
| **MT3608** | VOUT+ (5.0V) | **NodeMCU** | Vin | Powers NodeMCU (Do NOT connect 5V to 3V3) |
| **MT3608** | VOUT+ (5.0V) | **HC-SR04** | VCC | Ultrasonic sensor requires 5V power |
| **MT3608** | VOUT- (GND)| **NodeMCU** | GND | Common Ground |
| **MT3608** | VOUT- (GND)| **HC-SR04** | GND | Common Ground |
| **NodeMCU** | 3V3 | **LoRa RA-02**| 3.3V | LoRa module runs on exactly 3.3V |
| **NodeMCU** | 3V3 | **SW-420** | VCC | Vibration sensor runs on 3.3V |
| **NodeMCU** | GND | **LoRa RA-02**| GND | |
| **NodeMCU** | GND | **SW-420** | GND | |

### Data Pin Map

| Component | Pin | NodeMCU Pin | Boot State Impact / Function |
| :--- | :--- | :--- | :--- |
| **NodeMCU** | **D0 (GPIO16)** | **RST** (Self) | **Deep Sleep Trigger Link** (Bridges sleep wake pulse) |
| **LoRa RA-02** | SCK | D5 (GPIO14) | SPI Clock |
| | MISO | D6 (GPIO12) | SPI MISO |
| | MOSI | D7 (GPIO13) | SPI MOSI |
| | NSS (CS) | D4 (GPIO2) | SPI Chip Select. *Safe during boot (must be HIGH).* |
| | RST | **RST** | Connect directly to NodeMCU RST line. *No GPIO pin wasted.* |
| | DIO0 | D2 (GPIO4) | LoRa Interrupt Pin (No boot constraints). |
| **HC-SR04** | Trig | D3 (GPIO0) | Trigger Pin. *Safe during boot (pulled HIGH).* |
| | Echo | D8 (GPIO15) | Echo Pin. *Safe during boot (sensor pulls LOW).* |
| **SW-420** | DO | D1 (GPIO5) | Vibration Digital Out (No boot constraints). |

---

## 2. Receiver Node (Gateway - USB Powered)

The gateway stays continuously powered via its USB port to listen for reports from the bins, then forwards the reports to the AWS server.

### Wiring Map

| Component | Pin | NodeMCU Pin | Function / Notes |
| :--- | :--- | :--- | :--- |
| **Power Supply** | USB | USB Port | Powered continuously from a 5V USB wall adapter |
| **LoRa RA-02** | 3.3V | 3V3 | Power: Must be exactly 3.3V |
| | GND | GND | Common Ground |
| | SCK | D5 (GPIO14) | SPI Hardware Clock |
| | MISO | D6 (GPIO12) | SPI Hardware MISO |
| | MOSI | D7 (GPIO13) | SPI Hardware MOSI |
| | NSS (CS) | D8 (GPIO15) | SPI Chip Select |
| | RST | D0 (GPIO16) | Manual LoRa Reset pin |
| | DIO0 | D2 (GPIO4) | Interrupt trigger pin |
