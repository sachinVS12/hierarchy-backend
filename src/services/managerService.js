const managerRepository = require("../repositories/managerRepository");
const userRepository = require("../repositories/userRepository");
const companyRepository = require("../repositories/companyRepository");
const tagRepository = require("../repositories/tagRepository");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

class ManagerService {
  async createManager(managerData, currentUser) {
    // Check if company exists
    const company = await companyRepository.findById(managerData.companyId);
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Check permissions
    if (
      currentUser.role === "COMPANY_ADMIN" &&
      currentUser.companyId !== managerData.companyId
    ) {
      throw new AppError(
        "You can only create managers in your own company",
        403,
      );
    }

    if (currentUser.role === "MANAGER" || currentUser.role === "USER") {
      throw new AppError("Insufficient permissions to create managers", 403);
    }

    // Check if email already exists
    const existingManager = await managerRepository.findByEmail(
      managerData.email,
    );
    if (existingManager) {
      throw new AppError("Manager with this email already exists", 400);
    }

    const manager = await managerRepository.create({
      ...managerData,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    });

    return manager;
  }

  async getAllManagers(currentUser, filters = {}, options = {}) {
    let filter = { isDeleted: false };

    // Apply role-based filtering
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        if (filters.companyId) filter.companyId = filters.companyId;
        break;
      case "COMPANY_ADMIN":
        filter.companyId = currentUser.companyId;
        if (filters.companyId && filters.companyId !== currentUser.companyId) {
          throw new AppError(
            "You can only view managers in your own company",
            403,
          );
        }
        break;
      case "MANAGER":
        filter._id = currentUser.id;
        break;
      default:
        throw new AppError("Insufficient permissions to view managers", 403);
    }

    if (filters.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    const result = await managerRepository.findAll(filter, options);
    return result;
  }

  async getManagerById(managerId, currentUser) {
    const manager = await managerRepository.findById(managerId);

    if (!manager) {
      throw new AppError("Manager not found", 404);
    }

    // Check permissions
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        break;
      case "COMPANY_ADMIN":
        if (manager.companyId.toString() !== currentUser.companyId) {
          throw new AppError(
            "You can only view managers in your own company",
            403,
          );
        }
        break;
      case "MANAGER":
        if (manager._id.toString() !== currentUser.id) {
          throw new AppError("You can only view your own profile", 403);
        }
        break;
      default:
        throw new AppError(
          "Insufficient permissions to view manager details",
          403,
        );
    }

    return manager;
  }

  async updateManager(managerId, updateData, currentUser) {
    const manager = await managerRepository.findById(managerId);

    if (!manager) {
      throw new AppError("Manager not found", 404);
    }

    // Check permissions
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        break;
      case "COMPANY_ADMIN":
        if (manager.companyId.toString() !== currentUser.companyId) {
          throw new AppError(
            "You can only update managers in your own company",
            403,
          );
        }
        break;
      case "MANAGER":
        if (manager._id.toString() !== currentUser.id) {
          throw new AppError("You can only update your own profile", 403);
        }
        break;
      default:
        throw new AppError("Insufficient permissions to update manager", 403);
    }

    // Check email uniqueness if updating email
    if (updateData.email && updateData.email !== manager.email) {
      const existingManager = await managerRepository.findByEmail(
        updateData.email,
      );
      if (existingManager) {
        throw new AppError("Manager with this email already exists", 400);
      }
    }

    // Prevent company change if not SUPER_ADMIN
    if (updateData.companyId && currentUser.role !== "SUPER_ADMIN") {
      throw new AppError("Only SUPER_ADMIN can change manager's company", 403);
    }

    updateData.updatedBy = currentUser.id;
    const updatedManager = await managerRepository.updateById(
      managerId,
      updateData,
    );

    return updatedManager;
  }

  async deleteManager(managerId, currentUser) {
    const manager = await managerRepository.findById(managerId);

    if (!manager) {
      throw new AppError("Manager not found", 404);
    }

    // Check permissions
    if (currentUser.role === "COMPANY_ADMIN") {
      if (manager.companyId.toString() !== currentUser.companyId) {
        throw new AppError(
          "You can only delete managers in your own company",
          403,
        );
      }
    } else if (currentUser.role !== "SUPER_ADMIN") {
      throw new AppError("Insufficient permissions to delete manager", 403);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Soft delete all users under this manager
      const users = await userRepository.findAll(
        { managerId, isDeleted: false },
        {},
      );
      for (const user of users.data) {
        await userRepository.softDeleteById(user._id, currentUser.id, session);

        // Soft delete all tags under this user
        const tags = await tagRepository.findAll(
          { userId: user._id, isDeleted: false },
          {},
        );
        for (const tag of tags.data) {
          await tagRepository.softDeleteById(tag._id, currentUser.id, session);
        }
      }

      // Soft delete the manager
      await managerRepository.softDeleteById(
        managerId,
        currentUser.id,
        session,
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new ManagerService();
