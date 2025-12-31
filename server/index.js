import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import cors from 'cors'
import express from 'express';
import "express-async-error"

import router from './routes/route.js';
import connectDB from './db/connect.js'
import errorHandler from './middleware/errorHandler.js';

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url));;
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json({limit: "50mb"})) //increase deafult limit so that the backend can accept large payloads

// You can remove this when in production if you're combining your frontend and backend together into a single webpage.
if(process.env.NODE_ENV !== "production"){
  app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }))
}

app.use("/api/v1", router);
// console.log("Before working")
// console.log(process.env.NODE_ENV, " length: ", process.env.NODE_ENV.length)
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../client/dist");  
  app.use(express.static(clientDistPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(clientDistPath, "index.html"));
  });
}

app.use(errorHandler)

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit with failure code
  }
};

startServer()
