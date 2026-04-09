
const { userModel } = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userController = {
    getUser: async (req, res) => {
        try {
            const users = await userModel.find({}, "-password");
            res.status(200).json({ users });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    },


    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const existing = await userModel.findOne({ email });
            if (existing) {
                return res.status(409).json({ message: "Email already registered" });
            }
            const hash = await bcrypt.hash(password, 10);
            const user = await userModel.create({ name, email, password: hash });
            res.status(201).json({ message: "User registered successfully", user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    },

   
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password required" });
            }
            const user = await userModel.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.status(200).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    },

    logout: (req, res) => {
        res.clearCookie("token");
        res.status(200).json({ message: "Logged out" });
    },

    profile: async (req, res) => {
        try {
            const user = await userModel.findById(req.user.userId, "-password");
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json({ user });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    },

    update: async (req, res) => {
        try {
            const { name, password } = req.body;
            const updateData = {};
            if (name) updateData.name = name;
            if (password) updateData.password = await bcrypt.hash(password, 10);
            const user = await userModel.findByIdAndUpdate(req.user.userId, updateData, { new: true, select: "-password" });
            res.status(200).json({ message: "Profile updated", user });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await userModel.findByIdAndDelete(id);
            res.status(200).json({ message: "User deleted" });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    }
};


module.exports = {userController};