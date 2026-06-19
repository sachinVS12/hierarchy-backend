const authService = require("../services/authService");
const ResponseHandler = require("../utils/responseHandler");
const AppError = require("../utils/appError");
const validate = require("../middleware/validationMiddleware");
const {
  registerUserValidation,
  registerManagerValidation,
  loginValidation,
} = require("../validations/authValidation");

class AuthController {
  registerUser = [
    validate(registerUserValidation),
    async (req, res, next) => {
      try {
        const result = await authService.registerUser(req.body);
        ResponseHandler.created(res, result, "User registered successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  registerManager = [
    validate(registerManagerValidation),
    async (req, res, next) => {
      try {
        const result = await authService.registerManager(req.body);
        ResponseHandler.created(res, result, "Manager registered successfully");
      } catch (error) {
        next(error);
      }
    },
  ];

  login = [
    validate(loginValidation),
    async (req, res, next) => {
      try {
        const { email, password, userType = "user" } = req.body;
        const result = await authService.login(email, password, userType);
        ResponseHandler.success(res, result, "Login successful");
      } catch (error) {
        next(error);
      }
    },
  ];
}

module.exports = new AuthController();
