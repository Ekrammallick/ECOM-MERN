import mongoose from "mongoose";
import bcrypt from "bcrypt";

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Full name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"] // Email format validation
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    cartItems: [
        {
            quantity: {
                type: Number,
                default: 1
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ],
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: "customer"
    }
}, {
    timestamps: true
});

// Pre-save hook for hashing password before saving to DB
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // If password hasn't been modified, skip hashing
    
    try {
        const salt = await bcrypt.genSalt(10);  // Generate salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next();
    } catch (error) {
        console.error("Error while hashing password:", error.message);
        next(error);  // Pass error to next middleware
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password); // Compare input password with stored hashed password
};

// Create and export the User model
const User = mongoose.model("User", userSchema);

export default User;
