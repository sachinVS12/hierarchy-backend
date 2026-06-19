const companyService = require("../services/companyService");
const ResponseHandler = require("../utils/responseHandler");
const validate = require("../middleware/validationMiddleware");
const {
  createCompanyValidation,
  updateCompanyValidation,
  companyIdValidation,
} = require("../validations/companyValidation");

class CompanyController {
  createCompany = [
    validate(createCompanyValidation),
    async (req, res, next) => {
      try {
        const company = await companyService.createCompany(req.body, req.user);
        ResponseHandler.created(res, company, "Company created successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  getCompanies = async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
      } = req.query;
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
      };

      const result = await companyService.getAllCompanies(
        req.user,
        { search },
        options,
      );
      ResponseHandler.paginated(
        res,
        result.data,
        result.pagination,
        "Companies retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  };

  getCompanyById = [
    validate(companyIdValidation),
    async (req, res, next) => {
      try {
        const company = await companyService.getCompanyById(
          req.params.id,
          req.user,
        );
        ResponseHandler.success(res, company, "Company retrieved successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  updateCompany = [
    validate(updateCompanyValidation),
    async (req, res, next) => {
      try {
        const company = await companyService.updateCompany(
          req.params.id,
          req.body,
          req.user,
        );
        ResponseHandler.success(res, company, "Company updated successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  deleteCompany = [
    validate(companyIdValidation),
    async (req, res, next) => {
      try {
        await companyService.deleteCompany(req.params.id, req.user);
        ResponseHandler.noContent(res, "Company deleted successfully");
      } catch (error) {
        next(error);
      }
    },
  ];
}

module.exports = new CompanyController();
