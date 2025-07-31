import express from "express";
import { config } from 'dotenv';
import { Database } from "./database";
import { routers } from "./routes";
import { redis } from "./utils/redis";
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

Database.database.authenticate().then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }).catch((error) => {
    console.error("Database connection failed:", error);
});

export { app }