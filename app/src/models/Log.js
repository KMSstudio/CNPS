"use strict";

const fs = require('fs');
const constant = require('./Constant');

const inquiry = {
    // get log file name ${pre=0} days ago. if return.success == true, file ${return.fileName} is readable
    getLogFileName (pre = 0) {
        const cur = new Date();
        const utc = cur.getTime() + (cur.getTimezoneOffset() * 60 * 1000);
        const kst = new Date(utc + (9 * 3600 * 1000) - (pre * 24 * 3600 * 1000));

        const dateComp = kst.toLocaleString('en-US', {
            timeZone: 'Asia/Seoul',
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).split(',')[0].split('/');
        const date = `${dateComp[2]}-${dateComp[0]}-${dateComp[1]}`;
        try{
            fs.accessSync(`./logs/${date}.log`, fs.constants.R_OK)
            return {
                success: true,
                fileName: `./logs/${date}.log`
            };
        } catch(err) {
            return constant.errList.SERVER_LOG_ACS_ERR;
        }
    },

    // get log start to {option.start=0} ago and have ${option.num=2} days range
    getLog(option) {
        var data;
        var result = [];

        if(typeof(option) != "object") { option = {start: 0, num: 2}; }
        if(!option.hasOwnProperty('start')) { option.start = 0; }
        if(!option.hasOwnProperty('num')) { option.num = 2; }

        try{
            option.num = Number(option.num);
            option.start = Number(option.start);
        } catch(err) { return constant.errList.TYPE_ERR; }
        
        for(var i = 0;i < option.num; i++){
            var fileName = this.getLogFileName(option.start + i);
            if (!fileName.success) { continue; }
            try{ data = fs.readFileSync(fileName.fileName, "utf-8"); }
            catch(err) { return constant.errList.SERVER_LOG_ACS_ERR; }
            data = data.replace('\r', '').split('\n');

            result.push(...data);
        }
        return {
            success: true,
            log: result
        };
    },
}

module.exports = inquiry;