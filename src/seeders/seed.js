const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../config/env");
const Company = require("../models/Company");
const Manager = require("../models/Manager");
const User = require("../models/User");
const Role = require("../models/Role");
const Tag = require("../models/Tag");

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB for seeding");

    // Clear existing data
    await Company.deleteMany({});
    await Manager.deleteMany({});
    await User.deleteMany({});
    await Tag.deleteMany({});
    console.log("Cleared existing data");

    // Seed roles
    await Role.seedRoles();

    // Create SUPER_ADMIN user
    const hashedPassword = await bcrypt.hash("Admin@123", config.bcryptRounds);

    const superAdminUser = await User.create({
      name: "Super Admin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      companyId: new mongoose.Types.ObjectId(), // Placeholder, will be updated
      managerId: new mongoose.Types.ObjectId(), // Placeholder, will be updated
      createdBy: null,
    });

    console.log("Super Admin created");

    // Create a company
    const company = await Company.create({
      name: "TechCorp",
      description: "Leading technology company",
      status: true,
      createdBy: superAdminUser._id,
    });

    // Update SUPER_ADMIN with company ID
    await User.findByIdAndUpdate(superAdminUser._id, {
      companyId: company._id,
      managerId: null,
    });

    // Create a manager
    const managerPassword = await bcrypt.hash(
      "Manager@123",
      config.bcryptRounds,
    );
    const manager = await Manager.create({
      name: "John Manager",
      email: "manager@techcorp.com",
      password: managerPassword,
      companyId: company._id,
      role: "MANAGER",
      createdBy: superAdminUser._id,
    });

    // Create a user
    const userPassword = await bcrypt.hash("User@123", config.bcryptRounds);
    const user = await User.create({
      name: "Jane User",
      email: "user@techcorp.com",
      password: userPassword,
      companyId: company._id,
      managerId: manager._id,
      role: "USER",
      createdBy: superAdminUser._id,
    });

    console.log("Manager and User created");

    // Create a tag
    const tag = await Tag.create({
      tagPath: "techcorp/d/example",
      topic: "example",
      companyId: company._id,
      managerId: manager._id,
      userId: user._id,
      createdBy: user._id,
    });

    console.log("Tag created");

    console.log("\n=== Seeding Complete ===");
    console.log("Super Admin Email: superadmin@example.com");
    console.log("Super Admin Password: Admin@123");
    console.log("\nManager Email: manager@techcorp.com");
    console.log("Manager Password: Manager@123");
    console.log("\nUser Email: user@techcorp.com");
    console.log("User Password: User@123");
    console.log("\nCompany ID:", company._id);
    console.log("Manager ID:", manager._id);
    console.log("User ID:", user._id);
    console.log("Tag ID:", tag._id);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
