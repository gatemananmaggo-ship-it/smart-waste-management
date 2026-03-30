# Smart Waste Management System

A comprehensive IoT-based waste management solution featuring a cloud dashboard, a mobile application for workers, and hardware integration (ESP32).

## Project Structure

- **`/frontend`**: React-based web dashboard for monitoring bin levels, battery status, and trends.
- **`/backend`**: Node.js/Express server with MongoDB for data storage and real-time updates via Socket.io.
- **`/mobile`**: React Native (Expo) application for waste collection workers to navigate to full bins.
- **`/hardware`**: ESP32 firmware and sensor integration code.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- ESP32 Hardware (optional for local testing)

### Backend Setup
1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Configure `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/smart-waste
   PORT=5000
   JWT_SECRET=your_secret_key
   ```
4. Start the server: `npm start`

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Update `src/config.js` with your backend server's IP address.
4. Start the dashboard: `npm run dev`

### Mobile Setup
1. Navigate to `mobile/`
2. Install dependencies: `npm install`
3. Start Expo: `npx expo start`

## Features
- Real-time bin fill level monitoring.
- Battery level alerts and health status.
- Predictive analytics for waste generation trends.
- Route optimization and navigation for collection workers.
- Multi-user authentication with Hub-based isolation.
