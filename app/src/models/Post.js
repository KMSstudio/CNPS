"use strict";

const fs = require('fs');
const inquiry = require("./Inquiry");

const construct = {
    f01: (factor) => {
        if (parseInt(factor / 1440) == 0) { return `${parseInt(factor / 60)}시간 ${factor % 60}분` }
        else { return `${parseInt(factor / 1440)}일 ${parseInt(factor % 1440 / 60)}시간 ${factor % 60}분` }
    },

    f02: (anchor, pass) => {
        const [dateStr, timeStr] = anchor.split(' ');
        const [year, month, day] = dateStr.split('-');
        const [hours, minutes] = timeStr.split(':');
        const date = new Date(parseInt(year), parseInt(month-1), parseInt(day), parseInt(hours), parseInt(minutes));
        date.setMinutes(date.getMinutes() + pass);
        return `${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분`
    },
    
    f03: (status) => {
        const charCode = status.charCodeAt(status.length-1);
        return ((charCode - 44032) % 28) ? `${status}이` : `${status}가`;
    }
}

const errList = {
    COMPANY_NULL_ERR: { success: false, msg: '올바르지 못한 운송사명이 입력되었습니다.',
        code: '101: COMPANY_NULL_ERR',
        sol: ['운송사명을 선택하였는지 확인합니다.', 'CNPS는 우체국택배(po), cj대한통운(cj), 롯데글로벌로지스(lt), 로젠택배(lg)에 대한 배송조회만을 지원합니다.'],
    },
    INQUIRY_NULL_ERR: { success: false, msg: '운송장 조회를 할 수 없습니다.',
        code: '102: INQUIRY_NULL_ERR',
        sol: ['운송장번호를 맞게 입력하였는지 확인합니다.', '올바른 운송사명을 입력하였는지 확인합니다.', 
            '반나절 정도 기다린 후 다시 조회해봅니다. 소포가 집화처리 된 시점부터 조회가 가능합니다.'],
    },
    DB_READ_FAIL: { success: false, msg: '해당 운송장에 맞는 데이터를 조회할 수 없습니다.',
        code: '301: DB_READ_FAIL',
        sol: ['데이터베이스에서 해당 택배에 적절한 통계를 조회할 수 없습니다.', '개발자에게 메일을 보내 서비스를 개선해주세요.']
    },
    DB_SRC_FAIL: { success: false, msg: '해당 운송장에 맞는 데이터를 조회할 수 없습니다.',
        code: '302: DATABASE_SEARCH_FAIL',
        sol: ['개발자에게 메일을 보내 부족한 데이터 보충을 요청해주세요', '반나절 정도 기다린 후 다시 조회해봅니다. 배송과정에 진전이 생기면 새로운 데이터 조회가 가능합니다.']
    }
}

const convert = {
    code2name: (code) => {
        if (code == 'cj') { return '대한통운'; }
        else if (code == 'hj') { return '한진택배'; }
        else if (code == 'po') { return '우체국택배'; }
        else if (code == 'lg') { return '롯데글로벌로지스'; }
        else { return 'none#c2n'; }
    },
    num2timeZone: (num) => {
        switch(num) {
            case 0: return '제1 새벽 ( 00:00~01:59 )';
            case 1: return '제2 새벽 ( 02:00~03:59 )';
            case 2: return '제3 새벽 ( 04:00~05:59 )';
            case 3: return '제1 아침 ( 06:00~07:59 )';
            case 4: return '제2 아침 ( 08:00~09:59 )';
            case 5: return '제3 아침 ( 10:00~11:59 )';
            case 6: return '제1 낮 ( 12:00~13:59 )';
            case 7: return '제2 낮 ( 14:00~15:59 )';
            case 8: return '제3 낮 ( 16:00~17:59 )';
            case 9: return '제1 저녁 ( 18:00~19:59 )';
            case 10: return '제2 저녁 ( 20:00~21:59 )';
            case 11: return '제3 저녁 ( 22:00~23:59 )';
            default: return 'none#n2tz';
        }
    }
};

class Post{
    constructor(number, company) {
        this.number = number;
        this.company = company;
    }

    readFileCNPS(direcLoc) {
        try{
            const mdata = fs.readFileSync(direcLoc + '/medi.json');
            this.medi = JSON.parse(mdata);
            const hdata = fs.readFileSync(direcLoc + '/hist.json');
            this.hist = JSON.parse(hdata);
        }catch(err){
            console.log(`error occur in Post.js > readFileCNPS. err = ${err}`);
            throw new Error('readFile');
        }
    }

    takeaim(inqValue) {
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
                        'statusN': construct.f03(inqValue[i]['status']),
                        'time': inqValue[i]['time'],
                        'timeZ': `${tempArr2[weekday]} ${num2timeZone(timeZ)}`,
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
                        'statusN': construct.f03(inqValue[i]['status']),
                        'time': inqValue[i]['time'],
                        'timeZ': `${tempArr2[weekday]} ${num2timeZone(timeZ)}`,
                        'keyStr': keyStr,
                    };
                }
            }
            return {'keyStr': 'none'};
        }catch(err){
            console.log(`error occur in Post.js > takeaim. err = ${err}`);
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
                return errList.COMPANY_NULL_ERR;
        }
        if (!inqValue.length) { return errList.INQUIRY_NULL_ERR; }
        
        try {
            this.readFileCNPS(direcLoc);
            aimValue = this.takeaim(inqValue);
        } catch(err) { return errList.DB_READ_FAIL; }
        if (aimValue.keyStr == 'none') { return errList.DB_SRC_FAIL; }

        return {
            success: true,
            inquiry: inqValue,
            target: aimValue,
            input: {number: String(this.number), company: code2name(this.company)},
        };
    }

    async #predict(target) {
        const mediVal = this.medi[target['keyStr']];
        return {
            "p25": construct.f01(mediVal['25']), 
            "p50": construct.f01(mediVal['50']), 
            "p75": construct.f01(mediVal['75']), 
            "p95": construct.f01(mediVal['95']), 
            "pred": construct.f02(target.time, mediVal['75'])
        };
    }

    async #histogram(target){
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
        if (!resInq.success){ return resInq; }
        resPred = await this.#predict(resInq.target);
        resHist = await this.#histogram(resInq.target);
        
        return {
            'success': true,
            'input': resInq.input,
            'inquiry': resInq.inquiry,
            'target': resInq.target,
            'predict': resPred,
            'histogram': resHist
        };
    }
}

module.exports = Post;