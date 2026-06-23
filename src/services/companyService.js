const companyRepository = require("../repositories/companyRepository");
const managerRepository = require("../repositories/managerRepository");
const userRepository = require("../repositories/userRepository");
const tagRepository = require("../repositories/tagRepository");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

class CompanyService {
  async createCompany(companyData, currentUser) {
    // Only SUPER_ADMIN can create companies
    if (currentUser.role !== "SUPER_ADMIN") {
      throw new AppError("Only SUPER_ADMIN can create companies", 403);
    }

    // Check if company name already exists
    const existingCompany = await companyRepository.findByName(
      companyData.name,
    );
    if (existingCompany) {
      throw new AppError("Company with this name already exists", 400);
    }

    const company = await companyRepository.create({
      ...companyData,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    });

    return company;
  }

  async getAllCompanies(currentUser, filters = {}, options = {}) {
    let filter = { isDeleted: false };

    // Apply role-based filtering
    if (currentUser.role === "COMPANY_ADMIN") {
      filter._id = currentUser.companyId;
    } else if (currentUser.role !== "SUPER_ADMIN") {
      throw new AppError("Insufficient permissions to view companies", 403);
    }

    if (filters.search) {
      filter.name = { $regex: filters.search, $options: "i" };
    }

    const result = await companyRepository.findAllWithStats(filter, options);
    return result;
  }

  async getCompanyById(companyId, currentUser) {
    const company = await companyRepository.findById(companyId);

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Check permissions
    if (
      currentUser.role === "COMPANY_ADMIN" &&
      currentUser.companyId !== companyId
    ) {
      throw new AppError("You can only view your own company", 403);
    }

    if (currentUser.role === "MANAGER" || currentUser.role === "USER") {
      throw new AppError(
        "Insufficient permissions to view company details",
        403,
      );
    }

    return company;
  }

  async updateCompany(companyId, updateData, currentUser) {
    const company = await companyRepository.findById(companyId);

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Check permissions
    if (
      currentUser.role === "COMPANY_ADMIN" &&
      currentUser.companyId !== companyId
    ) {
      throw new AppError("You can only update your own company", 403);
    }

    if (
      currentUser.role !== "SUPER_ADMIN" &&
      currentUser.role !== "COMPANY_ADMIN"
    ) {
      throw new AppError("Insufficient permissions to update company", 403);
    }

    // Check name uniqueness if updating name
    if (updateData.name && updateData.name !== company.name) {
      const existingCompany = await companyRepository.findByName(
        updateData.name,
        companyId,
      );
      if (existingCompany) {
        throw new AppError("Company with this name already exists", 400);
      }
    }

    updateData.updatedBy = currentUser.id;
    const updatedCompany = await companyRepository.updateById(
      companyId,
      updateData,
    );

    return updatedCompany;
  }

  async deleteCompany(companyId, currentUser) {
    const company = await companyRepository.findById(companyId);

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Only SUPER_ADMIN can delete companies
    if (currentUser.role !== "SUPER_ADMIN") {
      throw new AppError("Only SUPER_ADMIN can delete companies", 403);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Soft delete all managers, users, and tags under this company
      const managers = await managerRepository.findAll(
        { companyId, isDeleted: false },
        {},
      );
      for (const manager of managers.data) {
        await managerRepository.softDeleteById(
          manager._id,
          currentUser.id,
          session,
        );

        // Soft delete all users under this manager
        const users = await userRepository.findAll(
          { managerId: manager._id, isDeleted: false },
          {},
        );
        for (const user of users.data) {
          await userRepository.softDeleteById(
            user._id,
            currentUser.id,
            session,
          );

          // Soft delete all tags under this user
          const tags = await tagRepository.findAll(
            { userId: user._id, isDeleted: false },
            {},
          );
          for (const tag of tags.data) {
            await tagRepository.softDeleteById(
              tag._id,
              currentUser.id,
              session,
            );
          }
        }
      }

      // Soft delete the company
      await companyRepository.softDeleteById(
        companyId,
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

module.exports = new CompanyService();
