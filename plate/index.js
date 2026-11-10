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
        swapBtnEl.style.color = "#FCA5A5";
    } else {
        swapBtnLabelEl.innerText = "Consumed";
        swapBtnEl.style.color = "#86EFAC";
    }

    updateProgressBars(displayedDay);
});

const fatProgressBar = document.getElementsByClassName("fat")[0];
const carbsProgressBar = document.getElementsByClassName("carbs")[0];
const proteinProgressBar = document.getElementsByClassName("protein")[0];

const fatTotal = document.getElementById("fat-total");
const carbsTotal = document.getElementById("carbs-total");
const proteinTotal = document.getElementById("protein-total");

const calorieRing = document.getElementById("calorie-ring");
const calorieTotal = document.getElementById("calorie-total");

// retrievedDay that can be passed to the event listener attached to swapBtnEl
let displayedDay;

function updateProgressBars(retrievedDay) {
    displayedDay = retrievedDay;

    // copy the toggle label to #info so CSS can switch the ring and bars between modes
    document.getElementById("info").dataset.mode = swapBtnLabelEl.innerText;

    if (retrievedDay === undefined) {
        calorieRing.style.setProperty("--ring-fill", "0%");
        fatProgressBar.style.width = "0%";
        carbsProgressBar.style.width = "0%";
        proteinProgressBar.style.width = "0%";

        calorieTotal.textContent = "0";
        fatTotal.textContent = "0 g";
        carbsTotal.textContent = "0 g";
        proteinTotal.textContent = "0 g";

        return;
    }

    let macroInfo = retrievedDay.totals;
    const macroGoals = defaultProgram.goals;
    
    if (swapBtnLabelEl.innerText == "Remaining") {
        macroInfo = {
            calories: Math.max(macroGoals.calories - macroInfo.calories, 0),
            fat: Math.max(macroGoals.fat - macroInfo.fat, 0),
            carbs: Math.max(macroGoals.carbs - macroInfo.carbs, 0),
            protein: Math.max(macroGoals.protein - macroInfo.protein, 0)
        };
    }

    calorieRing.style.setProperty(
        "--ring-fill",
        getProgressWidth(macroInfo.calories, macroGoals.calories)
    );

    fatProgressBar.style.width = getProgressWidth(macroInfo.fat, macroGoals.fat);
    carbsProgressBar.style.width = getProgressWidth(macroInfo.carbs, macroGoals.carbs);
    proteinProgressBar.style.width = getProgressWidth(macroInfo.protein, macroGoals.protein);

    calorieTotal.textContent = macroInfo.calories;
    fatTotal.textContent = `${Number(macroInfo.fat.toFixed(2))} g`;
    carbsTotal.textContent = `${Number(macroInfo.carbs.toFixed(2))} g`;
    proteinTotal.textContent = `${Number(macroInfo.protein.toFixed(2))} g`;
}

function getProgressWidth(macroTotal, macroGoal) {
    if (macroGoal <= 0) {
        return "0%";
    }

    const progressBarPercentage = Math.min(macroTotal / macroGoal * 100, 100);
    return `${progressBarPercentage}%`;
}

// controls for the program dialog
const editProgramBtn = document.getElementById("edit-program-btn");
const programDialog = document.getElementById("program-dialog");
const programForm = document.getElementById("program-form");
const programNameInput = document.getElementById("program-name-input");
const calorieGoalInput = document.getElementById("calorie-goal-input");
const programSaveBtn = document.getElementById("program-save-btn");
const programSaveStatus = document.getElementById("program-save-status");

let savedProgramName = null;

let defaultProgram = {
    name: "EZ Fit",
    goals: {
        calories: 2110,
        fat: 70,
        carbs: 210,
        protein: 160
    }
};

const macroControls = [
    {name: "fat", caloriesPerGram: 9},
    {name: "carbs", caloriesPerGram: 4},
    {name: "protein", caloriesPerGram: 4}
];

// each macro has a goal input, a percentage label, and a slider
for (const macro of macroControls) {
    macro.goalInput = document.getElementById(`${macro.name}-goal-input`);
    macro.percentageLabel = document.getElementById(`${macro.name}-goal-percentage`);
    macro.slider = document.getElementById(`${macro.name}-goal-slider`);
    macro.percent = 0;
}

