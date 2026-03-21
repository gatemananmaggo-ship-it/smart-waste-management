The connection between the ESP32 hardware and your frontend UI is maintained through a unique string identifier called the Hardware ID (e.g., BIN-001).

Here is exactly how they are connected:

Registration in UI: You manually register a bin in the frontend (using the Add Bin button). You enter the Hardware ID (like BIN-001), an address, and its coordinates. This creates a "placeholder" in the database.

ESP32 Request: Your ESP32 is programmed with that same ID. It sends data to the backend using a URL that includes it: http://<IP>:5000/api/bins/BIN-001.

Backend Matchmaking: When the backend receives this request, it doesn't look for a database ID; it looks for a record where hardwareId is "BIN-001". It then updates that record's fillLevel and status.

Real-time Sync: Immediately after updating the database, the backend sends a message (via Socket.io) to all connected frontend clients saying: "Hey, the bin with ID BIN-001 just updated!"

UI Update: Your frontend code (in App.jsx) hears this message and updates the specific bin in the list that matches that hardwareId, causing the map pins and tables to change instantly.


Key Rule: If the hardwareId in your ESP32 code (bin_sensor.ino) doesn't exactly match the Hardware ID you typed into the UI, the backend won't find the bin and the data will be ignored.