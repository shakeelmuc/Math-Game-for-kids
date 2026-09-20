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
const starMeter = document.getElementById('starMeter');
const successPopup = document.getElementById('successPopup');
const ageButtons = document.querySelectorAll('.age-btn');
const ageNote = document.getElementById('ageNote');
const questionCount = document.getElementById('questionCount');
const questionHint = document.getElementById('questionHint');
const skillButtons = document.querySelectorAll('.skill-card');
const practiceButtons = document.querySelectorAll('.challenge-btn, .skill-card');
const overallProgress = document.getElementById('overallProgress');
const overallProgressBar = document.getElementById('overallProgressBar');

let currentQuestions = [];
let currentIndex = 0;
let score = 0;
const queryParams = new URLSearchParams(window.location.search);
const requestedSkill = queryParams.get('skill');
const requestedAge = Number(queryParams.get('age'));
const classLevels = { class1: 7, class2: 8, class3: 9, class4: 10, class5: 11, class6: 12, class7: 13 };
const requestedLevel = classLevels[queryParams.get('level')];
const supportedSkills = ['addition', 'subtraction', 'numbers', 'multiplication', 'division', 'mix'];
let currentType = supportedSkills.includes(requestedSkill) ? requestedSkill : 'addition';
let currentAge = requestedLevel || ([3, 4, 5, 6].includes(requestedAge) ? requestedAge : 3);
let mistakes = [];
let audioContext = null;

