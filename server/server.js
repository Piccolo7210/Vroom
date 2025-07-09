import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import driverRoutes from "./routes/driverRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
dotenv.config();

const app = express();
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(
      cors({
          origin: process.env.CLIENT_URL,
          methods: ["GET","POST","DELETE","PUT"],
          allowedHeaders: ["Content-Type","Authorization"],
      })
  );
app.use(express.json()); // JSON body parsing
app.use('/api/driver', driverRoutes); // Driver routes
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes)
app.use('/api/password',passwordRoutes); // Customer routes
// Database connection
mongoose.connect(MONGODB_URI).then(()=>console.log("MongoDB is connected")).catch((e) => console.log(e));
// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Rider Server running on port ${PORT}`);
});