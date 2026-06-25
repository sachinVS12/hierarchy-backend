const userService = require("../services/userService");
const ResponseHandler = require("../utils/responseHandler");
const AppError = require("../utils/appError");
const validate = require("../middleware/validationMiddleware");
const {
  createUserValidation,
  updateUserValidation,
  userIdValidation,
} = require("../validations/userValidation");

class UserController {
  createUser = [
    validate(createUserValidation),
    async (req, res, next) => {
      try {
        const user = await userService.createUser(req.body, req.user);
        ResponseHandler.created(res, user, "User created successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  getUsers = async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        companyId,
        managerId,
      } = req.query;
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
      };

      const filters = { search };
      if (companyId) filters.companyId = companyId;
      if (managerId) filters.managerId = managerId;

      const result = await userService.getAllUsers(req.user, filters, options);
      ResponseHandler.paginated(
        res,
        result.data,
        result.pagination,
        "Users retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  };

  getUserById = [
    validate(userIdValidation),
    async (req, res, next) => {
      try {
        const user = await userService.getUserById(req.params.id, req.user);
        ResponseHandler.success(res, user, "User retrieved successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  updateUser = [
    validate(updateUserValidation),
    async (req, res, next) => {
      try {
        const user = await userService.updateUser(
          req.params.id,
          req.body,
          req.user,
        );
        ResponseHandler.success(res, user, "User updated successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  deleteUser = [
    validate(userIdValidation),
    async (req, res, next) => {
      try {
        await userService.deleteUser(req.params.id, req.user);
        ResponseHandler.noContent(res, "User deleted successfully");
      } catch (error) {
        next(error);
      }
    },
  ];
}

module.exports = new UserController();