const ageProfiles = {
  3: { max: 5, questions: 8, note: 'Tiny steps, big smiles', hint: 'Use your fingers or count the dots.', operations: ['numbers', 'addition', 'subtraction', 'mix'] },
  4: { max: 10, questions: 10, note: 'Make numbers bloom', hint: 'Count carefully. You are doing great!', operations: ['numbers', 'addition', 'subtraction', 'mix'] },
  5: { max: 15, questions: 10, note: 'Ready to explore', hint: 'Think it through, then pick your answer.', operations: ['numbers', 'addition', 'subtraction', 'multiplication', 'division', 'mix'] },
  6: { max: 20, questions: 12, note: 'Maths champion mode', hint: 'You can solve this one step at a time.', operations: ['numbers', 'addition', 'subtraction', 'multiplication', 'division', 'mix'] },
  7: { max: 50, factorMax: 5, questions: 12, note: 'Class 1 number builder', hint: 'Use a drawing or number line if it helps.', operations: ['numbers', 'addition', 'subtraction', 'multiplication', 'division', 'mix'] },
  8: { max: 100, factorMax: 10, questions: 14, note: 'Class 2 problem solver', hint: 'Break the problem into friendly steps.', operations: ['numbers', 'addition', 'subtraction', 'multiplication', 'division', 'mix'] },
  9: { max: 200, factorMax: 12, questions: 14, note: 'Class 3 maths explorer', hint: 'Look for a pattern before you calculate.', operations: ['numbers', 'addition', 'subtraction', 'multiplication', 'division', 'mix'] },
  10: { max: 500, factorMax: 15, questions: 15, note: 'Class 4 strategy maker', hint: 'Choose the operation that fits the story.', operations: ['numbers', 'addition', 'subtraction', 'multiplication', 'division', 'mix'] },
  11: { max: 1000, factorMax: 20, questions: 15, note: 'Class 5 confident thinker', hint: 'Estimate first, then solve carefully.', operations: ['numbers', 'addition', 'subtraction', 'multiplication', 'division', 'mix'] },
  12: { max: 5000, factorMax: 25, questions: 16, note: 'Class 6 reasoning star', hint: 'Explain your strategy as you work.', operations: ['numbers', 'addition', 'subtraction', 'multiplication', 'division', 'mix'] },
  13: { max: 10000, factorMax: 30, questions: 16, note: 'Class 7 maths leader', hint: 'Try more than one way and compare your methods.', operations: ['numbers', 'addition', 'subtraction', 'multiplication', 'division', 'mix'] }
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateStarMeter() {
  if (!starMeter) return;

  const totalStars = 5;
  const filled = Math.min(totalStars, Math.max(0, score));
  const full = '⭐'.repeat(filled);
  const empty = '☆'.repeat(totalStars - filled);
  starMeter.textContent = `${full}${empty}`;
  starMeter.classList.toggle('full', filled >= totalStars);
}

function showSuccessPopup() {
  if (!successPopup) return;

  const mood = score >= 5 ? 'Super Star! ⭐' : score >= 3 ? 'Amazing job! ✨' : 'Great job! ⭐';
  successPopup.textContent = mood;
  successPopup.classList.remove('show');
  void successPopup.offsetWidth;
  successPopup.classList.add('show');
  setTimeout(() => successPopup.classList.remove('show'), 850);
}

function playCheerSound() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;

  if (!audioContext) {
    audioContext = new AudioCtor();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(990, audioContext.currentTime + 0.12);
  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.38);
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

function createSuccessCelebration(x, y) {
  const emojis = ['⭐', '✨', '🎉', '🌟', '🥳'];

  for (let i = 0; i < 16; i++) {
    const piece = document.createElement('div');
    piece.className = 'celebration-piece';
    piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.setProperty('--x', `${(Math.random() - 0.5) * 220}px`);
    piece.style.setProperty('--y', `${-50 - Math.random() * 180}px`);
    piece.style.setProperty('--rot', `${(Math.random() - 0.5) * 180}deg`);
    piece.style.fontSize = `${18 + Math.random() * 20}px`;
    document.body.appendChild(piece);

    setTimeout(() => piece.remove(), 1200);
  }

  questionBox.classList.remove('celebrate');
  void questionBox.offsetWidth;
  questionBox.classList.add('celebrate');
  setTimeout(() => questionBox.classList.remove('celebrate'), 500);
}

function generateQuestion(type, age) {
  let num1, num2, answer, operator, explanation;
  const max = ageProfiles[age].max;

  if (type === 'numbers') {
    if (age >= 5 && randomInt(1, 2) === 2) {
      num1 = randomInt(1, max - 2);
      num2 = num1 + randomInt(1, 3);
      answer = num2;
      operator = 'greater';
      explanation = `${num2} is greater because it is farther along when we count.`;
      return { prompt: `Which is greater: ${num1} or ${num2}?`, answer, num1, num2, operator, explanation };
    }
    num1 = randomInt(1, max - 1);
    answer = num1 + 1;
    operator = 'next';
    explanation = `After ${num1} comes ${answer} when we count on.`;
    return { prompt: `What number comes after ${num1}?`, answer, num1, operator, explanation };
  }

  if (type === 'multiplication') {
    const factorMax = ageProfiles[age].factorMax || (age === 5 ? 3 : 5);
    const groups = randomInt(2, factorMax);
    const each = randomInt(2, factorMax);
    answer = groups * each;
    operator = '×';
    explanation = `${groups} groups of ${each} make ${answer} altogether.`;
    return { prompt: `${groups} × ${each} = ?`, answer, num1: groups, num2: each, operator, explanation };
  }

  if (type === 'division') {
    const factorMax = ageProfiles[age].factorMax || (age === 5 ? 3 : 5);
    const groups = randomInt(2, factorMax);
    const each = randomInt(2, factorMax);
    num1 = groups * each;
    answer = each;
    operator = '÷';
    explanation = `${num1} shared into ${groups} equal groups gives ${each} in each group.`;
    return { prompt: `${num1} ÷ ${groups} = ?`, answer, num1, num2: groups, operator, explanation };
  }

  if (type === 'addition') {
    num1 = randomInt(1, max - 1);
    num2 = randomInt(1, max - num1);
    answer = num1 + num2;
    operator = '+';
    explanation = `${num1} plus ${num2} makes ${answer}.`;
  } else if (type === 'subtraction') {
    num1 = randomInt(2, max);
    num2 = randomInt(1, num1);
    answer = num1 - num2;
    operator = '-';
    explanation = `Start with ${num1} and take away ${num2}; ${answer} are left.`;
  } else {
    const choices = ageProfiles[age].operations.filter((operation) => operation !== 'mix');
    return generateQuestion(choices[randomInt(0, choices.length - 1)], age);
  }

  return { prompt: `${num1} ${operator} ${num2} = ?`, answer, num1, num2, operator, explanation };
}

function generateChallenge(type, age) {
  const questions = [];
  for (let i = 0; i < ageProfiles[age].questions; i++) {
    questions.push(generateQuestion(type, age));
  }
  return questions;
}

function showQuestion() {
  const question = currentQuestions[currentIndex];
  questionText.textContent = question.prompt;
  progressText.textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
  questionHint.textContent = ageProfiles[currentAge].hint;
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

    if (mistake.operator === '+' || mistake.operator === '-') {
      addChocolates(row, mistake.num1);
      const symbol = document.createElement('span');
      symbol.className = 'math-symbol';
      symbol.textContent = mistake.operator;
      row.appendChild(symbol);
      if (mistake.operator === '+') addChocolates(row, mistake.num2);
      else addChocolates(row, mistake.num2, mistake.num2);
      const equals = document.createElement('span');
      equals.className = 'math-symbol';
      equals.textContent = ` = ${mistake.answer}`;
      row.appendChild(equals);
    } else {
      row.className = 'operation-lesson';
      row.textContent = mistake.explanation;
    }

    const lesson = document.createElement('p');
    lesson.textContent = mistake.prompt.replace('?', mistake.answer);
    card.append(row, lesson);
    learningExamples.appendChild(card);
  });
}

