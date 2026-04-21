/* Utility & State */
const $ = (q, sc=document) => sc.querySelector(q);
const $$ = (q, sc=document) => [...sc.querySelectorAll(q)];

const bgm = $('#bgm');
const enterBtn = $('#enterBtn');
const intro = $('#intro');
const siteHeader = $('#siteHeader');
const app = $('#app');
const muteToggle = $('#muteToggle');

/* Fill contract text from config */
const CONTRACT = (window.SITE_CONFIG && window.SITE_CONFIG.CONTRACT) || 'REPLACE_WITH_REAL_CONTRACT';
$('#contractText').textContent = CONTRACT;

/* Intro -> start music + reveal site */
enterBtn.addEventListener('click', async () => {
  try { await bgm.play(); } catch(e) {}
  intro.classList.add('hidden');
  siteHeader.classList.remove('hidden');
  app.classList.remove('hidden');
  // Draw attention to BUY after entering
  const buyBtn = $('#buyBtnTop');
  if (buyBtn){
    setTimeout(() => {
      buyBtn.classList.add('attract');
      setTimeout(() => buyBtn.classList.remove('attract'), 3600);
    }, 800);
  }

});

/* Mute / Unmute */
let muted = false;
const updateMute = () => {
  bgm.muted = muted;
  muteToggle.textContent = muted ? '🔈' : '🔊';
  muteToggle.setAttribute('aria-label', muted ? 'Unmute Music' : 'Mute Music');
};
muteToggle.addEventListener('click', () => { muted = !muted; updateMute(); });
updateMute();

/* Copy contract */
$('#copyBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(CONTRACT);
    $('#copyBtn').textContent = 'Copied!';
    setTimeout(() => $('#copyBtn').textContent = 'Copy', 1200);
  // visual sparkle
  const cbtn = $('#copyBtn');
  cbtn.classList.remove('burst');
  // reflow to allow retrigger
  void cbtn.offsetWidth;
  cbtn.classList.add('burst');

  } catch(e){
    alert('Copy failed. Select the text and copy manually.');
  }
});

/* Jokes / interaction on slide 2 */
const jokes = [
  "Tokens like onions, they will definitely sprout and yield a profit.",
  "Not financial advice, but swamp advice.",
  "Gas fees? In my swamp? Never.",
  "I like my candles like my mud: green and thick.",
  "Somebody once told me... to HODL."
];
$('#jokeBtn').addEventListener('click', () => {
  const speech = $('#speech');
  const joke = jokes[Math.floor(Math.random()*jokes.length)];
  speech.textContent = 'Shrek: ' + joke;
  speech.classList.remove('hidden');
  // little head wobble
  const shrek1 = $('#shrek1');
  shrek1.animate([
    { transform: 'translateY(0) rotate(0deg)' },
    { transform: 'translateY(-4px) rotate(-3deg)' },
    { transform: 'translateY(0) rotate(0deg)' }
  ], { duration: 420, easing: 'ease-out' });
});

/* Onion toss game on slide 4 */
let score = 0;
const zone = $('#s4');
if (zone) zone.addEventListener('click', (e) => {
  // ignore clicks on card
  if (e.target.closest('.card')) return;
  const onion = document.createElement('div');
  onion.className = 'onion';
  onion.textContent = '🧅';
  zone.appendChild(onion);
  const rect = zone.getBoundingClientRect();
  const startX = e.clientX - rect.left;
  const startY = e.clientY - rect.top;
  onion.style.left = startX + 'px';
  onion.style.top  = startY + 'px';

  // random arc
  const dx = (Math.random()*400 - 200);
  const dy = -(120 + Math.random()*180);
  const duration = 900 + Math.random()*500;

  onion.animate([
    { transform:`translate(0,0)`, opacity:1 },
    { transform:`translate(${dx/2}px, ${dy}px)`, opacity:1 },
    { transform:`translate(${dx}px, 0) rotate(${(Math.random()*120-60)}deg)`, opacity:.1 }
  ], { duration, easing: 'cubic-bezier(.2,.8,.4,1)', fill:'forwards' });

  setTimeout(() => onion.remove(), duration+50);
  $('#onionScore').textContent = (++score);
});

