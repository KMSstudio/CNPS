"use strict";

const { exceptions } = require("winston");
const logger = require("../config/logger");
const log = require("../models/Log");
const Post = require("../models/Post");

const output = {
    home: (req, res) => {
        logger.info(`GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / success / 200 move to home`);
        res.render("index");
    },

    api: (req, res) => {
        logger.info(`API GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / success / 200 api home`);
        res.render("api/api");
    }
};

const download = {
    apidoc: (req, res) => {
        logger.info(`GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / download API instruction document`);
        res.download("./src/public/pdf/apiDoc.pdf", "apiDoc.pdf");
    },

    getlog: (req, res) => {
        const url = (req.url.includes('?')) ? req.url.slice(req.url.indexOf("?")) : "";
        const params = new URLSearchParams(url);
        const pre = (params.has("pre")) ? params.get("pre") : '0';
        const response = log.getLogFileName(pre);
        if(!response.success) { res.json(response); return; }
        logger.info(`GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / DOWNLOAD ${response.success? 'success' : 'fail'} / 200 ${req.url} /`);
        res.download(response.fileName, `${response.fileName.split('.').join('')}.txt`);
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
            res.render("search", response);
        }
        else{
            logger.info(`GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / fail    / 200 ${req.url} / ${response.code}`);
            res.render("fail", response);
        }
    },
};

const api = {
    makesrc: async(req, res) => {
        const response = await getres(req);
        if(response.hasOwnProperty('target') && response.target.hasOwnProperty('statusN')) { delete response.target.statusN; }
        logger.info(`API GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / ${response.success? 'success' : 'fail'} / 200 ${req.url} /`);
        res.send(response);
    },
    makemsg: async(req, res) => {
        const response = await getres(req);
        const company = new URLSearchParams(req.url.slice(req.url.indexOf('?'))).get('company');
        logger.info(`API GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / ${response.success? 'success' : 'fail'} / 200 ${req.url} /`);
        if (response.success){
            res.json({
                success: true,
                msg: `안녕하십니까 Canopus 프로젝트 개발자 MS Kang입니다. `
                    + `질문자님의 택배는 현재 ${response.target.location}에 있습니다. `
                    + `${response.target.timeZ}에 ${response.target.location}에 ${response.target.statusN} 된 택배 중 ${response.predict.pred.range}가 ${(response.predict.pred.range == '75%') ? response.predict.p75 : response.predict.p95} 안으로 도착했습니다. `
                    + `${response.predict.pred.range}선으로 추정한 도착예정시각은 ${response.predict.pred.value} 입니다. `
                    + `http://cnps.site/search?number=${response.input.number}&company=${company}`
            });
        }
        else{
            res.json({
                success: false,
                code: response.code,
                msg: response.msg
            });
        }
    },

    showlog: (req, res) => {
        const url = (req.url.includes('?')) ? req.url.slice(req.url.indexOf("?")) : "";
        const params = new URLSearchParams(url);
        var option = {};
        var response;

        if(params.has("start")) { option.start = params.get("start"); }
        if(params.has("num")) { option.num = params.get("num"); }

        response = log.getLog(option);
        logger.info(`API GET / ${String(req.socket.remoteAddress).padEnd(16, ' ')} / ${response.success? 'success' : 'fail'} / 200 ${req.url} /`);

        if(response.success) { res.render("api/show-log", response); }
        else { res.render("fail", response); }
    }
}

module.exports = {
    output,
    download,
    process,
    api
};