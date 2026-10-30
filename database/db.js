// send request to open database
const openRequest = indexedDB.open("database");

openRequest.onerror = (e) => {
    // error
}

// first time creating the database
openRequest.onupgradeneeded = (e) => {
    const database = e.target.result;
    const store = database.createObjectStore("calendar", {keyPath: "date"});

    const startDate = Temporal.Now.plainDateISO().toString();
    const firstDay = createDay(startDate);

    store.put(firstDay);
}

// shared database connection
let db;

// successful database connection
openRequest.onsuccess = (e) => {
    // e is the event, target is the request that fired it, result is the opened database connection
    db = e.target.result;
}

// creates a new empty day record
function createDay(date) {
    return {
        date: date,
        totals: {
            calories: 0,
            fat: 0,
            carbs: 0,
            protein: 0
        },
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
    };
}

// saves a day record in the calendar store
function saveDay(day) {
    if (!db) {
        console.error("No database connection.");
        return;
    }

    const transaction = db.transaction("calendar", "readwrite");
    const store = transaction.objectStore("calendar");

    store.put(day);

    transaction.oncomplete = () => {
        console.log(`Saved: ${day.date}`);
    }

    transaction.onabort = () => {
        console.error(`Error: ${transaction.error}`);
    }
}

// retrieves a day record using its date property that matches its key
function getDay(date) {
    if (!db) {
        console.error("No database connection.");
        return;
    }

    const transaction = db.transaction("calendar", "readonly");
    const store = transaction.objectStore("calendar");

    // request the day record using its key
    const getDayRecordRequest = store.get(date);

    getDayRecordRequest.onsuccess = () => {
        const retrievedDay = getDayRecordRequest.result;
        console.log(retrievedDay);
    }
}

// adds macros to the selected meal
function addMacroEntry(meal, entry) {
    if (!db) {
        console.error("No database connection.");
        return;
    }

    const todayDate = Temporal.Now.plainDateISO().toString();

    const transaction = db.transaction("calendar", "readwrite");
    const store = transaction.objectStore("calendar");

    // request today's record
    const getTodayRecordRequest = store.get(todayDate);

    getTodayRecordRequest.onsuccess = () => {
        let todayRecord = getTodayRecordRequest.result;
        console.log(todayRecord);

        // create today's record if it doesn't exist already
        if (todayRecord == undefined || todayRecord == null) {
            todayRecord = createDay(todayDate);
        }

        // add the entry to the selected meal
        todayRecord[meal].push(entry);

        // add the entry's macros to today's totals
        todayRecord.totals.calories += entry.calories;
        todayRecord.totals.fat += entry.fat;
        todayRecord.totals.carbs += entry.carbs;
        todayRecord.totals.protein += entry.protein;

        // update today's record
        store.put(todayRecord);
    }

    transaction.oncomplete = () => {
        console.log(`Entry saved to ${meal} for ${todayDate}.`);
    }

    transaction.onabort = () => {
        console.error(`Could not save entry: ${transaction.error}`);
    }
}
