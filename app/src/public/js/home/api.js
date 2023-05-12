"use strict";

const apiDoc = document.querySelector('#api-doc');

const srcSpec = document.querySelector("#src-spec");
const srcAsMsg = document.querySelector("#src-asmsg");

const logShow = document.querySelector("#log-show")
const logToday = document.querySelector("#log-today");
const logDown = document.querySelector("#log-down");

apiDoc.addEventListener("click", () => {
    location.href = `/api/apidoc`;
})

srcSpec.addEventListener("click", () => {
    const number = document.querySelector("#number");
    const company = document.querySelector("#company");
    location.href = `/api/makesrc?number=${number.value}&company=${company.value}`;
});
srcAsMsg.addEventListener("click", () => {
    const number = document.querySelector("#number");
    const company = document.querySelector("#company");
    location.href = `/api/makemsg?number=${number.value}&company=${company.value}`;
});

logShow.addEventListener("click", () => {
    const start = document.querySelector("#api-log-start").value || 0;
    const num = document.querySelector("#api-log-num").value || 2;

    location.href = `/api/showlog?start=${start}&num=${num}`;
});
logToday.addEventListener("click", () => {
    location.href = `/api/getlog`;
});
logDown.addEventListener("click", () => {
    const pre = document.querySelector("#api-log-start").value || 0;
    location.href = `/api/getlog?pre=${pre}`;
})

function apiInputRef() {
    const start = Number(document.querySelector("#api-log-start").value) || 0;
    const num = Number(document.querySelector("#api-log-num").value) || 2;

    console.log('hello');
    logShow.innerText = `show log about past ${start} ~ ${start+num-1} day`;
    logDown.innerText = `download log about ${start} days ago`;
};
document.querySelector("#api-log-start").addEventListener("change", apiInputRef);
document.querySelector("#api-log-num").addEventListener("change", apiInputRef);
apiInputRef();