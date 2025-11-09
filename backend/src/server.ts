import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import { connectDB } from "./config/db";

dotenv.config();
connectDB()

const app = express();
const PORT = process.env.PORT || 6969;

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());


app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/\.vercel\.app$/.test(origin) || origin === "http://localhost:3000") {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));


app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

export default app;