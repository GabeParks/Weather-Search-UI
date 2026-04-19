const wordPool = ["APPLE", "TRAIN", "HOUSE", "BRICK", "GHOST", "BLADE", "CRANE"];

const game = {
    targetWord: "",
    currentRow: 0,
    currentCol: 0,
    guesses: ["", "", "", "", "", ""],
    feedback: [], 
    state: "playing" 
};

const boardElement = document.getElementById("game-board");
const statusElement = document.getElementById("status-message");
const restartBtn = document.getElementById("restart-btn");

function initGame() {
    game.targetWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    game.currentRow = 0;
    game.currentCol = 0;
    game.guesses = ["", "", "", "", "", ""];
    game.feedback = [];
    game.state = "playing";

    statusElement.textContent = "";
    restartBtn.style.display = "none";
    renderGame();
}

function processInput(key) {
    if (game.state !== "playing") return;

    if (key === "ENTER") {
        if (game.currentCol === 5) {
            evaluateGuess();
        } else {
            statusElement.textContent = "Not enough letters";
            setTimeout(() => statusElement.textContent = "", 1500);
        }
    } else if (key === "BACKSPACE") {
        if (game.currentCol > 0) {
            game.currentCol--;
            let currentWord = game.guesses[game.currentRow];
            game.guesses[game.currentRow] = currentWord.slice(0, -1);
        }
    } else if (/^[A-Z]$/.test(key)) { 
        if (game.currentCol < 5) {
            game.guesses[game.currentRow] += key;
            game.currentCol++;
        }
    }
}

function evaluateGuess() {
    const guess = game.guesses[game.currentRow];
    const target = game.targetWord;

    let rowFeedback = ["absent", "absent", "absent", "absent", "absent"];
    let targetLetterCount = {};

    for (let i = 0; i < target.length; i++) {
        targetLetterCount[target[i]] = (targetLetterCount[target[i]] || 0) + 1;
    }

    for (let i = 0; i < 5; i++) {
        if (guess[i] === target[i]) {
            rowFeedback[i] = "correct";
            targetLetterCount[guess[i]]--;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (rowFeedback[i] === "absent" && targetLetterCount[guess[i]] > 0) {
            rowFeedback[i] = "present";
            targetLetterCount[guess[i]]--;
        }
    }

    game.feedback.push(rowFeedback);

    if (guess === game.targetWord) {
        game.state = "win";
    } else if (game.currentRow === 5) {
        game.state = "lose";
    } else {
        game.currentRow++;
        game.currentCol = 0;
    }
}

function renderGame() {
    boardElement.innerHTML = ""; 
    for (let r = 0; r < 6; r++) {
        const guess = game.guesses[r];
        const rowFeedback = game.feedback[r];

        for (let c = 0; c < 5; c++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.textContent = guess[c] || ""; 
            if (rowFeedback && rowFeedback[c]) {
                tile.classList.add(rowFeedback[c]);
            }

            boardElement.appendChild(tile);
        }
    }

    if (game.state === "win") {
        statusElement.textContent = "Congratulations! You won!";
        statusElement.style.color = "#6aaa64";
        restartBtn.style.display = "inline-block";
    } else if (game.state === "lose") {
        statusElement.textContent = `Game Over! The word was ${game.targetWord}.`;
        statusElement.style.color = "#d9534f";
        restartBtn.style.display = "inline-block";
    } else {
        statusElement.style.color = "black";
    }
}

document.addEventListener("keydown", (event) => {

    if (event.ctrlKey || event.metaKey || event.altKey) return; 

    const key = event.key.toUpperCase();
    processInput(key);
    renderGame();
});

restartBtn.addEventListener("click", () => {
    initGame();
});

initGame();
