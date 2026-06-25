const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const config = require("./config/env");
const errorMiddleware = require("./middleware/errorMiddleware");

// Import routes
const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const managerRoutes = require("./routes/managerRoutes");
const userRoutes = require("./routes/userRoutes");
const tagRoutes = require("./routes/tagRoutes");

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hierarchy Management API",
      version: "1.0.0",
      description: "Production-ready hierarchical backend with RBAC",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.env === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// API routes
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/companies`, companyRoutes);
app.use(`${apiPrefix}/managers`, managerRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/tags`, tagRoutes);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Hierarchy Management API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
  });
});

// 404 handler - Fixed to use (req, res) instead of app.use('*')
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;
