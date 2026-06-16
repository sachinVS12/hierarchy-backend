const BaseRepository = require("./baseRepository");
const Company = require("../models/Company");

class CompanyRepository extends BaseRepository {
  constructor() {
    super(Company);
  }

  async findByName(name, excludeId = null) {
    const filter = {
      name: { $regex: new RegExp(`^${name}$`, "i") },
      isDeleted: false,
    };
    if (excludeId) filter._id = { $ne: excludeId };
    return await this.findOne(filter);
  }

  async findAllWithStats(filter = {}, options = {}) {
    const result = await this.findAll(filter, options);

    // Add statistics (you can add more aggregation here)
    const Manager = require("../models/Manager");
    const User = require("../models/User");

    for (const company of result.data) {
      const managerCount = await Manager.countDocuments({
        companyId: company._id,
        isDeleted: false,
      });
      const userCount = await User.countDocuments({
        companyId: company._id,
        isDeleted: false,
      });

      company._doc.stats = { managerCount, userCount };
    }

    return result;
  }
}

module.exports = new CompanyRepository();