function showMistakeAnimation(mistake) {
  mistakeAnimation.replaceChildren();

  const visual = document.createElement('div');
  visual.className = 'mistake-visual';

  if (mistake.operator === '+' || mistake.operator === '-') {
    addChocolates(visual, mistake.num1);
    const symbol = document.createElement('span');
    symbol.className = 'math-symbol';
    symbol.textContent = mistake.operator;
    visual.appendChild(symbol);
    if (mistake.operator === '+') addChocolates(visual, mistake.num2);
    else addChocolates(visual, mistake.num2, mistake.num2);
  } else {
    visual.classList.add('operation-lesson');
    visual.textContent = mistake.explanation;
  }

  if (!visual.classList.contains('operation-lesson')) {
    const answer = document.createElement('span');
    answer.className = 'math-symbol';
    answer.textContent = ` = ${mistake.answer}`;
    visual.appendChild(answer);
  }
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
      return mistake.explanation;
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
    updateProgress();
    saveAnswerProgress(true);
    feedbackText.textContent = 'Yay! Correct! You did it!';
    feedbackText.className = 'feedback good';

    updateStarMeter();
    showSuccessPopup();
    playCheerSound();

    questionBox.classList.remove('success-glow');
    void questionBox.offsetWidth;
    questionBox.classList.add('success-glow');
    setTimeout(() => questionBox.classList.remove('success-glow'), 700);

    const rect = answerInput.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 10;
    createBurst(x, y);
    createSuccessCelebration(x, y);
  } else {
    saveAnswerProgress(false);
    feedbackText.textContent = `Let's learn: ${currentQuestion.explanation}`;
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

function updateAge(age) {
  currentAge = Number(age);
  const profile = ageProfiles[currentAge];
  ageButtons.forEach((button) => button.classList.toggle('selected', Number(button.dataset.age) === currentAge));
  practiceButtons.forEach((button) => {
    const minAge = Number(button.dataset.minAge || 0);
    const locked = minAge > currentAge;
    button.disabled = locked;
    button.classList.toggle('locked', locked);
  });
  if (!profile.operations.includes(currentType)) currentType = 'addition';
  if (ageNote) ageNote.textContent = profile.note;
  if (questionCount) questionCount.textContent = `${profile.questions} questions`;
  startChallenge(currentType);
}

function startChallenge(type) {
  currentType = type;
  currentQuestions = generateChallenge(type, currentAge);
  currentIndex = 0;
  score = 0;
  mistakes = [];
  updateProgress();
  updateStarMeter();
  summaryBox.classList.remove('visible');
  questionBox.classList.add('visible');
  showQuestion();
}

function updateProgress() {
  const percent = Math.round((score / Math.max(1, currentQuestions.length)) * 100);
  overallProgress.textContent = `${percent}%`;
  overallProgressBar.style.width = `${percent}%`;
}

function saveAnswerProgress(wasCorrect) {
  const storageKey = `muchaleLearningProgress:${window.muchaleProfileId || 'explorer'}`;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let saved = { streak: 0, questions: 0, correct: 0, stars: 0, lastDate: '', skills: {} };

  try {
    saved = { ...saved, ...(JSON.parse(localStorage.getItem(storageKey)) || {}) };
  } catch (error) {
    localStorage.removeItem(storageKey);
  }

  if (saved.lastDate !== today) saved.streak = saved.lastDate === yesterday ? saved.streak + 1 : 1;
  saved.lastDate = today;
  saved.questions += 1;
  saved.correct += wasCorrect ? 1 : 0;
  saved.stars += wasCorrect ? 1 : 0;
  saved.skills[currentType] = (saved.skills[currentType] || 0) + (wasCorrect ? 1 : 0);
  localStorage.setItem(storageKey, JSON.stringify(saved));
}

challengeButtons.forEach((button) => {
  button.addEventListener('click', () => startChallenge(button.dataset.type));
});

skillButtons.forEach((button) => {
  button.addEventListener('click', () => startChallenge(button.dataset.type));
});

ageButtons.forEach((button) => {
  button.addEventListener('click', () => updateAge(button.dataset.age));
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
updateAge(currentAge);
updateProgress();
