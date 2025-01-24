const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const enemiesContainer = document.getElementById('enemies');
const bossElement = document.getElementById('boss');
const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');
const bossAnnouncement = document.getElementById('boss-announcement');

let playerX = window.innerWidth / 2 - 25; // Initial player position
let bullets = [];
let enemies = [];
let enemySpeed = 2;
let enemyDirection = 1;
let currentLevel = 1;
let bossHealth = 5;
let bossActive = false;
let score = 0;
let maxLevels = 3; // Maximum levels set to 3

// Create player
player.style.left = `${playerX}px`;

// Move player
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && playerX > 0) {
    playerX -= 10;
  } else if (e.key === 'ArrowRight' && playerX < window.innerWidth - 50) {
    playerX += 10;
  } else if (e.key === ' ') {
    shoot();
  }
  player.style.left = `${playerX}px`;
});

// Shoot bullet
function shoot() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = `${playerX + 22.5}px`;
  bullet.style.bottom = '70px';
  gameContainer.appendChild(bullet);
  bullets.push(bullet);

  // Play bullet sound
  const bulletSound = new Audio('bullet.mp3'); // Path to the bullet sound file
  bulletSound.play();
}

// Move bullets
function moveBullets() {
  bullets.forEach((bullet, index) => {
    const bottom = parseInt(bullet.style.bottom);
    if (bottom > window.innerHeight) {
      // Remove bullet if it goes off-screen
      bullet.remove();
      bullets.splice(index, 1);
    } else {
      bullet.style.bottom = `${bottom + 10}px`;
    }
  });
}

// Check collisions
function checkCollisions() {
  bullets.forEach((bullet, bulletIndex) => {
    const bulletRect = bullet.getBoundingClientRect();

    // Check collisions with enemies
    enemies.forEach((enemy, enemyIndex) => {
      const enemyRect = enemy.getBoundingClientRect();
      if (
        bulletRect.left < enemyRect.right &&
        bulletRect.right > enemyRect.left &&
        bulletRect.top < enemyRect.bottom &&
        bulletRect.bottom > enemyRect.top
      ) {
        // Remove bullet and enemy on collision
        bullet.remove();
        enemy.remove();
        bullets.splice(bulletIndex, 1);
        enemies.splice(enemyIndex, 1);
        score += 10; // Increase score
        scoreDisplay.textContent = `Score: ${score}`;
      }
    });

    // Check collisions with boss
    if (bossActive) {
      const bossRect = bossElement.getBoundingClientRect();
      if (
        bulletRect.left < bossRect.right &&
        bulletRect.right > bossRect.left &&
        bulletRect.top < bossRect.bottom &&
        bulletRect.bottom > bossRect.top
      ) {
        // Remove bullet and reduce boss health
        bullet.remove();
        bullets.splice(bulletIndex, 1);
        bossHealth--;
        if (bossHealth <= 0) {
          bossElement.style.display = 'none';
          bossActive = false;
          score += 100; // Bonus score for defeating boss
          scoreDisplay.textContent = `Score: ${score}`;
          levelUp(); // Level up after defeating boss
        }
      }
    }
  });
}

// Create enemies (boxes with different patterns)
function createEnemies() {
  enemiesContainer.innerHTML = ''; // Clear existing enemies
  enemies = [];
  
  // Define the pattern for the number of shapes per row
  const rowsPattern = [15, 13, 11, 9, 7, 5];
  const shapes = ['square', 'circle', 'triangle']; // Different patterns

  let topPosition = 30; // Starting top position for the first row

  // Loop through each row pattern
  for (let i = 0; i < rowsPattern.length; i++) {
    const shapesInRow = rowsPattern[i]; // Get the number of shapes for this row
    const shapeType = i % 2 === 0 ? 'square' : (i % 3 === 0 ? 'circle' : 'triangle'); // Alternating shapes (square, circle, triangle)

    let leftPosition = (window.innerWidth - shapesInRow * 60) / 2; // Center the row

    // Loop through columns in the current row
    for (let j = 0; j < shapesInRow; j++) {
      const enemy = document.createElement('div');
      enemy.classList.add('enemy', shapeType); // Add shape class
      enemy.style.left = `${leftPosition + j * 60}px`; // Position each shape in the row
      enemy.style.top = `${topPosition}px`; // Position vertically
      enemiesContainer.appendChild(enemy);
      enemies.push(enemy);
    }

    // Move down for the next row
    topPosition += 60; 
  }
}

