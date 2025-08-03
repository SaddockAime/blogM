import express from "express";
import { config } from 'dotenv';
import { Database } from "./database";
import { routers } from "./routes";
import { redis } from "./utils/redis";
import { notificationService } from "./utils/notificationService";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./docs/swagger.json";
import cors from 'cors';
import helmet from 'helmet';

config();

const app = express();

app.use(helmet());

app.use(cors({
  origin: "http://localhost:5500",
  credentials: true
}));

app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint for Docker
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

app.use(routers);

app.use((req, res) => {
  res.status(404).json({ 
    error: "Not Found",
    success: false,
    message: "The requested resource was not found"
  });
});

const port = parseInt(process.env.PORT as string) || 5500;

redis.connect().catch(console.error);

Database.database.authenticate().then(async () => {
    try {
      // Initialize notification service (RabbitMQ + Email Worker)
      await notificationService.initialize();
      
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    } catch (error) {
      console.log("Error initializing notification service:", error);
    }
  }).catch((error) => {
    console.log("Database connection failed:", error);
});

export { app }