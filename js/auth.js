// Barreira de acesso por password partilhada (equipa pequena e de confiança) —
// só usado no build hospedado (app/build-hosted.js). O build portátil nunca
// carrega este ficheiro, por isso window.Auth simplesmente não existe aí.
//
// Não é autenticação real: a password é só um filtro contra acessos casuais
// via o link. A ligação à Supabase usa sempre a mesma anon key pública, com
// políticas RLS abertas — quem tiver a password (ou souber a anon key) lê e
// escreve na mesma tabela partilhada por todas as gestoras.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://ismjsqvbnbamxefdpunc.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_M1n5cKnz0SYUSitGIMvk9Q_e7XagBe8';
const TABLE = 'ficha_tecnica_sourcetextile_fichas';

// Hash SHA-256 da password de acesso (nunca a plaintext aqui). Não é
// segurança real — quem inspecionar o código consegue testar passwords
// offline contra este hash. Serve para não a mostrar à vista.
const PASSWORD_HASH = 'a29bd748cf4689cfee5e3c640889bc032689af7ca9b0b0b801a387b366b3f0a0';
const UNLOCK_KEY = 'sourcetextile-ficha-tecnica:unlocked';

const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY);

const loginScreen = document.getElementById('loginScreen');
const selectionScreen = document.getElementById('selectionScreen');
const authStatus = document.getElementById('authStatus');
const loginStepEmail = document.getElementById('loginStepEmail');
const loginEmailInput = document.getElementById('loginEmail');
const loginStatus = document.getElementById('loginStatus');
const loginSendButton = document.getElementById('loginSendButton');
const signOutButton = document.getElementById('signOutButton');

function setStatus(message) {
  loginStatus.textContent = message || '';
}

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function unlock() {
  try {
    localStorage.setItem(UNLOCK_KEY, '1');
  } catch (error) {
    console.warn('Não foi possível guardar o acesso neste computador:', error);
  }
  Storage.init(supabase, TABLE);
  authStatus.classList.remove('hidden');
  loginScreen.classList.add('hidden');
  selectionScreen.classList.remove('hidden');
}

function isUnlocked() {
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1';
  } catch (error) {
    return false;
  }
}

async function tryPassword() {
  const value = loginEmailInput.value;
  if (!value) {
    setStatus('Introduz a password de acesso.');
    return;
  }
  loginSendButton.disabled = true;
  setStatus('A verificar...');
  const hash = await sha256Hex(value);
  loginSendButton.disabled = false;
  if (hash !== PASSWORD_HASH) {
    setStatus('Password incorreta.');
    return;
  }
  setStatus('');
  loginEmailInput.value = '';
  unlock();
  // Ao contrário do arranque (App.init() → Auth.gate() → afterAuth()), este
  // desbloqueio interativo acontece depois de App.init() já ter terminado
  // (voltou cedo por não haver acesso ainda), por isso é preciso chamar
  // afterAuth() aqui.
  if (window.App) window.App.afterAuth();
}

loginSendButton.addEventListener('click', tryPassword);
loginEmailInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') tryPassword();
});
signOutButton.addEventListener('click', () => {
  try {
    localStorage.removeItem(UNLOCK_KEY);
  } catch (error) {
    console.warn('Não foi possível limpar o acesso:', error);
  }
  location.reload();
});

window.Auth = {
  // Chamado por App.init(): resolve true se já há acesso válido neste
  // computador (mostra logo o ecrã principal), false se for preciso mostrar
  // o ecrã de password.
  async gate() {
    if (isUnlocked()) {
      unlock();
      return true;
    }
    loginStepEmail.classList.remove('hidden');
    loginScreen.classList.remove('hidden');
    return false;
  }
};
