"use strict";

const fs = require('fs');
const inquiry = require("./Inquiry");
const constant = require('./Constant');

class Post{
    constructor(number, company) {
        this.number = number;
        this.company = company;
    }

    readFile(direcLoc) {
        try{
            const mdata = fs.readFileSync(direcLoc + '/medi.json');
            this.medi = JSON.parse(mdata);
            const hdata = fs.readFileSync(direcLoc + '/hist.json');
            this.hist = JSON.parse(hdata);
        }catch(err){
            throw new Error('readFile');
        }
    }

    takeAim(inqValue) {
        try{
            const tempArr1 = [3, 0, 0, 0, 0, 1, 2]; // Should be improved
            const tempArr2 = ['주중', '금요일', '토요일', '일요일'];
            // search class A
            for(var i = 0;i < inqValue.length;i++){
                var timeZ = parseInt(Number(inqValue[i]['time'].split(' ')[1].split(':')[0])/2);
                var weekday = tempArr1[Math.abs(new Date(inqValue[i]['time'].split(' ')[0]).getDay())];
                var keyStr = `${weekday}T${timeZ}_${inqValue[i]['location']}_${inqValue[i]['status']}`;
                if(this.medi.hasOwnProperty(keyStr)){ 
                    return {
                        'location': inqValue[i]['location'],
                        'status': inqValue[i]['status'],
                        'statusN': constant.construct.f03(inqValue[i]['status']),
                        'time': inqValue[i]['time'],
                        'timeZ': `${tempArr2[weekday]} ${constant.transform.num2timeZone(timeZ)}`,
                        'keyStr': keyStr,
                    };
                }
            }
            // search class B (without location)
            for(var i = 0;i < inqValue.length;i++){
                var timeZ = parseInt(Number(inqValue[i]['time'].split(' ')[1].split(':')[0])/2);
                var weekday = tempArr1[Math.abs(new Date(inqValue[i]['time'].split(' ')[0]).getDay())];
                var keyStr = `${weekday}T${timeZ}_${inqValue[i]['status']}`;
                if(this.medi.hasOwnProperty(keyStr)){ 
                    return {
                        'location': inqValue[i]['location'],
                        'status': inqValue[i]['status'],
                        'statusN': constant.construct.f03(inqValue[i]['status']),
                        'time': inqValue[i]['time'],
                        'timeZ': `${tempArr2[weekday]} ${constant.transform.num2timeZone(timeZ)}`,
                        'keyStr': keyStr,
                    };
                }
            }
            return {'keyStr': 'none'};
        }catch(err){
            console.log(`error occur in Post.js > takeAim. err = ${err}`);
            throw new Error('aimVal');
        }
    }

    async inquiry() {
        var inqValue;
        var direcLoc;
        var aimValue;

        switch(this.company){
            case 'po':
                inqValue = await inquiry.po(Number(this.number));
                direcLoc = './src/database/po';
                break;
            case 'cj':
                inqValue = await inquiry.cj(Number(this.number));
                direcLoc = './src/database/cj';
                break;
            case 'lg':
                inqValue = await inquiry.lg(Number(this.number));
                direcLoc = './src/database/lg';
                break;
            default:
                return constant.errList.COMPANY_NULL_ERR;
        }
        if (!inqValue.length) { return constant.errList.INQUIRY_NULL_ERR; }
        
        try {
            this.readFile(direcLoc);
            aimValue = this.takeAim(inqValue);
        } catch(err) { return constant.errList.DB_READ_FAIL; }
        if (aimValue.keyStr == 'none') { return constant.errList.DB_SRC_FAIL; }

        if(!fs.existsSync(direcLoc+'/invoice.txt', fs.constants.W_OK)) { fs.appendFileSync(direcLoc+'/invoice.txt', ''); }
        try{
            const invoice = fs.readFileSync(direcLoc+'/invoice.txt', "utf-8").split(';');
            invoice.push(this.number);
            fs.writeFileSync(direcLoc+'/invoice.txt', invoice.join(';'));
        } catch(err) { ; }

        return {
            success: true,
            inquiry: inqValue,
            target: aimValue,
            input: {number: String(this.number), company: constant.transform.code2name(this.company)},
        };
    }

    async predict(target) {
        try{
            const mediVal = this.medi[target['keyStr']];
            return {
                success: true,
                p25: constant.construct.f01(mediVal['25']), 
                p50: constant.construct.f01(mediVal['50']), 
                p75: constant.construct.f01(mediVal['75']), 
                p95: constant.construct.f01(mediVal['95']), 
                pred: constant.construct.f02(target.time, mediVal['75'], mediVal['95'])
            };
        } catch{
            return constant.errList.SERVER_PRED_ERR;
        }
    }

    async historgram(target){
        const histVal = this.hist[target['keyStr']];
        var histArr = [];
        var spotArr = ['0h', '24h', '48h', '72h'];
        var max = -1, total = 0;

        for (var i=1;histVal.hasOwnProperty(`h${i}`);i++) {
            if (histVal[`h${i}`] > max) { max = histVal[`h${i}`]; }
            total +=  histVal[`h${i}`];
            histArr.push(histVal[`h${i}`]);
        }
        for (var i=0;i < histArr.length;i++){
            histArr[i] = parseInt(histArr[i] * 1000 / max);
        }
        if ((histArr.length > 48) && (Math.max(...histArr.slice(histArr.length-24)) <= 10)) {
            histArr.splice(histArr.length-24);
            spotArr = ['0h', '12h', '24h', '36h', '48h']
        }
        return {
            n: total,
            res: histArr,
            spot: spotArr
        };
    }

    async search() {
        var resInq, resPred, resHist;
        resInq = await this.inquiry();
        if (resInq.success) { delete resInq.success; }
        else { return resInq; }
        resPred = await this.predict(resInq.target);
        if (resPred.success) { delete resPred.success; }
        else { return resPred; }
        resHist = await this.historgram(resInq.target);
        
        return {
            success: true,
            input: resInq.input,
            inquiry: resInq.inquiry,
            target: resInq.target,
            predict: resPred,
            histogram: resHist
        };
    }
}

module.exports = Post;