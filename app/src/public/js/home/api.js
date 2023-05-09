"use strict";

const apiDoc = document.querySelector('#api-doc');

const srcSpec = document.querySelector("#src-spec");
const srcAsMsg = document.querySelector("#src-asmsg");

const logToday = document.querySelector("#log-today");
const logYest = document.querySelector("#log-yesterday");

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