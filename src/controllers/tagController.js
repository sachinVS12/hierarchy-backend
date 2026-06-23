const tagService = require("../services/tagService");
const ResponseHandler = require("../utils/responseHandler");
const validate = require("../middleware/validationMiddleware");
const {
  createTagValidation,
  updateTagValidation,
  tagIdValidation,
} = require("../validations/tagValidation");

class TagController {
  createTag = [
    validate(createTagValidation),
    async (req, res, next) => {
      try {
        const tag = await tagService.createTag(req.body, req.user);
        ResponseHandler.created(res, tag, "Tag created successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  getTags = async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        companyId,
        managerId,
        userId,
        tagPath,
      } = req.query;
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
      };

      const result = await tagService.getAllTags(
        req.user,
        { search, companyId, managerId, userId, tagPath },
        options,
      );
      ResponseHandler.paginated(
        res,
        result.data,
        result.pagination,
        "Tags retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  };

  getTagById = [
    validate(tagIdValidation),
    async (req, res, next) => {
      try {
        // Implement get tag by id with permissions
        const tags = await tagService.getAllTags(req.user, {}, {});
        const tag = tags.data.find((t) => t._id.toString() === req.params.id);

        if (!tag) {
          return next(new AppError("Tag not found", 404));
        }

        ResponseHandler.success(res, tag, "Tag retrieved successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  updateTag = [
    validate(updateTagValidation),
    async (req, res, next) => {
      try {
        const tag = await tagService.updateTag(
          req.params.id,
          req.body,
          req.user,
        );
        ResponseHandler.success(res, tag, "Tag updated successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  deleteTag = [
    validate(tagIdValidation),
    async (req, res, next) => {
      try {
        await tagService.deleteTag(req.params.id, req.user);
        ResponseHandler.noContent(res, "Tag deleted successfully");
      } catch (error) {
        next(error);
      }
    },
  ];
}

module.exports = new TagController();
