import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from 'http';
import { Server } from 'socket.io';
import driverRoutes from "./routes/driverRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://192.168.0.104:3000",
      "http://103.217.111.218:3000",
      "*"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(
      cors({
          origin: [
            "http://localhost:3000",
            "http://192.168.0.104:3000",
            "http://103.217.111.218:3000",
            "*"
          ],
          methods: ["GET","POST","DELETE","PUT"],
          allowedHeaders: ["Content-Type","Authorization"],
          credentials: true
      })
  );
app.use(express.json()); // JSON body parsing
app.use('/api/driver', driverRoutes); // Driver routes
app.use('/api/customer', customerRoutes); // Customer routes
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/password',passwordRoutes); // Password routes
app.use('/api/rides', rideRoutes); // Ride routes
// Database connection
mongoose.connect(MONGODB_URI).then(()=>console.log("MongoDB is connected")).catch((e) => console.log(e));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Driver joins their ride room
  socket.on('join_ride', (rideId) => {
    socket.join(`ride_${rideId}`);
    console.log(`Socket ${socket.id} joined ride room: ride_${rideId}`);
  });

  // Driver location updates
  socket.on('location_update', (data) => {
    const { rideId, latitude, longitude, heading, speed } = data;
    // Broadcast location to all clients in the ride room
    socket.to(`ride_${rideId}`).emit('driver_location', {
      latitude,
      longitude,
      heading,
      speed,
      timestamp: new Date()
    });
  });

  // Ride status updates
  socket.on('ride_status_update', (data) => {
    const { rideId, status, message } = data;
    socket.to(`ride_${rideId}`).emit('ride_status_changed', {
      status,
      message,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Ride-sharing Server running on port ${PORT}`);
});