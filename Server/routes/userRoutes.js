const express = require('express');
const router = express.Router();
const User = require('../models/UserSchema');
const verifyToken = require('../middleware/auth');
// Get user by ID
router.get('/:id',verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name email contactNumber');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update user
router.put('/:id',verifyToken, async (req, res) => {
    const { name, email, contactNumber, password } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (contactNumber) user.contactNumber = contactNumber;
        if (password) user.password = password;

        await user.save();
        res.json({ success: true, message: 'User updated', user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
