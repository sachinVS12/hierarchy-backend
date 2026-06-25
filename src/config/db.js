const mongoose = require("mongoose");

class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log("Database already connected");
      return;
    }

    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        // Remove these options as they are no longer supported in Mongoose 8+
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      console.log(`MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
        this.isConnected = false;
      });
    } catch (error) {
      console.error("Database connection failed:", error);
      process.exit(1);
    }
  }

  async disconnect() {
    if (!this.isConnected) return;

    await mongoose.disconnect();
    this.isConnected = false;
    console.log("Database disconnected");
  }
}

module.exports = new Database();
