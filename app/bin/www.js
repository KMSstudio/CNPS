"use strict";

const app = require("../app");
const logger = require("../src/config/logger");
const PORT = 80;

app.listen(PORT, '0.0.0.0', () => {
    logger.info(`${PORT}port server activated`);
});