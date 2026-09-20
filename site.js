const menuToggle = document.querySelector('.menu-toggle');
const mainMenu = document.querySelector('.main-menu');

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
