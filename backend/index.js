const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const chatRoute = require("./routes/chat");
const careerRoute = require("./routes/carrer");
const studentRoute = require("./routes/studentRoute");
const authRoutes = require("./routes/authRoute");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

app.use("/api/chat", chatRoute);
app.use("/api/career", careerRoute);
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoute);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
  
  
