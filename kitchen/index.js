const listContainer = document.getElementById("list-container");
const foodContainer = document.getElementById("food-container");
const recipeContainer = document.getElementById("recipe-container");

function showList(swapFlag) {
    const nextContainer = swapFlag ? recipeContainer : foodContainer;
    const nextList = document.getElementById(swapFlag ? "recipe-list" : "food-list");
    
    if (!nextContainer.hidden) return;

    // if recipeContainer then hide foodContainer
    foodContainer.hidden = swapFlag;

    // if foodContainer then hide recipeContainer
    recipeContainer.hidden = !swapFlag;

    nextList.scrollTop = 0;
}

// to enable swiping to switch between lists
let swipe;

// detect the swipe
listContainer.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" && event.isPrimary) {
        swipe = {id: event.pointerId, x: event.clientX, y: event.clientY};
    }
});

// execute the swipe
listContainer.addEventListener("pointerup", (event) => {
    if (event.pointerId !== swipe.id) return;
    
    // deltaX is negative when swiping (left) to the next list
    // deltaX is positive when swiping (right) to the previous list
    const deltaX = event.clientX - swipe.x;
    const deltaY = event.clientY - swipe.y;
    
    // unset the swipe
    swipe = null;

    // if the horizontal swipe is intentional and the swipe is mostly horizontal
    if (Math.abs(deltaX) >= 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        let flag = deltaX < 0;
        showList(flag);
    }
});

// cancel the swipe
listContainer.addEventListener("pointercancel", (event) => {
    if (event.pointerId === swipe.id) swipe = null;
});
