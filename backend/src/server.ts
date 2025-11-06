import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import { connectDB } from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6969;
const isProd = process.env.NODE_ENV === "production";
const FRONTEND_URL = process.env.NEXT_FRONTEND_URL

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());


app.use(
  cors({
    origin: isProd
      ? FRONTEND_URL
      : "http://localhost:3000",
    credentials: true,
  })
);


app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
