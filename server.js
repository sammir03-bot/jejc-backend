const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// =====================
// MongoDB Connection
// =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// =====================
// Contact Schema
// =====================
const ContactSchema = new mongoose.Schema({
  name: String,
  phone: String,
  course: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.model("Contact", ContactSchema);

// =====================
// User Schema
// =====================
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

// =====================
// REGISTER API
// =====================
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newUser = new User({ name, email, phone, password });
    await newUser.save();

    res.status(201).json({
      message: "User Registered Successfully"
    });

  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// =====================
// LOGIN API
// =====================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: "Invalid Email or Password" });
    }

    res.json({
      message: "Login Successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// =====================
// CONTACT API
// =====================
app.post("/api/contact", async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();

    res.status(201).json({
      message: "Data Saved Successfully"
    });

  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// =====================
// Root Test Route
// =====================
app.get("/", (req, res) => {
  res.send("JEJC Backend Running");
});

// =====================
// Server Start
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
