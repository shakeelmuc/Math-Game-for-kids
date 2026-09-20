const questionBox = document.getElementById('questionBox');
const summaryBox = document.getElementById('summaryBox');
const questionText = document.getElementById('questionText');
const progressText = document.getElementById('progressText');
const feedbackText = document.getElementById('feedbackText');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const mistakeAnimation = document.getElementById('mistakeAnimation');
const challengeButtons = document.querySelectorAll('.challenge-btn');
const scoreText = document.getElementById('scoreText');
const messageText = document.getElementById('messageText');
const learningTip = document.getElementById('learningTip');
const learningExamples = document.getElementById('learningExamples');
const stars = document.getElementById('stars');
const restartBtn = document.getElementById('restartBtn');
const background = document.querySelector('.background');

let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let currentType = 'addition';
let mistakes = [];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createBackgroundDecor() {
  const bubbleColors = ['#ffffff', '#ffd166', '#9ad0ff', '#b8f2c4'];

  for (let i = 0; i < 14; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.bottom = `${-10 - Math.random() * 20}%`;
    bubble.style.width = `${16 + Math.random() * 26}px`;
    bubble.style.height = bubble.style.width;
    bubble.style.background = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
    bubble.style.animationDelay = `${Math.random() * 5}s`;
    bubble.style.animationDuration = `${7 + Math.random() * 6}s`;
    background.appendChild(bubble);
  }

  for (let i = 0; i < 10; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 3}s`;
    background.appendChild(sparkle);
  }
}

function createBurst(x, y) {
  const colors = ['#ff9f43', '#6c63ff', '#2ecc71', '#ff5a5f', '#ffd166'];

  for (let i = 0; i < 18; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-burst';
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--x', `${(Math.random() - 0.5) * 180}px`);
    piece.style.setProperty('--y', `${(Math.random() - 0.5) * 180}px`);
    document.body.appendChild(piece);

    setTimeout(() => piece.remove(), 1100);
  }
}

function generateQuestion(type) {
  let num1, num2, answer, operator;

  if (type === 'addition') {
    num1 = randomInt(1, 9);
    num2 = randomInt(1, 9);
    answer = num1 + num2;
    operator = '+';
  } else if (type === 'subtraction') {
    num1 = randomInt(2, 12);
    num2 = randomInt(1, num1);
    answer = num1 - num2;
    operator = '-';
  } else {
    const mixed = randomInt(1, 2);
    if (mixed === 1) {
      num1 = randomInt(1, 9);
      num2 = randomInt(1, 9);
      answer = num1 + num2;
      operator = '+';
    } else {
      num1 = randomInt(2, 12);
      num2 = randomInt(1, num1);
      answer = num1 - num2;
      operator = '-';
    }
  }

  return { prompt: `${num1} ${operator} ${num2} = ?`, answer, num1, num2, operator };
}

function generateChallenge(type) {
  const questions = [];
  for (let i = 0; i < 10; i++) {
    questions.push(generateQuestion(type));
  }
  return questions;
}

function showQuestion() {
  const question = currentQuestions[currentIndex];
  questionText.textContent = question.prompt;
  progressText.textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
  answerInput.value = '';
  answerInput.focus();
  feedbackText.textContent = '';
  feedbackText.className = 'feedback';
  mistakeAnimation.replaceChildren();
  submitBtn.hidden = false;
  nextBtn.hidden = true;
  answerInput.disabled = false;
}

function addChocolates(row, count, removedCount = 0) {
  for (let index = 0; index < count; index += 1) {
    const chocolate = document.createElement('span');
    chocolate.className = 'chocolate';
    chocolate.textContent = '🍫';
    if (index >= count - removedCount) {
      chocolate.classList.add('removed');
    }
    row.appendChild(chocolate);
  }
}

function showLearningExamples() {
  learningExamples.replaceChildren();

  mistakes.slice(0, 3).forEach((mistake) => {
    const card = document.createElement('article');
    card.className = 'learning-card';

    const row = document.createElement('div');
    row.className = 'chocolate-row';

    if (mistake.operator === '+') {
      addChocolates(row, mistake.num1);
      const plus = document.createElement('span');
      plus.className = 'math-symbol';
      plus.textContent = '+';
      row.appendChild(plus);
      addChocolates(row, mistake.num2);
    } else {
      addChocolates(row, mistake.num1, mistake.num2);
      const equals = document.createElement('span');
      equals.className = 'math-symbol';
      equals.textContent = ` = ${mistake.answer}`;
      row.appendChild(equals);
    }

    const lesson = document.createElement('p');
    lesson.textContent = `${mistake.num1} ${mistake.operator} ${mistake.num2} = ${mistake.answer}`;
    card.append(row, lesson);
    learningExamples.appendChild(card);
  });
}

function showMistakeAnimation(mistake) {
  mistakeAnimation.replaceChildren();

  const visual = document.createElement('div');
  visual.className = 'mistake-visual';

  if (mistake.operator === '+') {
    addChocolates(visual, mistake.num1);
    const plus = document.createElement('span');
    plus.className = 'math-symbol';
    plus.textContent = '+';
    visual.appendChild(plus);
    addChocolates(visual, mistake.num2);
  } else {
    addChocolates(visual, mistake.num1, mistake.num2);
  }

  const answer = document.createElement('span');
  answer.className = 'math-symbol';
  answer.textContent = ` = ${mistake.answer}`;
  visual.appendChild(answer);
  mistakeAnimation.appendChild(visual);
}

function finishChallenge() {
  questionBox.classList.remove('visible');
  summaryBox.classList.add('visible');

  let message = 'Nice work!';
  let starString = '⭐';

  if (score === 10) {
    message = 'Amazing job! You got every one right!';
    starString = '⭐ ⭐ ⭐ ⭐ ⭐';
  } else if (score >= 7) {
    message = 'Wonderful work! You are getting better every time!';
    starString = '⭐ ⭐ ⭐ ⭐';
  } else if (score >= 4) {
    message = 'Great effort! Keep practicing!';
    starString = '⭐ ⭐ ⭐';
  } else if (score >= 1) {
    message = 'You are doing great! Try another challenge!';
    starString = '⭐ ⭐';
  } else {
    message = 'Keep trying! You can do it!';
    starString = '⭐';
  }

  stars.textContent = starString;
  scoreText.textContent = `You got ${score} out of ${currentQuestions.length} right.`;
  messageText.textContent = message;

  if (mistakes.length === 0) {
    learningTip.textContent = 'Perfect work! You counted every answer correctly.';
    learningExamples.replaceChildren();
  } else {
    const lessons = mistakes.slice(0, 3).map((mistake) => {
      if (mistake.operator === '+') {
        return `${mistake.num1} chocolates plus ${mistake.num2} chocolates makes ${mistake.answer}.`;
      }
      return `Start with ${mistake.num1} chocolates and take away ${mistake.num2}; ${mistake.answer} are left.`;
    });
    const extraLesson = mistakes.length > 3 ? ' Keep practicing the other questions too!' : '';
    learningTip.textContent = `Let's learn: ${lessons.join(' ')}${extraLesson}`;
    showLearningExamples();
  }

  createBurst(window.innerWidth / 2, window.innerHeight / 2 - 80);
}

