import mongoose from "mongoose";
import Channel from "../model/ChannelModel.js";
import User from "../model/UserModel.js";

export const createChannel = async (request, response, next) => {
  try {
    const { name, members } = request.body;
    const userId = request.userId;
    const admin = await User.findById(userId);
    if (!admin) {
      return response.status(400).json({ message: "Admin user not found." });
    }

    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return response
        .status(400)
        .json({ message: "Some members are not valid users." });
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();

    return response.status(201).json({ channel: newChannel });
  } catch (error) {
    console.error("Error creating channel:", error);
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserChannels = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return res.status(200).json({ channels });
  } catch (error) {
    console.error("Error getting user channels:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const messages = channel.messages;
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error getting channel messages:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChannelMembers = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId;

    // Find the channel and check if the requesting user is a member or admin
    const channel = await Channel.findById(channelId);
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if the user is a member or admin of the channel
    const isMember = channel.members.includes(userId) || channel.admin.toString() === userId;
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this channel" });
    }

    // Get the channel with populated member details
    const channelWithMembers = await Channel.findById(channelId)
      .populate({
        path: "members",
        select: "firstName lastName email image color _id"
      })
      .populate({
        path: "admin",
        select: "firstName lastName email image color _id"
      });

    // Combine admin and members for the response
    const adminData = channelWithMembers.admin;
    const members = channelWithMembers.members;
    
    // Make sure admin is included in the members list (if not already there)
    const adminIncluded = members.some(member => member._id.toString() === adminData._id.toString());
    
    const allMembers = adminIncluded 
      ? members 
      : [adminData, ...members];

    return res.status(200).json({ 
      members: allMembers,
      admin: adminData._id 
    });
    
  } catch (error) {
    console.error("Error getting channel members:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
