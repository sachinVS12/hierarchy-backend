const BaseRepository = require("./baseRepository");
const Manager = require("../models/Manager");

class ManagerRepository extends BaseRepository {
  constructor() {
    super(Manager);
  }

  async findByEmail(email, includePassword = false) {
    let query = this.model.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (includePassword) query = query.select("+password");
    return await query;
  }

  async findByCompany(companyId, options = {}) {
    const filter = { companyId, isDeleted: false };
    return await this.findAll(filter, options);
  }

  async findByCompanyWithUsers(companyId) {
    const managers = await this.model
      .find({ companyId, isDeleted: false })
      .populate({
        path: "users",
        match: { isDeleted: false },
        select: "name email role",
      });

    const User = require("../models/User");
    for (const manager of managers) {
      const userCount = await User.countDocuments({
        managerId: manager._id,
        isDeleted: false,
      });
      manager._doc.userCount = userCount;
    }

    return managers;
  }
}

module.exports = new ManagerRepository();
