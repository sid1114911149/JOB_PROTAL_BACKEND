const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotEnv = require('dotenv');
dotEnv.config();
const secretKey = process.env.WhatisYourName;
const register = async (req, res) => {
    try {
        const { fullName, email, phoneNo, password, role } = req.body;

        if (!fullName || !email || !phoneNo || !password || !role) {
            return res.status(400).json({
                message: "Something is missing...",
                success: false
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                message: "Email already exists",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        let profilePhoto = "";
        let resume = "";

        // ✅ handle multiple files
        if (req.files?.profilePhoto) {
            profilePhoto = `/uploads/${req.files.profilePhoto[0].filename}`;
        }

        if (req.files?.resume) {
            resume = `/uploads/${req.files.resume[0].filename}`;
        }

        const user = await User.create({
            fullName,
            email,
            phoneNo,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto,
                resume   // ✅ added
            }
        });

        return res.status(201).json({
            message: "User created successfully",
            user,
            success: true
        });

    } catch (error) {
        console.log(error);

        // ✅ handle multer errors (file size etc.)
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "File size must be less than 500KB",
                success: false
            });
        }

        return res.status(500).json({
            message: error.message || "User not created",
            success: false
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing...",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "No user found",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Password incorrect",
                success: false
            });
        }

        if (role !== user.role) {
            return res.status(401).json({
                message: "Role mismatch",
                success: false
            });
        }

        const loginToken = jwt.sign(
            { userId: user._id },
            secretKey,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: "Login successful",
            token: loginToken,
            user,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Login failed",
            success: false
        });
    }
};
const logout = async (req, res) => {
    return res.status(200).json({
        message: "Logged out successfully",
        success:true
    });
};
const edit = async (req, res) => {
    try {
        const { fullName, email, phoneNo, password, role } = req.body;

        if (!fullName || !email || !phoneNo || !password || !role) {
            return res.status(400).json({
                message: "Something is missing...",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const updatedUser = await User.findOneAndUpdate(
            { email },
            {
                fullName,
                phoneNo,
                password: hashedPassword,
                role
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error updating user",
            success: false
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { fullName, email, phoneNo, bio, skills } = req.body;

        const skillArray = skills
            ? skills.split(',').map(s => s.trim()).filter(s => s)
            : [];

        const updateData = {};

        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (phoneNo) updateData.phoneNo = phoneNo;
        if (bio) updateData["profile.bio"] = bio;
        if (skills) updateData["profile.skills"] = skillArray;

        if (req.file) {
            updateData["profile.profilePhoto"] = `/uploads/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { returnDocument: 'after' }
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
module.exports = { register, login, logout, edit, updateProfile };