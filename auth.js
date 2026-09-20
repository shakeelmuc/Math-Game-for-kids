const usersKey = 'muchaleUsers';
const sessionKey = 'muchaleSession';
const signInTab = document.getElementById('signInTab');
const createTab = document.getElementById('createTab');
const signInForm = document.getElementById('signInForm');
const createForm = document.getElementById('createForm');
const authMessage = document.getElementById('authMessage');

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(usersKey)) || [];
  } catch (error) {
    return [];
  }
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function showMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.className = `auth-message${isError ? ' error' : ''}`;
}

function setMode(mode) {
  const signInMode = mode === 'signin';
  signInTab.classList.toggle('active', signInMode);
  createTab.classList.toggle('active', !signInMode);
  signInTab.setAttribute('aria-selected', String(signInMode));
  createTab.setAttribute('aria-selected', String(!signInMode));
  signInForm.hidden = !signInMode;
  createForm.hidden = signInMode;
  showMessage('');
}

signInTab.addEventListener('click', () => setMode('signin'));
createTab.addEventListener('click', () => setMode('create'));

signInForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(signInForm);
  const identifier = form.get('identifier').trim().toLowerCase();
  const passwordHash = await hashPassword(form.get('password'));
  const user = readUsers().find((candidate) => candidate.identifier === identifier && candidate.passwordHash === passwordHash);

  if (!user) {
    showMessage('We could not match those details. Try again or create an account.', true);
    return;
  }

  localStorage.setItem(sessionKey, JSON.stringify({ userId: user.id, displayName: user.displayName }));
  window.location.replace('index.html');
});

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(createForm);
  const displayName = form.get('displayName').trim();
  const identifier = form.get('identifier').trim().toLowerCase();
  const password = form.get('password');
  const users = readUsers();

  if (users.some((user) => user.identifier === identifier)) {
    showMessage('That email or username is already registered. Sign in instead.', true);
    return;
  }

  const newUser = {
    id: crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
    displayName,
    identifier,
    passwordHash: await hashPassword(password)
  };
  users.push(newUser);
  localStorage.setItem(usersKey, JSON.stringify(users));
  localStorage.setItem(sessionKey, JSON.stringify({ userId: newUser.id, displayName: newUser.displayName }));
  window.location.replace('index.html');
});
