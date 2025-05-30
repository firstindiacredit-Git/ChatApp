import User from "../model/UserModel.js"; // Import User schema
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Admin registering a new user
export const registerUser = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    const adminUser = req.user;
    if (adminUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only granted." });
    }

    // Destructure fields from request body
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Hash the password using bcrypt (industry standard)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user document
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || "user",
      isApproved: true,
      profileSetup: false,
      createdAt: new Date()
    };

    // Insert directly to bypass middleware
    await User.collection.insertOne(newUser);

    // Return success response without the sensitive data
    res.status(201).json({ 
      message: "User registered successfully", 
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      } 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Fetch all users (optional, for admin use)
export const getAllUsers = async (req, res) => {
  try {
    const adminUser = req.user;
    if (adminUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only are granted." });
    }

    const users = await User.find({}).select("-password"); // Exclude passwords for security
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};


//////////////////////////////////////////////OLD code//////////////////////////////////
{/* import User from "../model/UserModel.js"; // Import User schema
import bcrypt from "bcrypt";

// Admin registering a new user
export const registerUser = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    const adminUser = req.user;
    if (adminUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only granted." });
    }

    // Destructure fields from request body
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Create new user instance
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || "user", // Default to 'user' role
      isApproved: true, // Since admin is creating the user, approval is automatic
    });

    // Save user in the database
    await newUser.save();

    // Return success response
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Fetch all users (optional, for admin use)
export const getAllUsers = async (req, res) => {
  try {
    const adminUser = req.user;
    if (adminUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only are granted." });
    }

    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
}; */}