/* Gentle parallax for shrek on hero */
const centerShrek = $('.shrek-center');
window.addEventListener('mousemove', (e) => {
  if (!centerShrek) return;
  const x = (e.clientX / window.innerWidth - .5) * 8;
  const y = (e.clientY / window.innerHeight - .5) * 4;
  centerShrek.style.transform = `translateX(-50%) translate(${x}px, ${y}px)`;
});


// ===== Footer: Contract copy helper =====
document.addEventListener('DOMContentLoaded', () => {
  const caSpan = document.querySelector('#caValue');
  const copyBtn = document.querySelector('#copyCA');
  if (!caSpan || !copyBtn) return;

  // If SITE_CONFIG.CONTRACT is set, reflect it into the footer
  try {
    const cfgCA = (window.SITE_CONFIG && window.SITE_CONFIG.CONTRACT) ? String(window.SITE_CONFIG.CONTRACT) : null;
    if (cfgCA && cfgCA.trim()) {
      caSpan.textContent = cfgCA.trim();
    }
  } catch(e){ /* no-op */ }

  copyBtn.addEventListener('click', async () => {
    const value = caSpan.textContent.trim();
    try {
      await navigator.clipboard.writeText(value);
      const prev = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = prev, 900);
    } catch(err){
      // Fallback: select-and-copy
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      const prev = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = prev, 900);
    }
  });
});

// Smooth scroll for footer nav links (About, How to Buy, Main) — only these
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('footer .links a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        try {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
          // Fallback for very old browsers
          const top = target.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    }, { passive: false });
  });
});

/* === Auto-press 'click on me' after 2s if user doesn't click === */
(function() {
  try {
    if (!enterBtn) return;
    let userPressed = false;
    const markPressed = () => { userPressed = true; };
    // mark when user manually enters (only once)
    enterBtn.addEventListener('click', markPressed, { once: true });
    // after 2 seconds, if the intro is still visible and user hasn't clicked, trigger the button
    setTimeout(() => {
      if (userPressed) return;
      // ensure button/intro still exist and intro is visible
      if (document.body.contains(enterBtn) && intro && getComputedStyle(intro).display !== 'none' && getComputedStyle(intro).visibility !== 'hidden' && intro.offsetParent !== null) {
        enterBtn.click();
      }
    }, 2000);
  } catch (e) {
    // fail silently to avoid breaking anything else
    console.warn('Auto-enter failed:', e);
  }
})();

// Auto-click "click on me" after 2s on page load (no extra checks)
setTimeout(() => { try { enterBtn && enterBtn.click(); } catch(_) {} }, 2000);


// <<<AUTO-ADDED: play music on any button click>>>
document.addEventListener('click', (e) => {
  const target = e.target;
  const btn = target && (target.closest && target.closest('button'));
  if (!btn) return;
  const audio = document.getElementById('bgm');
  if (!audio) return;
  try {
    // If muted via header toggle, unmute on any button click
    if (typeof muted !== 'undefined' && muted) {
      muted = false;
      if (typeof updateMute === 'function') updateMute();
      else audio.muted = false;
    } else if (audio.muted) {
      audio.muted = false;
    }
    // Avoid overlapping: only start if not already playing
    if (audio.paused) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  } catch (_err) {
    // ignore
  }
}, true);

document.addEventListener('click', (e) => {
  const target = e.target;
  const btn = target && (target.closest && target.closest('button'));
  if (!btn) return;
  const audio = document.getElementById('bgm');
  if (!audio) return;
  // Avoid overlapping: play only if not already playing
  try {
    if (audio.paused) {
      // Start from the beginning on first play after a click
      audio.currentTime = 0;
      audio.play().catch(() => { /* ignore play promise errors */ });
    }
  } catch (_err) {
    // Do nothing if browser blocks or other errors
  }
}, true);
