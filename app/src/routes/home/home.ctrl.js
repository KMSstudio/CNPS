"use strict";

const logger = require("../../config/logger");
const Post = require("../../models/Post");

const output = {
    home: (req, res) => {
        logger.info(`GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / success / 200 move to home`);
        res.render("home/index");
    },

    api: (req, res) => {
        logger.info(`API GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / success / 200 api home`);
        res.render("home/api");
    }
};

const download = {
    apidoc: (req, res) => {
        res.download("./src/public/pdf/apiDoc.pdf");
    }
}

const getres = async (req) => {
    const url = req.url.slice(req.url.indexOf("?"))
    const params = new URLSearchParams(url);
    
    const number = params.get("number");
    const company = params.get("company");

    const post = new Post(number, company);
    const response = await post.search();

    return response;
}

const process = {
    search: async(req, res) => {
        const response = await getres(req);
        
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

const api = {
    makesrc: async(req, res) => {
        const response = await getres(req);
        
        logger.info(`API GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / API ${response.success? 'success' : 'fail'} / 200 ${req.url} /`);
        res.send(response);
    },
    makemsg: async(req, res) => {
        const response = await getres(req);
        
        if (response.success){
            logger.info(`API GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / API success / 200 ${req.url} /`);
            res.json({
                success: true,
                msg: `안녕하십니까 Canopus 프로젝트 개발자 MS Kang입니다. `
                    + `질문자님의 택배는 현재 ${response.target.location}에 있습니다. `
                    + `${response.target.timeZ}에 ${response.target.location}에 ${response.target.statusN} 된 택배 중 ${response.predict.pred.range}가 ${(response.predict.pred.range == '75%') ? response.predict.p75 : response.predict.p95} 안으로 도착했습니다. `
                    + `${response.predict.pred.range}선으로 추정한 도착예정시각은 ${response.predict.pred.value} 입니다. `
            });
        }
        else{
            logger.info(`API GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / API fail    / 200 ${req.url} / ${response.code}`);
            res.json({
                success: false,
                code: response.code,
                msg: response.msg
            });
        }
    }
}

module.exports = {
    output,
    download,
    process,
    api
};