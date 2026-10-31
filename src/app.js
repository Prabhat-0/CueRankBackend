
require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");

const db = require("../models");

const { userRouter } = require("./routes/user.route");
const clubRouter = require("./routes/club.route");
const adminRouter = require("./routes/admin.route");

const { transporter, configurationError } = require("./config/mailer");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/player", userRouter);
app.use("/api/v1/club", clubRouter);
app.use("/api/v1/admin", adminRouter);

// Mail configuration
if (configurationError) {
  console.log("Mail not configured:", configurationError);
} else {
  transporter.verify()
    .then(() => console.log("Mail server ready"))
    .catch(err => console.log("Mail server error:", err.message));
}

// Database connection and server startup
(async () => {
  try {
    // Verify database connection
    await db.sequelize.authenticate();
    console.log("PostgreSQL connected successfully");

    // Sync models
    await db.sequelize.sync({ alter: true });
    console.log("Models synchronized successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`App is successfully running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
})();
