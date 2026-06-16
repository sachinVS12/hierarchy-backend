const BaseRepository = require("./baseRepository");
const User = require("../models/User");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, includePassword = false) {
    let query = this.model.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (includePassword) query = query.select("+password");
    return await query;
  }

  async findByManager(managerId, options = {}) {
    const filter = { managerId, isDeleted: false };
    return await this.findAll(filter, options);
  }

  async findByCompany(companyId, options = {}) {
    const filter = { companyId, isDeleted: false };
    return await this.findAll(filter, options);
  }

  async findWithTagStats(userId) {
    const Tag = require("../models/Tag");
    const user = await this.findById(userId);

    if (user) {
      const tagCount = await Tag.countDocuments({
        userId: user._id,
        isDeleted: false,
      });
      user._doc.tagCount = tagCount;
    }

    return user;
  }
}

module.exports = new UserRepository();
