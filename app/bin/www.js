"use strict";

const app = require("../app");
const logger = require("../src/config/logger");
const PORT = 80;

app.listen(PORT, () => {
    logger.info(`${PORT}port server activated`);
});