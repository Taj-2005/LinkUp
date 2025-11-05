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

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

const allowedOrigins = ["http://localhost:3000", /\.vercel\.app$/];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.some((pattern) =>
          pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
        )
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS: " + origin));
    },
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
