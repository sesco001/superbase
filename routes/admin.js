import express from "express";
import multer from "multer";
import fs from "fs";
import { sendEmail } from "../utils/email.js";

const router = express.Router();
const assignmentsFile = "./data/assignments.json";
const upload = multer({ dest: "uploads/" });

// Get all assignments
router.get("/assignments", (req, res) => {
  const assignments = JSON.parse(fs.readFileSync(assignmentsFile));
  res.json(assignments);
});

// Mark paid
router.post("/mark-paid", (req, res) => {
  const { id } = req.body;
  const assignments = JSON.parse(fs.readFileSync(assignmentsFile));
  const assignment = assignments.find(a => a.id == id);
  if(!assignment) return res.status(404).json({ message: "Assignment not found" });

  assignment.paid = true;
  fs.writeFileSync(assignmentsFile, JSON.stringify(assignments, null, 2));
  sendEmail(assignment.email, "Payment Confirmed", `Your assignment "${assignment.title}" is now paid.`);
  res.json({ message: "Marked as paid", assignment });
});

// Upload solution
router.post("/upload-solution", upload.single("file"), (req, res) => {
  const { id, link } = req.body;
  const file_url = req.file ? req.file.path : null;
  const assignments = JSON.parse(fs.readFileSync(assignmentsFile));
  const assignment = assignments.find(a => a.id == id);
  if(!assignment) return res.status(404).json({ message: "Assignment not found" });

  assignment.solution = { link, file_url };
  fs.writeFileSync(assignmentsFile, JSON.stringify(assignments, null, 2));
  sendEmail(assignment.email, "Solution Uploaded", `Your assignment "${assignment.title}" now has a solution.`);
  res.json({ message: "Solution uploaded", assignment });
});

export default router;
