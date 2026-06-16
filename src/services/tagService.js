const tagRepository = require("../repositories/tagRepository");
const userRepository = require("../repositories/userRepository");
const companyRepository = require("../repositories/companyRepository");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

class TagService {
  async createTag(tagData, currentUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get user details
      const user = await userRepository.findById(tagData.userId, null, session);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Get company details
      const company = await companyRepository.findById(
        user.companyId,
        null,
        session,
      );
      if (!company) {
        throw new AppError("Company not found", 404);
      }

      // Generate tag path
      const tagPath = await tagRepository.generateTagPath(
        company.name,
        tagData.topic,
      );

      // Check if tag path already exists
      const existingTag = await tagRepository.findByPath(tagPath);
      if (existingTag) {
        throw new AppError("Tag already exists with this path", 400);
      }

      // Create tag
      const tag = await tagRepository.create(
        {
          tagPath,
          topic: tagData.topic,
          companyId: user.companyId,
          managerId: user.managerId,
          userId: user._id,
          createdBy: currentUser.id,
          updatedBy: currentUser.id,
        },
        session,
      );

      await session.commitTransaction();
      return tag;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getTagsByUser(userId, currentUser, options = {}) {
    // Check permission
    if (currentUser.role === "USER" && currentUser.id !== userId) {
      throw new AppError("You can only view your own tags", 403);
    }

    const tags = await tagRepository.findByUser(userId, options);
    return tags;
  }

  async getTagsByManager(managerId, currentUser, options = {}) {
    // Check permission
    if (currentUser.role === "MANAGER" && currentUser.id !== managerId) {
      throw new AppError("You can only view tags under your hierarchy", 403);
    }
    if (currentUser.role === "USER") {
      throw new AppError("Users cannot view manager tags", 403);
    }

    const tags = await tagRepository.findByManager(managerId, options);
    return tags;
  }

  async getTagsByCompany(companyId, currentUser, options = {}) {
    // Check permission
    if (
      currentUser.role === "COMPANY_ADMIN" &&
      currentUser.companyId !== companyId
    ) {
      throw new AppError("You can only view tags in your company", 403);
    }
    if (currentUser.role === "MANAGER" || currentUser.role === "USER") {
      throw new AppError("Insufficient permissions to view company tags", 403);
    }

    const tags = await tagRepository.findByCompany(companyId, options);
    return tags;
  }

  async updateTag(tagId, updateData, currentUser) {
    const tag = await tagRepository.findById(tagId);
    if (!tag) {
      throw new AppError("Tag not found", 404);
    }

    // Check permissions based on role
    if (currentUser.role === "USER") {
      throw new AppError("Users cannot update tags", 403);
    }

    if (
      currentUser.role === "MANAGER" &&
      tag.managerId.toString() !== currentUser.id
    ) {
      throw new AppError("You can only update tags under your hierarchy", 403);
    }

    if (
      currentUser.role === "COMPANY_ADMIN" &&
      tag.companyId.toString() !== currentUser.companyId
    ) {
      throw new AppError("You can only update tags in your company", 403);
    }

    updateData.updatedBy = currentUser.id;
    const updatedTag = await tagRepository.updateById(tagId, updateData);
    return updatedTag;
  }

  async deleteTag(tagId, currentUser) {
    const tag = await tagRepository.findById(tagId);
    if (!tag) {
      throw new AppError("Tag not found", 404);
    }

    // Check permissions
    if (currentUser.role === "USER") {
      throw new AppError("Users cannot delete tags", 403);
    }

    if (
      currentUser.role === "MANAGER" &&
      tag.managerId.toString() !== currentUser.id
    ) {
      throw new AppError("You can only delete tags under your hierarchy", 403);
    }

    if (
      currentUser.role === "COMPANY_ADMIN" &&
      tag.companyId.toString() !== currentUser.companyId
    ) {
      throw new AppError("You can only delete tags in your company", 403);
    }

    const deletedTag = await tagRepository.softDeleteById(
      tagId,
      currentUser.id,
    );
    return deletedTag;
  }

  async getAllTags(currentUser, filters = {}, options = {}) {
    let filter = { isDeleted: false };

    // Apply role-based filtering
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        // No additional filter
        break;
      case "COMPANY_ADMIN":
        filter.companyId = currentUser.companyId;
        break;
      case "MANAGER":
        filter.managerId = currentUser.id;
        break;
      case "USER":
        filter.userId = currentUser.id;
        break;
      default:
        throw new AppError("Invalid role", 403);
    }

    // Apply additional filters
    if (filters.companyId) filter.companyId = filters.companyId;
    if (filters.managerId) filter.managerId = filters.managerId;
    if (filters.userId) filter.userId = filters.userId;
    if (filters.tagPath)
      filter.tagPath = { $regex: filters.tagPath, $options: "i" };

    const tags = await tagRepository.searchTags(
      filter,
      filters.search,
      options,
    );
    return tags;
  }
}

module.exports = new TagService();