// calculate the calorie total and percentage split from the goal inputs
function readMacroGoals() {
    let totalCalories = 0;

    for (const macro of macroControls) {
        if (!macro.goalInput.validity.valid) {
            return;
        }

        totalCalories += macro.goalInput.valueAsNumber * macro.caloriesPerGram;
    }

    calorieGoalInput.value = Number(totalCalories.toFixed(2));

    for (const macro of macroControls) {
        if (totalCalories > 0) {
            const macroCalories = macro.goalInput.valueAsNumber * macro.caloriesPerGram;
            macro.percent = macroCalories / totalCalories * 100;
        } else {
            macro.percent = 100 / 3;
        }
    }

    showMacroPercentages();
}

// show the percentage split
function showMacroPercentages() {
    for (const macro of macroControls) {
        macro.slider.value = macro.percent;
        macro.percentageLabel.textContent = `${Number(macro.percent.toFixed(1))}%`;
    }
}

// convert the calorie goal and percentage split back into grams for the goal inputs
function updateMacroGoals() {
    if (!calorieGoalInput.validity.valid) {
        return;
    }

    const totalCalories = calorieGoalInput.valueAsNumber;

    for (const macro of macroControls) {
        const macroCalories = totalCalories * macro.percent / 100;
        const grams = macroCalories / macro.caloriesPerGram;

        macro.goalInput.value = Number(grams.toFixed(2));
    }
}

// move one slider and redistribute the remaining percentage
function changeMacroPercentage(changedMacro) {
    if (!calorieGoalInput.reportValidity()) {
        showMacroPercentages();
        return;
    }

    const otherMacros = [];

    // collect the two macros that will split the remaining percentage
    for (const macro of macroControls) {
        if (macro !== changedMacro) {
            otherMacros.push(macro);
        }
    }

    const firstOtherMacro = otherMacros[0];
    const secondOtherMacro = otherMacros[1];
    
    // add together the old percentages of the two sliders that weren't moved
    const previousShare = firstOtherMacro.percent + secondOtherMacro.percent;

    // read the percentage from the slider the user moved
    changedMacro.percent = changedMacro.slider.valueAsNumber;
    const remainingPercent = 100 - changedMacro.percent;

    // if the other two macros had previously set percentages, preserve their ratio
    if (previousShare > 0) {
        // give the first macro the same fraction of the remaining percentage as before
        firstOtherMacro.percent = remainingPercent * firstOtherMacro.percent / previousShare;
    } else {
        // if there were no previously set percentages, then just split it equally
        firstOtherMacro.percent = remainingPercent / 2;
    }

    // give whatever percentage is left over
    secondOtherMacro.percent = remainingPercent - firstOtherMacro.percent;

    showMacroPercentages();
    updateMacroGoals();
}

// change the fields and sliders based on the calculations
for (const macro of macroControls) {
    macro.goalInput.addEventListener("input", readMacroGoals);

    macro.slider.addEventListener("input", () => {
        changeMacroPercentage(macro);
    });
}

calorieGoalInput.addEventListener("input", updateMacroGoals);

// fill with default values
editProgramBtn.addEventListener("click", () => {
    programNameInput.value = defaultProgram.name;

    for (const macro of macroControls) {
        macro.goalInput.value = defaultProgram.goals[macro.name];
    }

    readMacroGoals();
    calorieGoalInput.value = defaultProgram.goals.calories;
    programSaveStatus.textContent = "";
    programDialog.showModal();
});

document.getElementById("close-program-dialog-btn").addEventListener("click", () => {
    programDialog.close();
});

// update the default nutrition program name to the user-defined nutrition program name
function showSavedNutritionProgram(savedNutritionProgram) {
    defaultProgram = savedNutritionProgram;
    savedProgramName = savedNutritionProgram.name;
    editProgramBtn.textContent = savedNutritionProgram.name;
}

// save the current values in the program editor
programForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const programName = programNameInput.value.trim();

    if (programName.length === 0) {
        programSaveStatus.textContent = "Enter a program name.";
        return;
    }

    const program = {
        name: programName,
        goals: {
            calories: calorieGoalInput.valueAsNumber
        }
    };

    for (const macro of macroControls) {
        program.goals[macro.name] = macro.goalInput.valueAsNumber;
    }

    programSaveBtn.disabled = true;
    programSaveStatus.textContent = "Saving...";

    // from db.js
    saveNutritionProgram(program, savedProgramName, (saveSucceeded) => {
        programSaveBtn.disabled = false;

        if (saveSucceeded) {
            showSavedNutritionProgram(program);

            const todayDate = getTodayDate();
            getDay(todayDate);

            programDialog.close();
        } else {
            programSaveStatus.textContent = "Could not save the program. Try again.";
        }
    });
});