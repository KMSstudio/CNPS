"use strict";

const number = document.querySelector("#number");
const company = document.querySelector("#company");
const submit = document.querySelector("#submit");

submit.addEventListener("click", search);
function search(){
    number.value = String(number.value).replace('-', '');
    if (company.value == 'none') { alert('운송사명을 선택해주세요.') }
    else if (number.value == '') { alert('올바른 운송장번호를 입력해주세요') }
    else {location.href = `/search?number=${number.value}&company=${company.value}`;}
}

window.onload = function() {
    document.querySelector("#res").scrollIntoView({block:'start', behavior: 'smooth'});
}