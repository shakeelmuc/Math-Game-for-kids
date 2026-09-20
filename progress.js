const progressStorageKey = 'muchaleLearningProgress';

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(progressStorageKey)) || {};
  } catch (error) {
    return {};
  }
}

const progress = readProgress();
const questions = progress.questions || 0;
const correct = progress.correct || 0;
const skills = progress.skills || {};

document.getElementById('metricStreak').textContent = progress.streak || 0;
document.getElementById('metricQuestions').textContent = questions;
document.getElementById('metricStars').textContent = progress.stars || 0;
document.getElementById('metricAccuracy').textContent = `${questions ? Math.round((correct / questions) * 100) : 0}%`;

const skillTargets = { numbers: 'skillNumbers', addition: 'skillAddition', multiplication: 'skillMultiplication' };
Object.entries(skillTargets).forEach(([skill, elementId]) => {
  const percent = Math.min(100, (skills[skill] || 0) * 10);
  document.getElementById(elementId).style.width = `${percent}%`;
});
