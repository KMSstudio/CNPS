"use strict";

const logger = require("../../config/logger");
const Post = require("../../models/Post");

const output = {
    home: (req, res) => {
        logger.info(`GET / ${req.socket.remoteAddress} / 200 move to home`);
        res.render("home/index");
    },
    search: async(req, res) => {
        const url = req.url.slice(req.url.indexOf("?"))
        const params = new URLSearchParams(url);
        
        const number = params.get("number");
        const company = params.get("company");

        const post = new Post(number, company);
        const response = await post.search();
        
        if (response.success){
            logger.info(`GET / ${req.socket.remoteAddress} / 200 search ${req.url} /success`);
            res.render("home/search", response);
        }
        else{
            logger.info(`GET / ${req.socket.remoteAddress} / 200 ${req.url} / fail${response.msg}`);
            res.render("home/fail", response);
            // res.redirect('/');
        }
    }
};

const process = {
    
};

module.exports = {
    output,
    process,
};