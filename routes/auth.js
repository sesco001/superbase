import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const usersFile = "./data/users.json";

// Signup
router.post("/signup", async (req, res) => {
  const { full_name, email, password, role } = req.body;

  if(role === "admin" && email !== process.env.ADMIN_EMAIL){
    return res.status(403).json({ message: "Only authorized admin email can register as admin" });
  }

  const users = JSON.parse(fs.readFileSync(usersFile));
  if(users.find(u => u.email === email)) return res.status(400).json({ message: "Email exists" });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ id: Date.now(), full_name, email, password: hashed, role });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.json({ message: "Account created", user: { email, role } });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find(u => u.email === email);
  if(!user) return res.status(400).json({ message: "Invalid email" });

  const match = await bcrypt.compare(password, user.password);
  if(!match) return res.status(400).json({ message: "Incorrect password" });

  res.json({ message: "Login successful", user: { email: user.email, role: user.role } });
});

export default router;
