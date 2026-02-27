import bcrypt from "bcrypt";
import {connectDB} from "../config/db.js";

const db = await connectDB();
const usersCollection = db.collection("users");

const signUpController = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }


    const userex = await usersCollection.findOne({ email });
    if (userex) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(user);

    return res.status(201).json({ message: "User created successfully" });
  }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal server error" });
  }
};

const loginController = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    return res.status(200).json({
      message: "Login successful",
      user: { username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logoutController = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out successfully" });
  });
};

const isAuthenticated = (req, res) => {
  if (req.session.user) {
    return res
      .status(200)
      .json({ authenticated: true, user: req.session.user });
  }
  return res.status(401).json({ authenticated: false });
};

export { signUpController, loginController, logoutController, isAuthenticated };
