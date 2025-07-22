import express from "express";
import { config } from 'dotenv';

config();

const app = express();
app.use(express.json());


app.use((req, res) => {
  res.status(404).json({ 
    error: "Not Found",
    success: false,
    message: "The requested resource was not found"
  });
});

const port = parseInt(process.env.PORT as string) || 5500;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
