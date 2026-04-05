# LoRa RA-02 Circuit Diagrams

![Transmitter Circuit Diagram](C:\Users\DELL\.gemini\antigravity\brain\50b95673-17f8-466a-bb4c-2c4cb12afe57\ra02_transmitter_schematic_1774940601422.png)

This document outlines the pinout and wiring diagrams for the Smart Waste Management system. The transmitter (Smart Bin) is battery-powered using a 3.7V Li-Ion battery, protected by a TP4056 charger module, and boosted to 5V for the MCU and sensors by an MT3608 boost converter.

## 1. Transmitter Node (Smart Bin - Battery Powered)

The transmitter uses one of your NodeMCUs (Type C or Type D), the LoRa RA-02 module, and the HC-SR04 ultrasonic sensor. Because it runs on a 3.7V battery, it requires an MT3608 boost converter to step up the voltage to 5V, which is required to power the NodeMCU's `Vin` pin and the HC-SR04 sensor properly.

> [!CAUTION]
> **Voltage Calibration:** Before connecting the MT3608 `VOUT+` to the NodeMCU or Sensor, you MUST use a multimeter and turn the MT3608's potentiometer (the little brass screw) until it outputs exactly **5.0V**. Outputting more than 5V will permanently fry the NodeMCU and HC-SR04.

### Power Wiring Map

| From Component | Pin | To Component | Pin | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Battery** | Positive (+) | **TP4056** | B+ | 3.7V Li-Ion battery source |
| **Battery** | Negative (-) | **TP4056** | B- | |
| **TP4056** | OUT+ | **MT3608** | VIN+ | Transfers protected battery output |
| **TP4056** | OUT- | **MT3608** | VIN- | |
| **MT3608** | VOUT+ (5V) | **NodeMCU** | Vin | Powers NodeMCU (Do NOT wire 5V to the 3V3 pin) |
| **MT3608** | VOUT+ (5V) | **HC-SR04** | VCC | Sensor runs on 5V |
| **MT3608** | VOUT- (GND)| **NodeMCU** | GND | Common Ground |
| **MT3608** | VOUT- (GND)| **HC-SR04** | GND | Common Ground |
| **NodeMCU** | 3V3 | **LoRa RA-02**| 3.3V | The NodeMCU steps the 5V down to 3.3V internally |
| **NodeMCU** | GND | **LoRa RA-02**| GND | |

*(To charge the battery, you will simply plug a USB wall charger into the TP4056 board directly).*

### Data Wiring Map

| Component | Pin | NodeMCU Pin | Function / Notes |
| :--- | :--- | :--- | :--- |
| **LoRa RA-02** | SCK | D5 (GPIO14) | Hardware SPI Clock |
| | MISO | D6 (GPIO12) | Hardware SPI MISO |
| | MOSI | D7 (GPIO13) | Hardware SPI MOSI |
| | NSS (CS) | D8 (GPIO15) | SPI Chip Select |
| | RST | D0 (GPIO16) | Reset |
| | DIO0 | D2 (GPIO4) | Interrupt trigger |
| **HC-SR04** | Trig | D1 (GPIO5) | Output pin to trigger the sound wave |
| | Echo | D3 (GPIO0) | Input pin to read the bounced sound wave |

---

## 2. Receiver Node (Gateway)

![Receiver Circuit Diagram](C:\Users\DELL\.gemini\antigravity\brain\50b95673-17f8-466a-bb4c-2c4cb12afe57\receiver_circuit_diagram_1774936683945.png)

The receiver acts as the bridge. Since it doesn't need to be battery-powered, it connects seamlessly to wall power via USB. It captures wireless LoRa packets and uses your other NodeMCU to push that data up to your AWS EC2 backend.

### Pin Wiring Map

| Component | Pin | NodeMCU Pin | Function / Notes |
| :--- | :--- | :--- | :--- |
| **Power Supply** | USB | USB Port | Plug the second NodeMCU's USB (Type-C or D) into a standard 5V wall adapter |
| **LoRa RA-02** | 3.3V | 3V3 | **Power:** Must be exactly 3.3V |
| | GND | GND | Common Ground |
| | SCK | D5 (GPIO14) | Hardware SPI Clock |
| | MISO | D6 (GPIO12) | Hardware SPI MISO |
| | MOSI | D7 (GPIO13) | Hardware SPI MOSI |
| | NSS (CS) | D8 (GPIO15) | SPI Chip Select |
| | RST | D0 (GPIO16) | Reset |
| | DIO0 | D2 (GPIO4) | Interrupt trigger |

> [!TIP]
> **Hardware Assembly Best Practices:**
> *   Keep the wires between the LoRa module and the NodeMCU as **short as possible**. Long jumper wires can corrupt the high-speed SPI signals.
> *   Do not power on the RA-02 without its antenna attached. Transmitting without an antenna can instantly fry the internal radio amplifier.
> *   Ensure that all grounds (NodeMCU, Sensors, external power supplies) are connected together.
