const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/UserSchema');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');
const dotenv = require('dotenv');
dotenv.config();
// Signup route
router.post('/signup',verifyToken, async (req, res) => {
    const { name, email, password, contactNumber } = req.body;

    // validations...

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'Email already exists.' });

        const newUser = new User({ name, email, password, contactNumber });
        await newUser.save();
        res.status(201).json({ success: true, message: 'Account created successfully!' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.json({ success: true, token, userId: user._id });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
