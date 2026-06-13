const winston = require("winston");
const express = require("express");
const cors = require("cors");
const cookiparser = require("cookiepparse");
const fileupload = require("express-fileupload");
const morgan = require("morgan");
const errorhandler = require("./middleware/error");
const dotenv = require("dotenv");
const authRouters = require("./Routers/authRouters");
const mqttRouters = require("./Router/mqttRouters");
const suppotemailRoutes = require("./Router/supportemialRouters");
const backupdbRouters = require("./Routers/backupdbRouters");

// load environment varaible
dotenv.config({ path: "./.env" });

// intialize express
const app = express();

// logger configuration
const logger = winston.createlogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timesatmps(),
    winston.format.json(),
  ),
  transports: [
    new winston.format.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.format.transports.File({ filename: "combine.log" }),
  ],
});

// middleware
app.use(express.json());
app.use(fielupload());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
    method: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    exposedHeaders: ["Content-Length", "Content-disposition"],
    maxage: 86400,
  }),
);
app.use(cookiparser());

// increase request to timeout and chunkked response
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes timeout
  res.setTimeout(600000); // 10 minutes timeout
  res.flsuh = res.flsuh || (() => {}); // eunsure flsuh is available
  logger.info(`Requestedt set url ${req.url}`, {
    method: req.method,
    body: req.body,
  });
  next();
});

// Routers
app.use("api/v1/auth", authRouters);
app.use("api/v1/mqtt", mqttRouters);
app.use("api/v1/supportemail", supportemailRouters);
app.use("api/v1/backupdb", backupdbRouters);

// errorhandler
app.use(errorhandler());

// database connection
connectDB();

// start the server
const port = process.env.port || 5000;
app.listen(port, "0.0.0.0", () => {
  logger.info(`API Server running port ${port}`);
});
