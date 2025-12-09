const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ================== BASE DE DATOS ==================
const dbPath = path.join(__dirname, "data", "medicitas.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    db.run(`CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        specialty TEXT,
        phone TEXT,
        email TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS offices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT,
        floor TEXT,
        capacity INTEGER,
        equipment TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        phone TEXT,
        email TEXT,
        address TEXT,
        medicalHistory TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER,
        doctorId INTEGER,
        officeId INTEGER,
        date TEXT,
        time TEXT,
        reason TEXT,
        status TEXT DEFAULT 'scheduled',
        FOREIGN KEY(patientId) REFERENCES patients(id),
        FOREIGN KEY(doctorId) REFERENCES doctors(id),
        FOREIGN KEY(officeId) REFERENCES offices(id)
    )`);
});

// ================== ENDPOINTS ==================

// GET
app.get("/doctors", (req, res) => {
    db.all("SELECT * FROM doctors", [], (err, rows) => res.json(rows));
});

app.get("/offices", (req, res) => {
    db.all("SELECT * FROM offices", [], (err, rows) => res.json(rows));
});

app.get("/patients", (req, res) => {
    db.all("SELECT * FROM patients", [], (err, rows) => res.json(rows));
});

app.get("/appointments", (req, res) => {
    db.all("SELECT * FROM appointments", [], (err, rows) => res.json(rows));
});

// POST
app.post("/doctors", (req, res) => {
    const d = req.body;
    db.run(
        "INSERT INTO doctors (name, specialty, phone, email) VALUES (?, ?, ?, ?)",
        [d.name, d.specialty, d.phone, d.email],
        function () { res.json({ id: this.lastID }); }
    );
});

app.post("/offices", (req, res) => {
    const o = req.body;
    db.run(
        "INSERT INTO offices (number, floor, capacity, equipment) VALUES (?, ?, ?, ?)",
        [o.number, o.floor, o.capacity, o.equipment],
        function () { res.json({ id: this.lastID }); }
    );
});

app.post("/patients", (req, res) => {
    const p = req.body;
    db.run(
        "INSERT INTO patients (name, age, phone, email, address, medicalHistory) VALUES (?, ?, ?, ?, ?, ?)",
        [p.name, p.age, p.phone, p.email, p.address, p.medicalHistory],
        function () { res.json({ id: this.lastID }); }
    );
});

app.post("/appointments", (req, res) => {
    const a = req.body;
    db.run(
        "INSERT INTO appointments (patientId, doctorId, officeId, date, time, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [a.patientId, a.doctorId, a.officeId, a.date, a.time, a.reason, a.status],
        function () { res.json({ id: this.lastID }); }
    );
});

// ================== SERVER ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on PORT", PORT));
