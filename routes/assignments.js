import express from "express";
import multer from "multer";
import fs from "fs";
import { sendEmail } from "../utils/email.js";

const router = express.Router();
const assignmentsFile = "./data/assignments.json";
const upload = multer({ dest: "uploads/" });

// Submit assignment
router.post("/submit", upload.single("file"), (req, res) => {
  const { title, link, email } = req.body;
  const file_url = req.file ? req.file.path : null;

  const assignments = JSON.parse(fs.readFileSync(assignmentsFile));
  const id = Date.now();
  assignments.push({ id, title, link, file_url, email, status: "Pending", paid: false, solution: null });
  fs.writeFileSync(assignmentsFile, JSON.stringify(assignments, null, 2));

  sendEmail(process.env.ADMIN_EMAIL, "New Assignment Submitted", `Assignment "${title}" submitted by ${email}`);
  res.json({ message: "Assignment submitted", id });
});

// Get assignments for user
router.get("/:email", (req, res) => {
  const { email } = req.params;
  const assignments = JSON.parse(fs.readFileSync(assignmentsFile));
  const userAssignments = assignments.filter(a => a.email === email);
  res.json(userAssignments);
});

export default router;
