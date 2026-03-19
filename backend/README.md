# Smart Waste Management - Backend Service

This is the central Node.js/Express server that handles data from IoT sensors, manages user authentication, and provides real-time updates via Socket.io.

## Tech Stack
- **Node.js**: Runtime environment
- **Express**: Web framework for API routes
- **MongoDB**: Database for bins, history, and users
- **Socket.io**: Real-time bidirectional communication
- **JWT**: Secure authentication

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new hub/user
- `POST /api/auth/login`: Authenticate and get a JWT token

### Bins
- `GET /api/bins`: Fetch all bins for the authenticated user
- `POST /api/bins`: Register a new smart bin
- `PATCH /api/bins/:hardwareId`: Update bin status (fill level, battery)
- `DELETE /api/bins/:hardwareId`: Remove a bin from the system

## Setup
1. `npm install`
2. Create `.env` file with `MONGODB_URI` and `PORT`.
3. `npm start` to run the server.

Use `npm run seed` to populate with sample data (if configured).
