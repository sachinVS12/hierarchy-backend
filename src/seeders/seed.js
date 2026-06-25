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

    // Clear existing data (in correct order to avoid foreign key issues)
    await Tag.deleteMany({});
    await User.deleteMany({});
    await Manager.deleteMany({});
    await Company.deleteMany({});
    await Role.deleteMany({});
    console.log("Cleared existing data");

    // Seed roles
    await Role.seedRoles();

    console.log("Roles seeded successfully");

    // Create SUPER_ADMIN user (system user)
    const hashedPassword = await bcrypt.hash("Admin@123", config.bcryptRounds);

    // Create a placeholder company ID for super admin
    const tempCompanyId = new mongoose.Types.ObjectId();

    // Create SUPER_ADMIN user with minimal required fields
    const superAdminUser = await User.create({
      name: "Super Admin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      companyId: tempCompanyId, // Temporary, will be updated
      // managerId is not required for SUPER_ADMIN (conditional required)
      // createdBy is not required for SUPER_ADMIN (conditional required)
    });

    console.log("Super Admin created with ID:", superAdminUser._id);

    // Create the company with the super admin as createdBy
    const company = await Company.create({
      name: "TechCorp",
      description: "Leading technology company",
      status: true,
      createdBy: superAdminUser._id,
    });

    console.log("Company created with ID:", company._id);

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

    console.log("Manager created with ID:", manager._id);

    // Create a regular user
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

    console.log("User created with ID:", user._id);

    // Create a company admin user
    const companyAdminPassword = await bcrypt.hash(
      "CompanyAdmin@123",
      config.bcryptRounds,
    );
    const companyAdmin = await User.create({
      name: "Company Admin",
      email: "companyadmin@techcorp.com",
      password: companyAdminPassword,
      companyId: company._id,
      managerId: null, // Company admin doesn't need a manager
      role: "COMPANY_ADMIN",
      createdBy: superAdminUser._id,
    });

    console.log("Company Admin created with ID:", companyAdmin._id);

    // Create a tag
    const tag = await Tag.create({
      tagPath: "techcorp/d/example",
      topic: "example",
      companyId: company._id,
      managerId: manager._id,
      userId: user._id,
      createdBy: user._id,
    });

    console.log("Tag created with ID:", tag._id);

    console.log("\n=== Seeding Complete ===");
    console.log("=====================================");
    console.log("SUPER ADMIN CREDENTIALS:");
    console.log("Email: superadmin@example.com");
    console.log("Password: Admin@123");
    console.log("=====================================");
    console.log("COMPANY ADMIN CREDENTIALS:");
    console.log("Email: companyadmin@techcorp.com");
    console.log("Password: CompanyAdmin@123");
    console.log("=====================================");
    console.log("MANAGER CREDENTIALS:");
    console.log("Email: manager@techcorp.com");
    console.log("Password: Manager@123");
    console.log("=====================================");
    console.log("USER CREDENTIALS:");
    console.log("Email: user@techcorp.com");
    console.log("Password: User@123");
    console.log("=====================================");
    console.log("IDs:");
    console.log("Company ID:", company._id.toString());
    console.log("Super Admin ID:", superAdminUser._id.toString());
    console.log("Company Admin ID:", companyAdmin._id.toString());
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
