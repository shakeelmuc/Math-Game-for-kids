const menuToggle = document.querySelector('.menu-toggle');
const mainMenu = document.querySelector('.main-menu');
const profileSelect = document.getElementById('profileSelect');
const activeProfileKey = 'muchaleActiveProfile';
let session = null;
try {
  session = JSON.parse(localStorage.getItem('muchaleSession') || 'null');
} catch (error) {
  localStorage.removeItem('muchaleSession');
}
const isLoginPage = window.location.pathname.endsWith('login.html');

if (!session && !isLoginPage) window.location.replace('login.html');

const activeProfile = session?.userId || localStorage.getItem(activeProfileKey) || 'explorer';
const legacyProgressKey = 'muchaleLearningProgress';
const explorerProgressKey = 'muchaleLearningProgress:explorer';

if (activeProfile === 'explorer' && !localStorage.getItem(explorerProgressKey) && localStorage.getItem(legacyProgressKey)) {
  localStorage.setItem(explorerProgressKey, localStorage.getItem(legacyProgressKey));
}

window.muchaleProfileId = activeProfile;

if (profileSelect) {
  profileSelect.replaceChildren();
  const accountOption = document.createElement('option');
  accountOption.value = 'account';
  accountOption.textContent = session?.displayName || 'Account';
  profileSelect.appendChild(accountOption);
  const logoutOption = document.createElement('option');
  logoutOption.value = 'logout';
  logoutOption.textContent = 'Log out';
  profileSelect.appendChild(logoutOption);
  profileSelect.value = 'account';
  profileSelect.addEventListener('change', () => {
    if (profileSelect.value === 'logout') {
      localStorage.removeItem('muchaleSession');
      window.location.replace('login.html');
    }
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
