const HISTORY_KEY = "calculationHistory";
const HISTORY_DURATION = 1000 * 60 * 60 * 48;
const RESTORE_KEY = "historyToRestore";


function getHistory() {

    const storedHistory = localStorage.getItem(HISTORY_KEY);

    if (!storedHistory) {
        return [];
    }

    try {
        return JSON.parse(storedHistory);
    } catch (error) {
        console.error("Failed to read history:", error);
        return [];
    }
}


function saveHistory(calculator, page, input, result) {

    let history = getHistory();

    const historyEntry = {
        id: crypto.randomUUID(),
        calculator: calculator,
        page: page,
        timestamp: Date.now(),
        input: input,
        result: result
    };

    history.push(historyEntry);

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );
}


function cleanExpiredHistory() {

    const history = getHistory();

    const now = Date.now();

    const validHistory = history.filter(entry => {
        return now - entry.timestamp < HISTORY_DURATION;
    });

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(validHistory)
    );

    return validHistory;
}


function setHistoryToRestore(id) {

    localStorage.setItem(
        RESTORE_KEY,
        id
    );
}


function restoreHistoryInputs() {

    const historyId =
        localStorage.getItem(RESTORE_KEY);

    if (!historyId) {
        return;
    }

    const history = cleanExpiredHistory();

    const entry = history.find(
        item => item.id === historyId
    );

    // Remove the restore request immediately
    localStorage.removeItem(RESTORE_KEY);

    if (!entry || !entry.input) {
        return;
    }

    Object.entries(entry.input).forEach(([id, value]) => {

        const input =
            document.getElementById(id);

        if (!input) {
            return;
        }

        if (Array.isArray(value)) {
            input.value = value.join(", ");
        } else {
            input.value = value;
        }
    });
}