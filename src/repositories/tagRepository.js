const BaseRepository = require("./baseRepository");
const Tag = require("../models/Tag");

class TagRepository extends BaseRepository {
  constructor() {
    super(Tag);
  }

  async findByPath(tagPath) {
    return await this.findOne({ tagPath, isDeleted: false });
  }

  async findByUser(userId, options = {}) {
    const filter = { userId, isDeleted: false };
    return await this.findAll(filter, options);
  }

  async findByManager(managerId, options = {}) {
    const filter = { managerId, isDeleted: false };
    return await this.findAll(filter, options);
  }

  async findByCompany(companyId, options = {}) {
    const filter = { companyId, isDeleted: false };
    return await this.findAll(filter, options);
  }

  async generateTagPath(companyName, topic) {
    const sanitizedCompany = companyName.toLowerCase().replace(/\s+/g, "-");
    const sanitizedTopic = topic.toLowerCase().replace(/\s+/g, "-");
    return `${sanitizedCompany}/d/${sanitizedTopic}`;
  }

  async searchTags(filter, searchTerm, options = {}) {
    if (searchTerm) {
      filter.$or = [
        { tagPath: { $regex: searchTerm, $options: "i" } },
        { topic: { $regex: searchTerm, $options: "i" } },
      ];
    }
    return await this.findAll(filter, options);
  }
}

module.exports = new TagRepository();
