// const app = require("./src/app");
// const config = require("./src/config/env");
// const database = require("./src/config/db");

// const PORT = config.port;

// // Handle uncaught exceptions
// process.on("uncaughtException", (err) => {
//   console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
//   console.error(err.name, err.message, err.stack);
//   process.exit(1);
// });

// // Start server
// const startServer = async () => {
//   try {
//     // Connect to database
//     await database.connect();

//     // Start listening
//     const server = app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//       console.log(`Environment: ${config.env}`);
//       console.log(`API URL: http://localhost:${PORT}/api/${config.apiVersion}`);
//       console.log(`Documentation: http://localhost:${PORT}/api-docs`);
//       console.log(`Health Check: http://localhost:${PORT}/health`);
//     });

//     // Handle unhandled promise rejections
//     process.on("unhandledRejection", (err) => {
//       console.error("UNHANDLED REJECTION! 💥 Shutting down...");
//       console.error(err.name, err.message);
//       server.close(() => {
//         process.exit(1);
//       });
//     });

//     // Graceful shutdown
//     process.on("SIGTERM", () => {
//       console.log("👋 SIGTERM received. Shutting down gracefully");
//       server.close(() => {
//         console.log("💥 Process terminated!");
//       });
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// };

// startServer();

// server.js

const mqtt = require("mqtt");

// Local MQTT broker
const broker = "mqtt://localhost:1883";

const client = mqtt.connect(broker);

// Generate topics: p1/data to p1000/data
const topics = [];
for (let i = 1; i <= 1000; i++) {
  topics.push(`p${i}/data`);
}

client.on("connect", () => {
  console.log("Connected to Local MQTT Broker");

  setInterval(() => {
    topics.forEach((topic) => {
      const value = Math.floor(Math.random() * 100);

      client.publish(topic, value.toString(), (err) => {
        if (err) {
          console.error(`Error publishing to ${topic}:`, err);
        } else {
          console.log(`Topic: ${topic} | Value: ${value}`);
        }
      });
    });
  }, 30000); // Every 30 seconds
});

client.on("error", (err) => {
  console.error("Connection Error:", err);
});

client.on("close", () => {
  console.log("Disconnected from MQTT Broker");
});
