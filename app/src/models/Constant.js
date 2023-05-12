"use strict";

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
        sol: ['개발자에게 메일을 보내 부족한 데이터 보충을 요청해주세요. 개발자 메일주소는 tomskang@naver.com입니다.', '반나절 정도 기다린 후 다시 조회해봅니다. 배송과정에 진전이 생기면 새로운 데이터 조회가 가능합니다.']
    },

    SERVER_PRED_ERR: {success: false, msg: '서버에서 배송도착시간 통계를 조회하는 과정에 알 수 없는 에러가 발생하였습니다.',
        code: '501: SERVER_PREDICT_ERR',
        sol: ['개발자에게 메일을 보내 부족한 데이터 보충을 요청해주세요. 개발자 메일주소는 tomskang@naver.com입니다.']
    },
    SERVER_LOG_ACS_ERR: {success: false, msg: '서버에서 로그를 가져올 수 없습니다.',
        code: '502: SERVER_LOG_ACS_ERR',
        sol: []
    },

    TYPE_ERR: {success: false, msg: '입력값의 타입이 잘못되었습니다.',
        code: '201: TYPE_ERR',
        sol: []
    }
}

const construct = {
    f01: (factor) => {
        if (parseInt(factor / 1440) == 0) { return `${parseInt(factor / 60)}시간 ${factor % 60}분` }
        else { return `${parseInt(factor / 1440)}일 ${parseInt(factor % 1440 / 60)}시간 ${factor % 60}분` }
    },

    f02: (anchor, pass75, pass95) => {
        const [dateStr, timeStr] = anchor.split(' ');
        const [year, month, day] = dateStr.split('-');
        const [hours, minutes] = timeStr.split(':');
        const today = new Date();
        const date = new Date(parseInt(year), parseInt(month-1), parseInt(day), parseInt(hours), parseInt(minutes));
        var range = '75%';
        date.setMinutes(date.getMinutes() + pass75);
        if ((today.getTime() - date.getTime()) / (1000*60) > 180) { 
            date.setMinutes(date.getMinutes() + (pass95-pass75)); 
            range = '95%';
        }
        return { 
            range: range,
            value: `${date.getMonth()+1}월 ${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분` };
    },
    
    f03: (status) => {
        const charCode = status.charCodeAt(status.length-1);
        return ((charCode - 44032) % 28) ? `${status}이` : `${status}가`;
    }
}

const transform = {
    code2name: (code) => {
        if (code == 'cj') { return '대한통운'; }
        else if (code == 'po') { return '우체국택배'; }
        else if (code == 'lt') { return '롯데글로벌로지스'; }
        else if (code == 'lg') { return '로젠택배'; }
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

module.exports = {
    errList,
    construct,
    transform
};