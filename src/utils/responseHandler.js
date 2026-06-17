class ResponseHandler {
  static success(res, data = null, message = "Success", statusCode = 200) {
    const response = {
      success: true,
      status: "success",
      message,
      data,
    };

    return res.status(statusCode).json(response);
  }

  static paginated(
    res,
    data,
    pagination,
    message = "Success",
    statusCode = 200,
  ) {
    const response = {
      success: true,
      status: "success",
      message,
      data,
      pagination,
    };

    return res.status(statusCode).json(response);
  }

  static created(res, data = null, message = "Resource created successfully") {
    return this.success(res, data, message, 201);
  }

  static noContent(res, message = "Resource deleted successfully") {
    return this.success(res, null, message, 204);
  }

  static error(
    res,
    message = "Internal server error",
    statusCode = 500,
    details = null,
  ) {
    const response = {
      success: false,
      status: "error",
      message,
    };

    if (details) response.details = details;

    return res.status(statusCode).json(response);
  }
}

module.exports = ResponseHandler;
