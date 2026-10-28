const dayNumberEl = document.getElementById("day-number");
const dateEl = document.getElementById("date");
const swapBtnEl = document.getElementById("swap-btn");
const swapBtnLabelEl = document.getElementById("swap-btn-label");

dayNumberEl.innerText = "1";

dateEl.innerText = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
}).format(new Date()).replace(",", "");

swapBtnEl.addEventListener("click", function() {
    if (swapBtnLabelEl.innerText == "Consumed") {
        swapBtnLabelEl.innerText = "Remaining";
    } else {
        swapBtnLabelEl.innerText = "Consumed";
    }
});