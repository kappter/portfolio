// Sample list of rare English words with definitions
const rareWords = [
    { word: "quixotic", definition: "(adjective) Unrealistically optimistic or impractical." },
    { word: "susurrus", definition: "(noun) A soft, whispering or rustling sound; a murmur." },
    { word: "epiphany", definition: "(noun) A sudden realization or insight." },
    { word: "defenestration", definition: "(noun) The act of throwing someone or something out of a window." },
    { word: "petrichor", definition: "(noun) The pleasant smell that accompanies the first rain after a dry spell." },
    { word: "flummox", definition: "(verb) To confuse or perplex." },
    { word: "lollygag", definition: "(verb) To spend time aimlessly; to dawdle." },
    { word: "skulduggery", definition: "(noun) Underhanded or unscrupulous behavior; trickery." },
    { word: "cattywampus", definition: "(adjective) Not lined up or arranged properly; askew." },
    { word: "gobbledygook", definition: "(noun) Language that is meaningless or hard to understand." }
];

// Game state variables
let score = 0;
let misses = 0;
const maxMisses = 3;
let currentQuestionIndex = 0;
const questionsPerRound = 5;
let currentQuestions = []; // { word: '...', definition: '...', options: ['...', ...], answer: '...' }
let selectedGameTheme = 'all';

// DOM Elements
let gameThemeSelect, startGameButton, gamePlayArea, gameDefinition, choicesArea, feedbackText, scoreSpan, missesSpan, questionNumberSpan, gameOverDiv, finalScoreSpan, playAgainButton, nextQuestionButton, gameSetupArea;

// Function to get DOM elements
function getGameDOMElements() {
    gameThemeSelect = document.getElementById("gameThemeType");
    startGameButton = document.getElementById("startGameButton");
    gamePlayArea = document.getElementById("game-play");
    gameDefinition = document.getElementById("gameDefinition");
    choicesArea = document.getElementById("choices-area");
    feedbackText = document.getElementById("feedbackText");
    scoreSpan = document.getElementById("score");
    missesSpan = document.getElementById("misses");
    questionNumberSpan = document.getElementById("questionNumber");
    gameOverDiv = document.getElementById("game-over");
    finalScoreSpan = document.getElementById("finalScore");
    playAgainButton = document.getElementById("playAgainButton");
    nextQuestionButton = document.getElementById("nextQuestionButton");
    gameSetupArea = document.getElementById("game-setup");

    if (!gameThemeSelect || !startGameButton || !gamePlayArea || !gameDefinition || !choicesArea || !feedbackText || !scoreSpan || !missesSpan || !questionNumberSpan || !gameOverDiv || !finalScoreSpan || !playAgainButton || !nextQuestionButton || !gameSetupArea) {
        console.error("One or more game elements are missing! Check HTML IDs.");
        console.log({ gameThemeSelect, startGameButton, gamePlayArea, gameDefinition, choicesArea, feedbackText, scoreSpan, missesSpan, questionNumberSpan, gameOverDiv, finalScoreSpan, playAgainButton, nextQuestionButton, gameSetupArea });
        return false;
    }
    return true;
}

// Generate questions for the current round
function generateQuestions(theme) {
    console.log(`Generating ${questionsPerRound} questions for theme: ${theme}`);
    currentQuestions = [];
    const wordType = 'pre-root-suf'; // Consistent word structure for generated words

    if (typeof themes === 'undefined' || Object.keys(themes).length === 0) {
        console.error("Themes object not available to generate questions.");
        alert("Error: Word data not loaded. Cannot start game.");
        return false;
    }

    // Randomly select rare words
    const shuffledRareWords = [...rareWords].sort(() => Math.random() - 0.5);
    const selectedRareWords = shuffledRareWords.slice(0, questionsPerRound);

    for (const rareWord of selectedRareWords) {
        const options = [rareWord.word];
        let distractorAttempts = 0;
        const maxDistractorAttempts = 30;

        // Generate three unique distractors without hyphens
        while (options.length < 4 && distractorAttempts < maxDistractorAttempts) {
            distractorAttempts++;
            const { word: distractorWord } = generateWordAndDefinition(wordType, theme, { removeHyphens: true });
            if (distractorWord !== "Error" && !options.includes(distractorWord) && !rareWords.some(rw => rw.word === distractorWord)) {
                options.push(distractorWord);
            }
        }

        if (options.length < 4) {
            console.warn(`Could not generate enough distractors for real word: ${rareWord.word}. Skipping question.`);
            continue;
        }

        shuffleArray(options); // Randomize option order

        currentQuestions.push({
            word: rareWord.word,
            definition: rareWord.definition,
            options: options,
            answer: rareWord.word
        });
    }

    if (currentQuestions.length < questionsPerRound) {
        console.error(`Failed to generate enough unique questions (${currentQuestions.length}/${questionsPerRound}) for theme '${theme}'.`);
        alert(`Could only generate ${currentQuestions.length} unique questions. Please try again.`);
        return false;
    }

    console.log("Generated questions:", currentQuestions);
    return true;
}

