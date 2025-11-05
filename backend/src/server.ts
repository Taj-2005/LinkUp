import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import { connectDB } from "./config/db"

dotenv.config();

const app = express();
const PORT = 6969

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.NEXT_FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes)
app.use("/api", protectedRoutes)

app.listen( PORT, () => {
    connectDB().then(() => console.log(`Server listening on http://localhost:${PORT}`))
})