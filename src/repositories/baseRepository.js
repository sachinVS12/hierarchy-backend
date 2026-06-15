class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data, session = null) {
    const options = session ? { session } : {};
    const doc = new this.model(data);
    return await doc.save(options);
  }

  async findById(id, select = null, session = null) {
    const query = this.model.findById(id);
    if (select) query.select(select);
    if (session) query.session(session);
    return await query;
  }

  async findOne(filter, select = null, session = null) {
    const query = this.model.findOne(filter);
    if (select) query.select(select);
    if (session) query.session(session);
    return await query;
  }

  async findAll(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = null,
      populate = null,
    } = options;

    const query = this.model.find(filter);

    if (select) query.select(select);
    if (populate) query.populate(populate);

    query.sort(sort);
    query.skip((page - 1) * limit);
    query.limit(limit);

    const [data, total] = await Promise.all([
      query,
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateById(id, data, session = null) {
    const options = { new: true, runValidators: true };
    if (session) options.session = session;

    return await this.model.findByIdAndUpdate(id, data, options);
  }

  async updateOne(filter, data, session = null) {
    const options = { new: true, runValidators: true };
    if (session) options.session = session;

    return await this.model.findOneAndUpdate(filter, data, options);
  }

  async softDeleteById(id, userId, session = null) {
    const options = { new: true };
    if (session) options.session = session;

    return await this.model.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedBy: userId },
      options,
    );
  }

  async hardDeleteById(id, session = null) {
    const options = {};
    if (session) options.session = session;

    return await this.model.findByIdAndDelete(id, options);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  async aggregate(pipeline, session = null) {
    const options = session ? { session } : {};
    return await this.model.aggregate(pipeline, options);
  }
}

module.exports = BaseRepository;
