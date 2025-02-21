let score = 0;
let timeLeft = 30;
let interval;
let currentUser = null;

function login() {
    const username = document.getElementById('username').value;
    if (username) {
        fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        })
        .then(response => response.json())
        .then(data => {
            currentUser = username;
            score = data.score || 0;
            document.getElementById('score').textContent = score;
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('game-section').style.display = 'block';
            createGrid();
        });
    }
}

function createGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.classList.add('hole');
        hole.addEventListener('click', () => whack(hole));
        grid.appendChild(hole);
    }
}

function startGame() {
    score = 0;
    timeLeft = 30;
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timeLeft;
    interval = setInterval(() => {
        updateTimer();
        spawnCharacter();
    }, 1000);
}

function updateTimer() {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(interval);
        saveScore();
        alert(`Game Over! Final Score: ${score}`);
    }
}

function spawnCharacter() {
    const holes = document.querySelectorAll('.hole');
    holes.forEach(hole => hole.classList.remove('active'));
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    const isFox = Math.random() < 0.3; // 30% chance for fox
    randomHole.textContent = isFox ? '🦊' : '🐹';
    randomHole.classList.add('active');
    setTimeout(() => {
        randomHole.classList.remove('active');
        randomHole.textContent = '';
    }, 800);
}

function whack(hole) {
    if (hole.classList.contains('active')) {
        if (hole.textContent === '🦊') {
            score -= 2;
        } else {
            score += 1;
        }
        document.getElementById('score').textContent = score;
        hole.classList.remove('active');
        hole.textContent = '';
    }
}

function saveScore() {
    fetch('http://localhost:5000/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, score })
    });
}