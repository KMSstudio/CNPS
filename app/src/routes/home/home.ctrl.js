"use strict";

const logger = require("../../config/logger");
const Post = require("../../models/Post");

const output = {
    home: (req, res) => {
        logger.info(`GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / success / 200 move to home`);
        res.render("home/index");
    },
};

const process = {
    search: async(req, res) => {
        const url = req.url.slice(req.url.indexOf("?"))
        const params = new URLSearchParams(url);
        
        const number = params.get("number");
        const company = params.get("company");

        const post = new Post(number, company);
        const response = await post.search();
        
        if (response.success){
            logger.info(`GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / success / 200 ${req.url} /`);
            res.render("home/search", response);
        }
        else{
            logger.info(`GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / fail    / 200 ${req.url} / ${response.code}`);
            res.render("home/fail", response);
        }
    },
};

module.exports = {
    output,
    process,
};