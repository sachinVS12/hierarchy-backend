const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER", "USER"],
    },
    permissions: [
      {
        type: String,
      },
    ],
    description: String,
  },
  {
    timestamps: true,
  },
);

// Predefined roles and permissions
const rolesData = {
  SUPER_ADMIN: {
    permissions: [
      "manage_all_companies",
      "manage_all_managers",
      "manage_all_users",
      "manage_all_tags",
    ],
  },
  COMPANY_ADMIN: {
    permissions: [
      "manage_own_company",
      "manage_managers_in_company",
      "manage_users_in_company",
      "manage_tags_in_company",
    ],
  },
  MANAGER: {
    permissions: [
      "manage_assigned_users",
      "create_tags_for_users",
      "view_own_hierarchy_tags",
    ],
  },
  USER: {
    permissions: ["view_own_tags"],
  },
};

roleSchema.statics.seedRoles = async function () {
  for (const [roleName, roleData] of Object.entries(rolesData)) {
    // Fix: Use returnDocument: 'after' instead of new: true
    await this.findOneAndUpdate(
      { name: roleName },
      { name: roleName, ...roleData },
      { upsert: true, returnDocument: "after" }, // Changed from 'new: true' to 'returnDocument: "after"'
    );
  }
  console.log("Roles seeded successfully");
};

module.exports = mongoose.model("Role", roleSchema);
