const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;  // Use PORT environment variable

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// Azure SQL configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Use encryption for Azure SQL
    trustServerCertificate: false, // Recommended for production
  },
};

// API Route to handle form submission
app.post("/api/mentee-onboarding", async (req, res) => {
  const { jobTitle, verticals, persona, intent } = req.body;

  try {
    // Connect to the database
    const pool = await sql.connect(dbConfig);

    // Insert form data into the database
    await pool.request()
      .input("jobTitle", sql.NVarChar, jobTitle)
      .input("verticals", sql.NVarChar, verticals.join(","))
      .input("persona", sql.NVarChar, persona)
      .input("intent", sql.NVarChar, intent)
      .query(
        `INSERT INTO MenteeOnboarding (JobTitle, Verticals, Persona, Intent)
         VALUES (@jobTitle, @verticals, @persona, @intent)`
      );

    res.status(200).send("Form data submitted successfully.");
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Failed to submit form data.");
  } finally {
    sql.close(); // Close the database connection
  }
});
app.get("/submissions", async (req, res) => {
  try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
          .request()
          .query("SELECT * FROM OnboardingForm");

      res.status(200).json(result.recordset);
  } catch (err) {
      console.error("Error fetching submissions: ", err);
      res.status(500).json({ error: "Internal server error" });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
