"use strict";

const axios = require('axios');
const iconv = require('iconv-lite');

const inquiry = {
    cj: async (invoice) => {
        const html = await axios.get(`http://nplus.doortodoor.co.kr/web/detail.jsp?slipno=${invoice}`, {
            responseType: 'arraybuffer',
        });
        
        const content = iconv.decode(html.data, 'euc-kr').toString();
        const tableList = content.split('<tr')
        var inquiry = [];

        for (var i = 11;i+1 < tableList.length;i+=2){
            var timeList = tableList[i].split('&nbsp');
            var locList = tableList[i+1].split('&nbsp');

            inquiry.push({
                'location': locList[1].slice(1), 
                'status': locList[5].slice(1),
                'time': `${timeList[1].slice(1)} ${timeList[3].slice(1, -3)}`
            });
        }
        return inquiry;
    },
    po: async (invoice) => {
        const html = await axios.get(`https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${invoice}`, {
            responseType: 'arraybuffer',
        });
        
        const content = iconv.decode(html.data, 'utf-8').toString();
        const tableList = content.split('<tr')
        var inquiry = [];
        if (tableList.length <= 5){ return inquiry; }
    
        for (var i = 4;i < tableList.length;i++){
            var locStatus = tableList[i].split('<td>')[3].split('</')[0]
            
            inquiry.push({
                'location': locStatus.split('>')[locStatus.split('>').length-1], 
                'status': locStatus.split('\'')[1],
                'time': `${tableList[i].split('<td>')[1].split('</')[0].split('.').join('-')} ${tableList[i].split('<td>')[2].split('</')[0]}`
            });
        }
        inquiry.reverse();
        return inquiry;
    },
    lg: async (invoice) => {
        const html = await axios.get(`https://www.ilogen.com/web/personal/trace/${invoice}`, {
            responseType: 'arraybuffer',
        });
        
        const content = iconv.decode(html.data, 'utf-8').toString();
        const tableList = content.split('<tr')
        var inquiry = []
        if (tableList.length <= 7){ return inquiry; }
    
        for (var i = 7;i < tableList.length-3;i++){
            const values = tableList[i].split('<td>').slice(1, 4);
            
            inquiry.push({
                'location': values[1].split('</')[0], 
                'status': values[2].split('\n')[0],
                'time': values[0].split('</')[0].split('.').join('-')
            });
        }
        inquiry.reverse();
        return inquiry;
    }
}

module.exports = inquiry;