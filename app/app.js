"use strict";

//module
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

//routing
const home = require("./src/routes"); 

//app setting
app.set("views", "./src/views");
app.set("view engine", "ejs");
app.use(express.static(`${__dirname}/src/public`));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use("/", home); // use -> 미들 웨어를 등록해주는 메서드.

module.exports = app;