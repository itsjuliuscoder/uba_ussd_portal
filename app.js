// generate a documentation for this project using apidoc
// run this command in your terminal: apidoc -i routes/ -o apidoc/
// then open the index.html file in the apidoc folder
// Path: routes/index.js
// const express = require('express');

// const router = express.Router();

const express = require("express");
const xmlparser = require("express-xml-bodyparser");
const moment = require("moment");
const crypto = require("crypto");

const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

let timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

require("dotenv/config");

const db = require("./database/models");
const indexRoutes = require("./routes/index");

// Admin Portal API Routes
const adminRoutes = require("./routes/admin");
const dashboardRoutes = require("./routes/dashboard");
const userRoutes = require("./routes/users");
const transactionRoutes = require("./routes/transactions");
const ussdSessionRoutes = require("./routes/ussd-sessions");
const operatorRoutes = require("./routes/operators");
const configRoutes = require("./routes/config");

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());
app.use(xmlparser());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-signature"
  );
  next();
});

app.use("/UBAUssd", indexRoutes);

// Admin Portal API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ussd-sessions", ussdSessionRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/config", configRoutes);

app.get("/", (req, res) => {
  res.send({
    statusCode: 200,
    message: "Welcome to UBA USSD Menu, dial *818# to get started",
    description:
      "This is a USSD Menu that ends UBA Customer send money, fund prepaid card, purchase airtime/data and alot more.",
    version: "1.0.0",
  });
});

db.sequelize.sync().then(() => {
  app.listen(process.env.PORT || 9092, () => {
    console.log(
      timestamp + " app is running now at Port : " + process.env.PORT
    );
    const now = new Date(Date.now());
    const formattedDate = now.toISOString().slice(0, 10);
  });
});

// const  db = require('.')
