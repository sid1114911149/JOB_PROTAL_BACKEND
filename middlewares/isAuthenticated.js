const User = require('../models/User');
const jwt = require('jsonwebtoken');

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authorization token required" ,success:true});
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.WhatisYourName);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found",success:false });
    }

    req.userId = decoded.userId;
    next();

  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid or expired token",success:false });
  }
};

module.exports = isAuthenticated;
