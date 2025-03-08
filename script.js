let score = 0;
let timeLeft = 60;
let interval;
let gameActive = false;
let currentUser = null;
let highScores = [];

// 音效
let hitSound, missSound, foxSound, gameStartSound, gameOverSound;

// 初始化游戏
function init() {
    loadSounds();
    fetchHighScores();
}

// 加载音效
function loadSounds() {
    hitSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
    missSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3');
    foxSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cartoon-failure-piano-473.mp3');
    gameStartSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3');
    gameOverSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3');
}

// 登录
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
            score = 0;
            document.getElementById('score').textContent = score;
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('game-section').style.display = 'block';
            document.getElementById('game-over').style.display = 'none';
            createGrid();
        })
        .catch(error => {
            console.error('Error:', error);
            // 如果API不可用，仍然允许游戏进行
            currentUser = username;
            score = 0;
            document.getElementById('score').textContent = score;
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('game-section').style.display = 'block';
            document.getElementById('game-over').style.display = 'none';
            createGrid();
        });
    } else {
        alert('请输入用户名');
    }
}

// 创建游戏网格
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

// 开始游戏
function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    score = 0;
    timeLeft = 60;
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('start-button').disabled = true;
    gameStartSound.play();
    
    // 清除之前的定时器
    if (interval) {
        clearInterval(interval);
    }
    
    // 游戏主循环
    interval = setInterval(() => {
        updateTimer();
        if (timeLeft > 0) {
            spawnCharacter();
        }
    }, 1000);
}

// 更新计时器
function updateTimer() {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
        endGame();
    }
}

// 随机出现角色
function spawnCharacter() {
    const holes = document.querySelectorAll('.hole');
    holes.forEach(hole => hole.classList.remove('active'));
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    
    // 小狐狸出现概率为5%-20%之间的随机值
    const foxProbability = Math.random() * 0.15 + 0.05;
    const isFox = Math.random() < foxProbability;
    
    randomHole.textContent = isFox ? '🦊' : '🐹';
    randomHole.classList.add('active');
    
    // 角色显示时间为0.7秒
    setTimeout(() => {
        if (randomHole.classList.contains('active')) {
            randomHole.classList.remove('active');
            randomHole.textContent = '';
        }
    }, 700);
}

// 打角色
function whack(hole) {
    if (!gameActive) return;
    
    if (hole.classList.contains('active')) {
        if (hole.textContent === '🦊') {
            score -= 2;
            foxSound.play();
            showFeedback(hole, '-2', 'red');
        } else {
            score += 1;
            hitSound.play();
            showFeedback(hole, '+1', 'green');
        }
        document.getElementById('score').textContent = score;
        hole.classList.remove('active');
        hole.textContent = '';
        
        // 添加点击动画效果
        const impact = document.createElement('div');
        impact.classList.add('impact');
        hole.appendChild(impact);
        setTimeout(() => {
            impact.remove();
        }, 300);
    } else {
        missSound.play();
    }
}

// 显示得分反馈
function showFeedback(element, text, color) {
    const feedback = document.createElement('div');
    feedback.textContent = text;
    feedback.style.position = 'absolute';
    feedback.style.color = color;
    feedback.style.fontSize = '24px';
    feedback.style.fontWeight = 'bold';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.pointerEvents = 'none';
    feedback.style.zIndex = '100';
    feedback.style.textShadow = '2px 2px 3px rgba(0,0,0,0.5)';
    
    element.appendChild(feedback);
    
    // 动画效果
    let opacity = 1;
    let top = 50;
    
    const fadeOut = setInterval(() => {
        opacity -= 0.05;
        top -= 2;
        feedback.style.opacity = opacity;
        feedback.style.top = `${top}%`;
        
        if (opacity <= 0) {
            clearInterval(fadeOut);
            feedback.remove();
        }
    }, 30);
}

// 结束游戏
function endGame() {
    clearInterval(interval);
    gameActive = false;
    gameOverSound.play();
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('game-over').style.display = 'block';
    
    document.getElementById('start-button').disabled = false;
    
    // 保存分数
    saveScore();
}

// 重置游戏
function resetGame() {
    score = 0;
    timeLeft = 60;
    gameActive = false;
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('start-button').disabled = false;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-section').style.display = 'block';
    clearInterval(interval);
    createGrid();
}

// 获取排行榜
function fetchHighScores() {
    fetch('http://localhost:5000/highscores')
        .then(response => response.json())
        .then(data => {
            highScores = data.highscores;
        })
        .catch(error => {
            console.error('Error fetching highscores:', error);
        });
}

// 显示排行榜
function showHighscores() {
    let highscoreText = '--- 排行榜 ---\n';
    
    if (highScores.length === 0) {
        highscoreText += '暂无记录';
    } else {
        highScores.forEach((entry, index) => {
            highscoreText += `${index + 1}. ${entry.username}: ${entry.score}分\n`;
        });
    }
    
    alert(highscoreText);
}

// 保存分数
function saveScore() {
    if (!currentUser) return;
    
    fetch('http://localhost:5000/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, score })
    })
    .then(() => {
        fetchHighScores(); // 更新排行榜
    })
    .catch(error => {
        console.error('Error saving score:', error);
    });
}

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', init);