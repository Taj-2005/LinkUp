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
  origin: ["https://link-up-web.vercel.app", "http://localhost:3000"],
  credentials: true
}));


app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

if (process.env.NODE_ENV !== "production"){
  app.listen(6969, () => {
    console.log(`Server listening at http://localhost:6969`)
  })
}

export default app;
