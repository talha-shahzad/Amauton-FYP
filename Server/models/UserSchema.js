const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose; // For defining a Schema

// Define the User schema
const UserSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId, // Explicitly defining _id
        auto: true, // Ensures it is automatically generated
    },
    name: {
        type: String,
        required: true,  // Name is required
    },
    email: {
        type: String,
        required: true,
        unique: true,  // Ensure the email is unique
    },
    contactNumber: {
        type: String,
        required: true,  // Contact number is required
    },
    password: {
        type: String,
        required: true,
    },
});

// Pre-save hook to hash password before saving it to the database
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10); // Generate salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', UserSchema);