// Display the current question
function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        console.log("Attempted to display question beyond round limit.");
        showGameOver("round_complete");
        return;
    }
    const q = currentQuestions[currentQuestionIndex];
    gameDefinition.textContent = q.definition;
    choicesArea.innerHTML = ''; // Clear previous options
    q.options.forEach(option => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => handleAnswer(option, button);
        li.appendChild(button);
        choicesArea.appendChild(li);
    });
    feedbackText.textContent = '';
    feedbackText.parentElement.classList.add('hidden');
    nextQuestionButton.style.display = 'none';
    gamePlayArea.classList.remove('hidden');
    updateScoreboard();
}

// Handle the user's answer selection
function handleAnswer(selectedOption, selectedButton) {
    const correctAnswer = currentQuestions[currentQuestionIndex].answer;
    const buttons = choicesArea.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent === correctAnswer) {
            button.classList.add('correct');
        }
    });

    feedbackText.parentElement.classList.remove('hidden');

    if (selectedOption === correctAnswer) {
        score++;
        feedbackText.textContent = "Correct! That's a real English word!";
        feedbackText.style.color = 'green';
    } else {
        misses++;
        feedbackText.textContent = `Incorrect. The real word was: ${correctAnswer}`;
        feedbackText.style.color = 'red';
        if (selectedButton) {
            selectedButton.classList.add('incorrect');
        }
    }
    updateScoreboard();

    if (misses >= maxMisses) {
        showGameOver("too_many_misses");
    } else if (currentQuestionIndex >= questionsPerRound - 1) {
        showGameOver("round_complete");
    } else {
        nextQuestionButton.style.display = 'block';
    }
}

// Update the score and misses display
function updateScoreboard() {
    scoreSpan.textContent = score;
    missesSpan.textContent = maxMisses - misses;
    const displayIndex = Math.min(currentQuestionIndex + 1, questionsPerRound);
    questionNumberSpan.textContent = `${displayIndex}`;
}

// Show the game over screen
function showGameOver(reason) {
    console.log("Game Over. Reason:", reason);
    gamePlayArea.classList.add('hidden');
    gameOverDiv.classList.remove('hidden');
    finalScoreSpan.textContent = score;
    nextQuestionButton.style.display = 'none';
}

// Reset the game state and UI
function resetGame() {
    score = 0;
    misses = 0;
    currentQuestionIndex = 0;
    currentQuestions = [];
    gameOverDiv.classList.add('hidden');
    gamePlayArea.classList.add('hidden');
    gameSetupArea.classList.remove('hidden');
    feedbackText.textContent = '';
    feedbackText.parentElement.classList.add('hidden');
    if (gameThemeSelect) gameThemeSelect.value = 'all';
    updateScoreboard();
}

// Start a new game round
function startGame() {
    if (!gameThemeSelect) {
        console.error("Game theme select element not found!");
        return;
    }
    selectedGameTheme = gameThemeSelect.value;
    console.log(`Starting game with theme: ${selectedGameTheme}`);
    gameSetupArea.classList.add('hidden');
    gameOverDiv.classList.add('hidden');

    score = 0;
    misses = 0;
    currentQuestionIndex = 0;

    if (generateQuestions(selectedGameTheme)) {
        gamePlayArea.classList.remove('hidden');
        displayQuestion();
    } else {
        resetGame();
    }
}

// Utility to shuffle array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log("Guess the Real Word page DOM fully loaded.");

    if (!getGameDOMElements()) {
        console.error("Failed to get all required game DOM elements. Game cannot start.");
        document.body.innerHTML = "<h1>Error: Failed to load game elements. Check console.</h1>";
        return;
    }

    // Initial UI state
    gamePlayArea.classList.add('hidden');
    gameOverDiv.classList.add('hidden');
    nextQuestionButton.style.display = 'none';
    gameSetupArea.classList.remove('hidden');
    feedbackText.parentElement.classList.add('hidden');

    // Add event listeners
    startGameButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', resetGame);
    nextQuestionButton.addEventListener('click', () => {
        currentQuestionIndex++;
        displayQuestion();
    });

    // Wait for themes to be loaded by script.js
    console.log("Waiting for 'themesLoaded' event...");
    document.addEventListener('themesLoaded', () => {
        console.log("'themesLoaded' event received.");
        if (typeof populateThemeDropdown === "function") {
            console.log("Populating game theme dropdown...");
            populateThemeDropdown();
        } else {
            console.error("populateThemeDropdown function is not available!");
            if (gameThemeSelect) gameThemeSelect.innerHTML = '<option value="error">Error loading themes</option>';
        }
    }, { once: true });

    // Check if themes might already be loaded
    if (typeof themes !== 'undefined' && Object.keys(themes).length > 0) {
        console.log("Themes already loaded, populating dropdown immediately.");
        if (typeof populateThemeDropdown === "function") {
            populateThemeDropdown();
        } else {
            console.error("populateThemeDropdown function is not available!");
            if (gameThemeSelect) gameThemeSelect.innerHTML = '<option value="error">Error loading themes</option>';
        }
    } else {
        console.log("Themes not yet loaded, waiting for event.");
    }
});