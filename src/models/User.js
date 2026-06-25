const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../config/env");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
      index: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manager",
      required: function () {
        // Manager is required for USER role, but not for SUPER_ADMIN
        return this.role !== "SUPER_ADMIN";
      },
      index: true,
    },
    role: {
      type: String,
      default: "USER",
      enum: ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER", "USER"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        // createdBy is not required for SUPER_ADMIN (system created)
        return this.role !== "SUPER_ADMIN";
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, config.bcryptRounds);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Soft delete middleware
userSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

// Indexes
userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ companyId: 1, managerId: 1 });
userSchema.index({ managerId: 1, isDeleted: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
