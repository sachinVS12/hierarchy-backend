const AppError = require("../utils/appError");

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("You are not authenticated", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};

const restrictToOwnCompany = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("You are not authenticated", 401));
  }

  const resourceCompanyId = req.params.companyId || req.body.companyId;

  if (req.user.role === "SUPER_ADMIN") {
    return next();
  }

  if (
    req.user.role === "COMPANY_ADMIN" &&
    req.user.companyId === resourceCompanyId
  ) {
    return next();
  }

  return next(
    new AppError("You can only access resources within your company", 403),
  );
};

const restrictToOwnManager = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("You are not authenticated", 401));
  }

  const resourceManagerId = req.params.managerId || req.body.managerId;

  if (req.user.role === "SUPER_ADMIN" || req.user.role === "COMPANY_ADMIN") {
    return next();
  }

  if (req.user.role === "MANAGER" && req.user.id === resourceManagerId) {
    return next();
  }

  return next(
    new AppError("You can only access resources under your management", 403),
  );
};

module.exports = {
  restrictTo,
  restrictToOwnCompany,
  restrictToOwnManager,
};
