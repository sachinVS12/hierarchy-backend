const mongoose = require("mongoose");
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
    console.log("✅ Connected to MongoDB for seeding");

    // Clear existing data (in correct order to avoid foreign key issues)
    await Tag.deleteMany({});
    await User.deleteMany({});
    await Manager.deleteMany({});
    await Company.deleteMany({});
    await Role.deleteMany({});
    console.log("✅ Cleared existing data");

    // Seed roles
    await Role.seedRoles();
    console.log("✅ Roles seeded successfully");

    // Create a temporary company ID for super admin
    const tempCompanyId = new mongoose.Types.ObjectId();

    // Create SUPER_ADMIN user
    const superAdminUser = await User.create({
      name: "Super Admin",
      email: "superadmin@example.com",
      password: "Admin@123",
      role: "SUPER_ADMIN",
      companyId: tempCompanyId,
    });
    console.log("✅ Super Admin created");

    // Create the company
    const company = await Company.create({
      name: "TechCorp",
      description: "Leading technology company",
      status: true,
      createdBy: superAdminUser._id,
    });
    console.log("✅ Company created");

    // Update SUPER_ADMIN with the actual company ID
    await User.findByIdAndUpdate(superAdminUser._id, {
      companyId: company._id,
    });

    // Create a manager
    const manager = await Manager.create({
      name: "John Manager",
      email: "manager@techcorp.com",
      password: "Manager@123",
      companyId: company._id,
      createdBy: superAdminUser._id,
    });
    console.log("✅ Manager created");

    // Create a regular user
    const user = await User.create({
      name: "Jane User",
      email: "user@techcorp.com",
      password: "User@123",
      companyId: company._id,
      managerId: manager._id,
      role: "USER",
      createdBy: superAdminUser._id,
    });
    console.log("✅ User created");

    // Create a company admin user
    const companyAdmin = await User.create({
      name: "Company Admin",
      email: "companyadmin@techcorp.com",
      password: "CompanyAdmin@123",
      companyId: company._id,
      role: "COMPANY_ADMIN",
      createdBy: superAdminUser._id,
    });
    console.log("✅ Company Admin created");

    // Create a tag
    const tag = await Tag.create({
      tagPath: "techcorp/d/example",
      topic: "example",
      companyId: company._id,
      managerId: manager._id,
      userId: user._id,
      createdBy: user._id,
    });
    console.log("✅ Tag created");

    console.log("\n" + "=".repeat(50));
    console.log("✅ SEEDING COMPLETE");
    console.log("=".repeat(50));
    console.log("\n📋 CREDENTIALS:");
    console.log("─".repeat(50));
    console.log("🔴 SUPER ADMIN:");
    console.log("   Email: superadmin@example.com");
    console.log("   Password: Admin@123");
    console.log("─".repeat(50));
    console.log("🔵 COMPANY ADMIN:");
    console.log("   Email: companyadmin@techcorp.com");
    console.log("   Password: CompanyAdmin@123");
    console.log("─".repeat(50));
    console.log("🟢 MANAGER:");
    console.log("   Email: manager@techcorp.com");
    console.log("   Password: Manager@123");
    console.log("─".repeat(50));
    console.log("🟡 USER:");
    console.log("   Email: user@techcorp.com");
    console.log("   Password: User@123");
    console.log("─".repeat(50));
    console.log("\n📊 IDs:");
    console.log("─".repeat(50));
    console.log(`   Company ID: ${company._id}`);
    console.log(`   Super Admin ID: ${superAdminUser._id}`);
    console.log(`   Company Admin ID: ${companyAdmin._id}`);
    console.log(`   Manager ID: ${manager._id}`);
    console.log(`   User ID: ${user._id}`);
    console.log(`   Tag ID: ${tag._id}`);
    console.log("=".repeat(50) + "\n");

    await mongoose.disconnect();
    console.log("✅ Database disconnected");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    console.error("Stack:", error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
