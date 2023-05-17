"use strict";

window.onload = function() {
    const hist = histStr.split(',');
    const bars = document.querySelectorAll(".con-bar");
    for (var i = 0;i < bars.length;i++){
        const item = bars.item(i);
        item.style.height = `${parseInt(hist[i])/10}%`;
    }

    document.querySelector("#res").scrollIntoView({block:'start', behavior: 'smooth'});
}