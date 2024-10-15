import jwt from "jsonwebtoken";
import User from "../model/UserModel.js";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs";

// JWT token max age (3 days)
const maxAge = 3 * 24 * 60 * 60 * 1000;

// Create JWT token with email, userId, and role
const createToken = (email, userId, role) => {
  return jwt.sign({ email, userId, role }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};


// Disable or restrict public signup
export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await User.create({ email, password });
      const token = createToken(email, user.id, user.role);
      res.cookie("jwt", token, {
        maxAge,
        secure: true,
        sameSite: "None",
      });

      return res.status(201).json({
        token,
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          profileSetup: user.profileSetup,
          role: user.role,
        },
      });
    } else {
      return res.status(400).send("Email and Password Required");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

// Login function
// Login function
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).send("User not found");
      }

      const auth = await compare(password, user.password);
      if (!auth) {
        return res.status(400).send("Invalid Password");
      }

      const token = createToken(email, user.id, user.role);
      res.cookie("jwt", token, {
        maxAge,
        secure: true,
        sameSite: "None",
      });

      return res.status(200).json({
        token,
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          image: user?.image,
          profileSetup: user?.profileSetup,
          role: user?.role,
        },
      });
    } else {
      return res.status(400).send("Email and Password Required");
    }
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

// Get user information by userId
export const getUserInfo = async (request, response, next) => {
  try {
    if (request.userId) {
      const userData = await User.findById(request.userId);
      if (userData) {
        return response.status(200).json({
          id: userData?.id,
          email: userData?.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          image: userData.image,
          profileSetup: userData.profileSetup,
          color: userData.color,
          role: userData.role, // Include role in the user info
        });
      } else {
        return response.status(404).send("User with the given id not found.");
      }
    } else {
      return response.status(404).send("User id not found.");
    }
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

// Logout function
export const logout = async (request, response, next) => {
  try {
    response.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    return response.status(200).send("Logout successful");
  } catch (err) {
    return response.status(500).send("Internal Server Error");
  }
};

// Update user profile function
export const updateProfile = async (request, response, next) => {
  try {
    const { userId } = request;
    const { firstName, lastName, color } = request.body;

    if (!userId) {
      return response.status(400).send("User ID is required.");
    }

    if (!firstName || !lastName) {
      return response.status(400).send("Firstname and Lastname are required.");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      profileSetup: userData.profileSetup,
      color: userData.color,
    });
  } catch (error) {
    return response.status(500).send("Internal Server Error.");
  }
};

// Add profile image function
export const addProfileImage = async (request, response, next) => {
  try {
    if (request.file) {
      const date = Date.now();
      let fileName = "uploads/profiles/" + date + request.file.originalname;
      renameSync(request.file.path, fileName);
      const updatedUser = await User.findByIdAndUpdate(
        request.userId,
        { image: fileName },
        {
          new: true,
          runValidators: true,
        }
      );
      return response.status(200).json({ image: updatedUser.image });
    } else {
      return response.status(404).send("File is required.");
    }
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error.");
  }
};

// Remove profile image function
export const removeProfileImage = async (request, response, next) => {
  try {
    const { userId } = request;

    if (!userId) {
      return response.status(400).send("User ID is required.");
    }

    const user = await User.findById(userId);

    if (!user) {
      return response.status(404).send("User not found.");
    }

    if (user.image) {
      unlinkSync(user.image);
    }

    user.image = null;
    await user.save();

    return response
      .status(200)
      .json({ message: "Profile image removed successfully." });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error.");
  }
};
