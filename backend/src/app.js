import express from "express"; 
import authRoutes from "./routes/auth.routes.js"; // Authentication routes for registration, login, and profile management
import predictionRoutes from "./routes/prediction.routes.js"; // Prediction routes for both /predictions and /prediction
import adminRoutes from "./routes/admin.routes.js"; // Admin-specific routes for user management and analytics
import userRoutes from "./routes/user.routes.js"; // User management routes 
import errorMiddleware from "./middleware/error.middleware.js"; // Centralized error handling middleware
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js'; // Rate limiting middleware
import helmet from "helmet"; // Security headers
import cors from "cors"; // CORS protection for frontend-backend communication

import mlRoutes from './routes/ml.routes.js'; // ML model routes
import settingsRoutes from './routes/settings.routes.js'; // Admin settings routes

const app = express();

// CORS Protection for frontend-backend communication
app.use( 
  cors({
    origin: "http://localhost:5173", //  frontend URL later we will add website URL on production
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(helmet()); // Security headers


// Rate limiting
app.use(generalLimiter);          
app.use('/api/auth', authLimiter); 


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/prediction", predictionRoutes); // backward compatibility
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ml", mlRoutes);

// Error handler
app.use(errorMiddleware);

export default app;