const menuToggle = document.querySelector('.menu-toggle');
const mainMenu = document.querySelector('.main-menu');
const profileSelect = document.getElementById('profileSelect');
const activeProfileKey = 'muchaleActiveProfile';
const activeProfile = localStorage.getItem(activeProfileKey) || 'explorer';
const legacyProgressKey = 'muchaleLearningProgress';
const explorerProgressKey = 'muchaleLearningProgress:explorer';

if (activeProfile === 'explorer' && !localStorage.getItem(explorerProgressKey) && localStorage.getItem(legacyProgressKey)) {
  localStorage.setItem(explorerProgressKey, localStorage.getItem(legacyProgressKey));
}

window.muchaleProfileId = activeProfile;

if (profileSelect) {
  profileSelect.value = activeProfile;
  profileSelect.addEventListener('change', () => {
    localStorage.setItem(activeProfileKey, profileSelect.value);
    window.location.reload();
  });
}

if (menuToggle && mainMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.menu-link').forEach((link) => {
  const linkPage = link.getAttribute('href').split('?')[0];
  const isPracticePage = currentPage === 'practice.html' || (currentPage === 'index.html' && window.location.search.length > 0);
  const isHomePage = currentPage === 'index.html' && !isPracticePage;
  link.classList.toggle('active', (isHomePage && linkPage === 'index.html') || (isPracticePage && link.classList.contains('menu-parent')) || (!isHomePage && !isPracticePage && linkPage === currentPage));
});
