import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import assignmentRoutes from "./routes/assignments.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
