const userRepository = require("../repositories/userRepository");
const managerRepository = require("../repositories/managerRepository");
const companyRepository = require("../repositories/companyRepository");
const tagRepository = require("../repositories/tagRepository");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

class UserService {
  async createUser(userData, currentUser) {
    // Check if company exists
    const company = await companyRepository.findById(userData.companyId);
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Check if manager exists and belongs to company
    const manager = await managerRepository.findById(userData.managerId);
    if (!manager || manager.companyId.toString() !== userData.companyId) {
      throw new AppError(
        "Manager not found or does not belong to the company",
        404,
      );
    }

    // Check permissions
    if (currentUser.role === "MANAGER") {
      if (currentUser.id !== userData.managerId) {
        throw new AppError(
          "You can only create users under your management",
          403,
        );
      }
    } else if (currentUser.role === "COMPANY_ADMIN") {
      if (currentUser.companyId !== userData.companyId) {
        throw new AppError(
          "You can only create users in your own company",
          403,
        );
      }
    } else if (currentUser.role !== "SUPER_ADMIN") {
      throw new AppError("Insufficient permissions to create users", 403);
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const user = await userRepository.create({
      ...userData,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    });

    return user;
  }

  async getAllUsers(currentUser, filters = {}, options = {}) {
    let filter = { isDeleted: false };

    // Apply role-based filtering
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        if (filters.companyId) filter.companyId = filters.companyId;
        if (filters.managerId) filter.managerId = filters.managerId;
        break;
      case "COMPANY_ADMIN":
        filter.companyId = currentUser.companyId;
        if (filters.managerId) {
          // Verify manager belongs to company
          const manager = await managerRepository.findById(filters.managerId);
          if (
            !manager ||
            manager.companyId.toString() !== currentUser.companyId
          ) {
            throw new AppError("Manager not found in your company", 403);
          }
          filter.managerId = filters.managerId;
        }
        break;
      case "MANAGER":
        filter.managerId = currentUser.id;
        break;
      case "USER":
        filter._id = currentUser.id;
        break;
      default:
        throw new AppError("Insufficient permissions to view users", 403);
    }

    if (filters.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    const result = await userRepository.findAll(filter, options);
    return result;
  }

  async getUserById(userId, currentUser) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check permissions
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        break;
      case "COMPANY_ADMIN":
        if (user.companyId.toString() !== currentUser.companyId) {
          throw new AppError(
            "You can only view users in your own company",
            403,
          );
        }
        break;
      case "MANAGER":
        if (user.managerId.toString() !== currentUser.id) {
          throw new AppError(
            "You can only view users under your management",
            403,
          );
        }
        break;
      case "USER":
        if (user._id.toString() !== currentUser.id) {
          throw new AppError("You can only view your own profile", 403);
        }
        break;
      default:
        throw new AppError(
          "Insufficient permissions to view user details",
          403,
        );
    }

    return user;
  }

  async updateUser(userId, updateData, currentUser) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check permissions
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        break;
      case "COMPANY_ADMIN":
        if (user.companyId.toString() !== currentUser.companyId) {
          throw new AppError(
            "You can only update users in your own company",
            403,
          );
        }
        break;
      case "MANAGER":
        if (user.managerId.toString() !== currentUser.id) {
          throw new AppError(
            "You can only update users under your management",
            403,
          );
        }
        break;
      case "USER":
        if (user._id.toString() !== currentUser.id) {
          throw new AppError("You can only update your own profile", 403);
        }
        break;
      default:
        throw new AppError("Insufficient permissions to update user", 403);
    }

    // Check email uniqueness if updating email
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await userRepository.findByEmail(updateData.email);
      if (existingUser) {
        throw new AppError("User with this email already exists", 400);
      }
    }

    // Prevent company/manager change if not SUPER_ADMIN
    if (
      (updateData.companyId || updateData.managerId) &&
      currentUser.role !== "SUPER_ADMIN"
    ) {
      throw new AppError(
        "Only SUPER_ADMIN can change user's company or manager",
        403,
      );
    }

    updateData.updatedBy = currentUser.id;
    const updatedUser = await userRepository.updateById(userId, updateData);

    return updatedUser;
  }

  async deleteUser(userId, currentUser) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check permissions
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        break;
      case "COMPANY_ADMIN":
        if (user.companyId.toString() !== currentUser.companyId) {
          throw new AppError(
            "You can only delete users in your own company",
            403,
          );
        }
        break;
      case "MANAGER":
        if (user.managerId.toString() !== currentUser.id) {
          throw new AppError(
            "You can only delete users under your management",
            403,
          );
        }
        break;
      default:
        throw new AppError("Insufficient permissions to delete user", 403);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Soft delete all tags under this user
      const tags = await tagRepository.findAll(
        { userId, isDeleted: false },
        {},
      );
      for (const tag of tags.data) {
        await tagRepository.softDeleteById(tag._id, currentUser.id, session);
      }

      // Soft delete the user
      await userRepository.softDeleteById(userId, currentUser.id, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new UserService();
