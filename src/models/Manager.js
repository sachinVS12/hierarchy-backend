const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../config/env");

const managerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Manager name is required"],
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
      required: true,
      index: true,
    },
    role: {
      type: String,
      default: "MANAGER",
      enum: ["MANAGER"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
managerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, config.bcryptRounds);
  next();
});

// Compare password method
managerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Soft delete middleware
managerSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

// Indexes
managerSchema.index({ email: 1, isDeleted: 1 });
managerSchema.index({ companyId: 1, isDeleted: 1 });

module.exports = mongoose.model("Manager", managerSchema);
