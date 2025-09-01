const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database
const db = new sqlite3.Database("./assignments.db", (err) => {
  if (err) console.error(err.message);
  else console.log("✅ Connected to SQLite database.");
});

// Create tables
db.run(`CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  password TEXT,
  university TEXT,
  role TEXT DEFAULT 'student'
)`);

db.run(`CREATE TABLE IF NOT EXISTS assignments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT,
  file TEXT,
  status TEXT DEFAULT 'Pending',
  paid INTEGER DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// Register
app.post("/api/register", (req, res) => {
  const { email, password, university } = req.body;
  db.run(
    "INSERT INTO users(email, password, university) VALUES(?,?,?)",
    [email, password, university],
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ message: "Registered successfully", id: this.lastID });
    }
  );
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, row) => {
      if (row) res.json(row);
      else res.status(401).json({ error: "Invalid credentials" });
    }
  );
});

// Submit assignment
app.post("/api/submit", (req, res) => {
  const { user_id, title, file } = req.body;
  db.run(
    "INSERT INTO assignments(user_id, title, file) VALUES(?,?,?)",
    [user_id, title, file],
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else {
        // Email admin
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: "YOUR_EMAIL@gmail.com", pass: "YOUR_PASSWORD" }
        });

        transporter.sendMail({
          from: "YOUR_EMAIL@gmail.com",
          to: "ADMIN_EMAIL@gmail.com",
          subject: "New Assignment Submitted",
          text: `Assignment "${title}" has been submitted.`
        });

        res.json({ 
          message: "Assignment submitted! Please proceed to payment.",
          id: this.lastID 
        });
      }
    }
  );
});

// Payment placeholder (STK Push redirect)
app.get("/api/pay/:assignmentId", (req, res) => {
  const assignmentId = req.params.assignmentId;

  // 👇 Replace this with your real Mpesa STK Push link
  const paymentLink = "https://your-mpesa-stk-push-link.com";

  // Mark as "Payment initiated"
  db.run("UPDATE assignments SET status=?, paid=? WHERE id=?", 
    ["Awaiting Payment", 0, assignmentId], 
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ 
        message: "Redirecting to payment...",
        payment_url: paymentLink
      });
    }
  );
});

// Admin view assignments
app.get("/api/assignments", (req, res) => {
  db.all("SELECT * FROM assignments", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Update assignment status (e.g., Processing, Completed)
app.post("/api/update-status", (req, res) => {
  const { id, status } = req.body;
  db.run("UPDATE assignments SET status=? WHERE id=?", [status, id], function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ message: "Status updated!" });
  });
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
