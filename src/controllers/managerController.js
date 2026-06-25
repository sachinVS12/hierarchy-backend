const managerService = require("../services/managerService");
const ResponseHandler = require("../utils/responseHandler");
const AppError = require("../utils/appError");
const validate = require("../middleware/validationMiddleware");
const {
  createManagerValidation,
  updateManagerValidation,
  managerIdValidation,
} = require("../validations/managerValidation");

class ManagerController {
  createManager = [
    validate(createManagerValidation),
    async (req, res, next) => {
      try {
        const manager = await managerService.createManager(req.body, req.user);
        ResponseHandler.created(res, manager, "Manager created successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  getManagers = async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        companyId,
      } = req.query;
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
      };

      const filters = { search };
      if (companyId) filters.companyId = companyId;

      const result = await managerService.getAllManagers(
        req.user,
        filters,
        options,
      );
      ResponseHandler.paginated(
        res,
        result.data,
        result.pagination,
        "Managers retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  };

  getManagerById = [
    validate(managerIdValidation),
    async (req, res, next) => {
      try {
        const manager = await managerService.getManagerById(
          req.params.id,
          req.user,
        );
        ResponseHandler.success(res, manager, "Manager retrieved successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  updateManager = [
    validate(updateManagerValidation),
    async (req, res, next) => {
      try {
        const manager = await managerService.updateManager(
          req.params.id,
          req.body,
          req.user,
        );
        ResponseHandler.success(res, manager, "Manager updated successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  deleteManager = [
    validate(managerIdValidation),
    async (req, res, next) => {
      try {
        await managerService.deleteManager(req.params.id, req.user);
        ResponseHandler.noContent(res, "Manager deleted successfully");
      } catch (error) {
        next(error);
      }
    },
  ];
}

module.exports = new ManagerController();