function checkAnswer() {
  const userAnswer = Number(answerInput.value);
  const currentQuestion = currentQuestions[currentIndex];

  if (answerInput.value === '' || Number.isNaN(userAnswer)) {
    feedbackText.textContent = 'Please type a number first!';
    feedbackText.className = 'feedback bad';
    answerInput.focus();
    return;
  }

  if (userAnswer === currentQuestion.answer) {
    score += 1;
    feedbackText.textContent = 'Yay! Correct!';
    feedbackText.className = 'feedback good';
    createBurst(answerInput.getBoundingClientRect().left + 80, answerInput.getBoundingClientRect().top - 20);
  } else {
    if (currentQuestion.operator === '+') {
      feedbackText.textContent = `Let's learn: ${currentQuestion.num1} chocolates plus ${currentQuestion.num2} chocolates makes ${currentQuestion.answer}.`;
    } else {
      feedbackText.textContent = `Let's learn: take ${currentQuestion.num2} away from ${currentQuestion.num1}; ${currentQuestion.answer} are left.`;
    }
    feedbackText.className = 'feedback bad';
    mistakes.push(currentQuestion);
    showMistakeAnimation(currentQuestion);
  }

  answerInput.disabled = true;
  submitBtn.hidden = true;
  nextBtn.hidden = false;
  nextBtn.focus();
}

function goToNextQuestion() {
  currentIndex += 1;
  if (currentIndex < currentQuestions.length) {
    showQuestion();
  } else {
    finishChallenge();
  }
}

function startChallenge(type) {
  currentType = type;
  currentQuestions = generateChallenge(type);
  currentIndex = 0;
  score = 0;
  mistakes = [];
  summaryBox.classList.remove('visible');
  questionBox.classList.add('visible');
  showQuestion();
}

challengeButtons.forEach((button) => {
  button.addEventListener('click', () => startChallenge(button.dataset.type));
});

answerInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    checkAnswer();
  }
});

restartBtn.addEventListener('click', () => {
  startChallenge(currentType);
});

createBackgroundDecor();
startChallenge(currentType);
