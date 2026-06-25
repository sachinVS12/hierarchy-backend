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
    // Connect with updated options
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("Connected to MongoDB for seeding");

    // Clear existing data
    await Company.deleteMany({});
    await Manager.deleteMany({});
    await User.deleteMany({});
    await Tag.deleteMany({});
    await Role.deleteMany({});
    console.log("Cleared existing data");

    // Seed roles
    await Role.seedRoles();

    console.log("Roles seeded successfully");

    // Create SUPER_ADMIN user first (with a placeholder companyId)
    const hashedPassword = await bcrypt.hash("Admin@123", config.bcryptRounds);

    // Create a temporary ObjectId for the company placeholder
    const tempCompanyId = new mongoose.Types.ObjectId();
    const tempManagerId = new mongoose.Types.ObjectId();

    const superAdminUser = await User.create({
      name: "Super Admin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      companyId: tempCompanyId, // Temporary, will be updated
      managerId: null,
      createdBy: null, // Super admin created by system
    });

    console.log("Super Admin created");

    // Now create the company with the super admin as createdBy
    const company = await Company.create({
      name: "TechCorp",
      description: "Leading technology company",
      status: true,
      createdBy: superAdminUser._id,
    });

    console.log("Company created");

    // Update SUPER_ADMIN with the actual company ID
    await User.findByIdAndUpdate(superAdminUser._id, {
      companyId: company._id,
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

    console.log("Manager created");

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

    console.log("User created");

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
    console.log("=====================================");
    console.log("Super Admin Email: superadmin@example.com");
    console.log("Super Admin Password: Admin@123");
    console.log("=====================================");
    console.log("Manager Email: manager@techcorp.com");
    console.log("Manager Password: Manager@123");
    console.log("=====================================");
    console.log("User Email: user@techcorp.com");
    console.log("User Password: User@123");
    console.log("=====================================");
    console.log("Company ID:", company._id.toString());
    console.log("Manager ID:", manager._id.toString());
    console.log("User ID:", user._id.toString());
    console.log("Tag ID:", tag._id.toString());
    console.log("=====================================");

    await mongoose.disconnect();
    console.log("Database disconnected");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
