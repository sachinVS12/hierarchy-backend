const jwt = require("jsonwebtoken");
const config = require("../config/env");
const userRepository = require("../repositories/userRepository");
const managerRepository = require("../repositories/managerRepository");
const companyRepository = require("../repositories/companyRepository");
const AppError = require("../utils/appError");

class AuthService {
  generateToken(userId, role, companyId = null) {
    const payload = {
      id: userId,
      role,
      companyId,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpire,
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new AppError("Invalid or expired token", 401);
    }
  }

  async registerUser(userData) {
    // Check if user exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError("User already exists with this email", 400);
    }

    // Check if company exists
    const company = await companyRepository.findById(userData.companyId);
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Check if manager exists and belongs to company
    const manager = await managerRepository.findById(userData.managerId);
    if (!manager || manager.companyId.toString() !== userData.companyId) {
      throw new AppError(
        "Manager not found or does not belong to the company",
        404,
      );
    }

    // Create user
    const user = await userRepository.create(userData);

    // Generate token
    const token = this.generateToken(user._id, user.role, user.companyId);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        managerId: user.managerId,
      },
      token,
    };
  }

  async registerManager(managerData) {
    // Check if manager exists
    const existingManager = await managerRepository.findByEmail(
      managerData.email,
    );
    if (existingManager) {
      throw new AppError("Manager already exists with this email", 400);
    }

    // Check if company exists
    const company = await companyRepository.findById(managerData.companyId);
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    // Create manager
    const manager = await managerRepository.create(managerData);

    // Generate token
    const token = this.generateToken(
      manager._id,
      manager.role,
      manager.companyId,
    );

    return {
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
        companyId: manager.companyId,
      },
      token,
    };
  }

  async login(email, password, userType = "user") {
    let user;

    if (userType === "manager") {
      user = await managerRepository.findByEmail(email, true);
    } else {
      user = await userRepository.findByEmail(email, true);
    }

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = this.generateToken(user._id, user.role, user.companyId);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    if (user.managerId) {
      userResponse.managerId = user.managerId;
    }

    return {
      user: userResponse,
      token,
    };
  }
}

module.exports = new AuthService();
