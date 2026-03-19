const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const binRoutes = require('./routes/binRoutes');
const profileRoutes = require('./routes/profileRoutes');
const Bin = require('./models/Bin');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/profile', profileRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('Smart Waste Management API is running. Access /api/status for health check.');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    
    socket.on('joinHub', (hubId) => {
        console.log(`Client ${socket.id} joined hub: ${hubId}`);
        socket.join(hubId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Basic Test Route
app.get('/api/status', (req, res) => {
    res.json({ message: 'Backend system is online and ready.', status: 'Active' });
});

// Port Configuration
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server initialized on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Local Access: http://localhost:${PORT}`);
    }
});