// Move enemies
function moveEnemies() {
  const leftmost = Math.min(...enemies.map(enemy => parseInt(enemy.style.left)));
  const rightmost = Math.max(...enemies.map(enemy => parseInt(enemy.style.left) + 40));

  if (leftmost <= 0 || rightmost >= window.innerWidth) {
    enemyDirection *= -1;
    enemies.forEach(enemy => {
      enemy.style.top = `${parseInt(enemy.style.top) + 20}px`;
    });
  }

  enemies.forEach(enemy => {
    enemy.style.left = `${parseInt(enemy.style.left) + enemySpeed * enemyDirection}px`;
  });
}

// Create boss
function createBoss() {
  bossElement.style.display = 'block';
  bossElement.style.left = `${window.innerWidth / 2 - 40}px`;
  bossElement.style.top = '50px';
  bossActive = true;
  bossHealth = 5; // Reset boss health
  announceBoss();
}

// Announce boss
function announceBoss() {
  bossAnnouncement.textContent = `BOSS FIGHT! Level ${currentLevel}`;
  bossAnnouncement.style.display = 'block';
  setTimeout(() => {
    bossAnnouncement.style.display = 'none';
  }, 3000); // Hide announcement after 3 seconds
}

// Move boss
function moveBoss() {
  if (bossActive) {
    const bossRect = bossElement.getBoundingClientRect();
    if (bossRect.left <= 0 || bossRect.right >= window.innerWidth) {
      enemyDirection *= -1;
    }
    bossElement.style.left = `${parseInt(bossElement.style.left) + enemySpeed * enemyDirection}px`;
  }
}

// Increase enemy speed after each level
function increaseSpeed() {
  if (currentLevel === 2) {
    enemySpeed = 3; // Slight increase for level 2
  } else if (currentLevel === 3) {
    enemySpeed = 3.5; // Slightly higher increase for level 3
  }
}

// Call this function when the level is updated
function levelUp() {
  currentLevel++;
  if (currentLevel <= maxLevels) {
    levelDisplay.textContent = `Level: ${currentLevel}`;
    increaseSpeed(); // Adjust speed for the new level
    createEnemies(); // Recreate enemies after level up
    if (currentLevel === 3) {
      createBoss(); // Add boss for the third level
    }
  } else {
    endGame(); // End game after level 3
  }
}

// Modify the logic in the part where you handle level completion
function checkLevelCompletion() {
  if (enemies.length === 0 && !bossActive) {
    levelUp(); // Move to the next level
  }
}

// End game with a winning message
function endGame() {
  levelDisplay.textContent = `You Win! Final Score: ${score}`;
  scoreDisplay.textContent = '';
  gameContainer.innerHTML = ''; // Clear game content
  const restartMessage = document.createElement('div');
  restartMessage.textContent = 'You Won! Refresh to play again';
  restartMessage.style.color = 'yellow';
  restartMessage.style.fontSize = '30px';
  restartMessage.style.position = 'absolute';
  restartMessage.style.top = '50%';
  restartMessage.style.left = '50%';
  restartMessage.style.transform = 'translate(-50%, -50%)';
  gameContainer.appendChild(restartMessage);
}

// Game loop
function gameLoop() {
  moveBullets();
  moveEnemies();
  moveBoss();
  checkCollisions();
  checkLevelCompletion();
  requestAnimationFrame(gameLoop);
}

// Initialize game
createEnemies();
gameLoop();
