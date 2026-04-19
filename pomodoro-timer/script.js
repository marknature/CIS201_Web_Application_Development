const DEFAULT_TIME = 25 * 60; // 25 minutes in seconds
let timeRemaining = DEFAULT_TIME;
let timerInterval = null;
let isRunning = false;

const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const progressCircle = document.querySelector('.progress-ring__circle');

// Calculate circumference (2 * pi * r) where r is 140
const radius = progressCircle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = 0;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(timeRemaining);
}

function updateProgress() {
    // 0 is full, circumference is empty
    const offset = circumference - (timeRemaining / DEFAULT_TIME) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

function startTimer() {
    if (isRunning) return;
    
    if (timeRemaining === 0) {
        timeRemaining = DEFAULT_TIME;
    }

    isRunning = true;
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    startBtn.style.cursor = 'not-allowed';
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateDisplay();
        updateProgress();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.style.cursor = 'pointer';
            // Optional: Play a sound here
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    startBtn.style.cursor = 'pointer';
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    startBtn.style.cursor = 'pointer';
    timeRemaining = DEFAULT_TIME;
    updateDisplay();
    // Disable transition temporarily to snap back without animating backwards over 25 min
    progressCircle.style.transition = 'none';
    updateProgress();
    // Force a reflow
    progressCircle.getBoundingClientRect();
    // Re-enable transition
    progressCircle.style.transition = 'stroke-dashoffset 1s linear';
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize display
updateDisplay();
