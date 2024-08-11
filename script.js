document.addEventListener('DOMContentLoaded', () => {
    const defaultCards = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const themes = {
        'default': [...defaultCards],
        'animals': [...defaultCards],
        'space': [...defaultCards],
        'emojis': [...defaultCards]
    };
    
    let gameBoard = document.getElementById('gameBoard');
    let moveCountElement = document.getElementById('moveCount');
    let timeLeftElement = document.getElementById('timeLeft');
    let restartButton = document.getElementById('restartButton');
    let hintButton = document.getElementById('hintButton');
    let startButton = document.getElementById('startButton');
    let leaderboardList = document.getElementById('leaderboardList');

    let firstCard = null;
    let secondCard = null;
    let moves = 0;
    let matchedCards = 0;
    let timer = null;
    let timeLeft = 60;
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    hintButton.addEventListener('click', showHint);

    function startGame() {
        let selectedTheme = document.getElementById('themeSelector').value;
        let gridSize = document.getElementById('gridSizeSelector').value.split('x').map(Number);
        let cardsArray = generateCards(themes[selectedTheme], gridSize);
        moves = 0;
        matchedCards = 0;
        moveCountElement.textContent = moves;
        timeLeft = 60;
        timeLeftElement.textContent = timeLeft;
        gameBoard.innerHTML = '';
        clearInterval(timer);
        timer = setInterval(updateTimer, 1000);
        createBoard(cardsArray, gridSize);
    }

    function generateCards(cardSet, gridSize) {
        let cards = [...cardSet.slice(0, (gridSize[0] * gridSize[1]) / 2)];
        cards = [...cards, ...cards]; // Duplicate cards for matching pairs
        return cards.sort(() => 0.5 - Math.random());
    }

    function createBoard(cardsArray, gridSize) {
        gameBoard.style.gridTemplateColumns = `repeat(${gridSize[0]}, 100px)`;
        gameBoard.style.gridTemplateRows = `repeat(${gridSize[1]}, 100px)`;
        cardsArray.forEach(char => {
            let card = document.createElement('div');
            card.classList.add('card');
            card.setAttribute('data-char', char);
            card.innerHTML = `<span>${char}</span>`;
            card.querySelector('span').style.visibility = 'hidden';
            gameBoard.appendChild(card);
        });

        gameBoard.addEventListener('click', handleCardClick);
    }

    function handleCardClick(e) {
        if (e.target.classList.contains('card') && !e.target.classList.contains('flipped')) {
            flipCard(e.target);
        }
    }

    function flipCard(card) {
        if (!firstCard) {
            firstCard = card;
            card.querySelector('span').style.visibility = 'visible';
            card.classList.add('flipped');
        } else if (!secondCard) {
            secondCard = card;
            card.querySelector('span').style.visibility = 'visible';
            card.classList.add('flipped');
            checkForMatch();
        }
    }

    function checkForMatch() {
        moves++;
        moveCountElement.textContent = moves;

        if (firstCard.getAttribute('data-char') === secondCard.getAttribute('data-char')) {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            matchedCards += 2;
            resetCards();

            if (matchedCards === gameBoard.children.length) {
                clearInterval(timer);
                setTimeout(() => alert('Congratulations! You matched all the cards in ' + moves + ' moves!'), 300);
                updateLeaderboard();
            }
        } else {
            setTimeout(() => {
                firstCard.querySelector('span').style.visibility = 'hidden';
                secondCard.querySelector('span').style.visibility = 'hidden';
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetCards();
            }, 1000);
        }
    }

    function resetCards() {
        firstCard = null;
        secondCard = null;
    }

    function restartGame() {
        clearInterval(timer);
        gameBoard.innerHTML = '';
        timeLeft = 60;
        timeLeftElement.textContent = timeLeft;
        matchedCards = 0;
        moves = 0;
        moveCountElement.textContent = moves;
    }

    function showHint() {
        const unmatchedCards = Array.from(document.querySelectorAll('.card:not(.matched):not(.flipped)'));
        if (unmatchedCards.length > 0) {
            const randomCard = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
            randomCard.querySelector('span').style.visibility = 'visible';
            randomCard.classList.add('flipped');

            setTimeout(() => {
                randomCard.querySelector('span').style.visibility = 'hidden';
                randomCard.classList.remove('flipped');
            }, 1000);
        } else {
            alert('No hints available. All cards are either matched or flipped!');
        }
    }

    function updateTimer() {
        timeLeft--;
        timeLeftElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Time is up! Game Over!');
            updateLeaderboard();
        }
    }

    function updateLeaderboard() {
        leaderboardList.innerHTML = '';
        leaderboard.forEach(score => {
            let li = document.createElement('li');
            li.textContent = `${score.name}: ${score.moves} moves`;
            leaderboardList.appendChild(li);
        });
    }

    function addToLeaderboard(name, moves) {
        leaderboard.push({ name, moves });
        leaderboard.sort((a, b) => a.moves - b.moves);
        if (leaderboard.length > 5) {
            leaderboard.pop();
        }
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        updateLeaderboard();
    }
});
