/* ============================================================
   PLATFORM.JS — EduAI Pro Shared Utilities
   ============================================================ */

// ---- DARK / LIGHT MODE ----
(function initTheme() {
    const saved = localStorage.getItem('eduai_theme') || 'dark';
    applyTheme(saved);
})();

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eduai_theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);

    // Re-sync icon on load
    const saved = localStorage.getItem('eduai_theme') || 'dark';
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = saved === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
});


// ---- PARTICLE BACKGROUND (landing hero) ----
function initParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    const parent = canvas.parentElement;
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    parent.appendChild(c);
    const ctx = c.getContext('2d');
    let particles = [];
    const N = 60;

    function resize() {
        c.width = parent.offsetWidth;
        c.height = parent.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
        particles.push({
            x: Math.random() * c.width,
            y: Math.random() * c.height,
            r: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.4 + 0.1,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(108,99,255,${p.alpha})`;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = c.width;
            if (p.x > c.width) p.x = 0;
            if (p.y < 0) p.y = c.height;
            if (p.y > c.height) p.y = 0;
        });

        // Draw faint connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(108,99,255,${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
}

document.addEventListener('DOMContentLoaded', initParticles);


// ---- INTERSECTION OBSERVER ANIMATIONS ----
document.addEventListener('DOMContentLoaded', () => {
    const els = document.querySelectorAll('.feature-card, .step-card, .gamif-card, .big-stat-card, .achievement-card');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, i * 60);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    els.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        obs.observe(el);
    });
});


// ---- TOAST NOTIFICATIONS ----
function showToast(msg, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed; bottom: 24px; right: 24px; z-index: 9999;
            display: flex; flex-direction: column; gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warn: 'fa-exclamation-triangle' };
    const colors = { success: '#22c55e', error: '#ef4444', info: '#6c63ff', warn: '#f59e0b' };

    const toast = document.createElement('div');
    toast.style.cssText = `
        display: flex; align-items: center; gap: 10px;
        background: var(--card); border: 1px solid var(--border);
        border-left: 4px solid ${colors[type]};
        padding: 14px 18px; border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        font-size: 0.9rem; font-weight: 500; color: var(--text);
        min-width: 260px; max-width: 360px;
        animation: slideInRight 0.3s ease;
        font-family: var(--font-main);
    `;
    toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]}"></i><span>${msg}</span>`;

    const style = document.createElement('style');
    style.textContent = `@keyframes slideInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }`;
    document.head.appendChild(style);

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s, transform 0.4s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        setTimeout(() => toast.remove(), 400);
    }, duration);
}


// ---- CONFETTI (for perfect score, achievements) ----
function launchConfetti() {
    const colors = ['#6c63ff', '#a855f7', '#f7931e', '#22c55e', '#ef4444', '#ffd700'];
    for (let i = 0; i < 120; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.style.cssText = `
                position: fixed; z-index: 99999; pointer-events: none;
                width: ${Math.random() * 8 + 5}px; height: ${Math.random() * 8 + 5}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -20px; left: ${Math.random() * 100}vw;
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                opacity: 1;
            `;
            document.body.appendChild(el);
            const duration = Math.random() * 2000 + 1500;
            el.animate([
                { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
                { transform: `translateY(${window.innerHeight + 40}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 }
            ], { duration, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }).onfinish = () => el.remove();
        }, i * 20);
    }
}


// ---- QUIZ SESSION PERSISTENCE HELPERS ----
function saveQuizProgress(data) {
    sessionStorage.setItem('quizProgress', JSON.stringify(data));
}

function loadQuizProgress() {
    const d = sessionStorage.getItem('quizProgress');
    return d ? JSON.parse(d) : null;
}

function clearQuizProgress() {
    sessionStorage.removeItem('quizProgress');
}


// ---- ADAPTIVE DIFFICULTY LABELS ----
const DIFFICULTY_CONFIG = {
    1: { label: 'Beginner', color: '#22c55e', icon: 'fa-seedling' },
    2: { label: 'Intermediate', color: '#f7931e', icon: 'fa-fire' },
    3: { label: 'Advanced', color: '#ef4444', icon: 'fa-bolt' },
    4: { label: 'Expert', color: '#a855f7', icon: 'fa-crown' },
};

function getDifficultyConfig(level) {
    return DIFFICULTY_CONFIG[Math.max(1, Math.min(4, level))] || DIFFICULTY_CONFIG[1];
}


// ---- FORMAT HELPERS ----
function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatXP(xp) {
    if (xp >= 1000) return (xp / 1000).toFixed(1) + 'K';
    return xp.toString();
}

function getGrade(pct) {
    if (pct >= 95) return { label: 'A+', color: '#22c55e' };
    if (pct >= 85) return { label: 'A', color: '#4ade80' };
    if (pct >= 75) return { label: 'B', color: '#86efac' };
    if (pct >= 65) return { label: 'C', color: '#f7931e' };
    if (pct >= 50) return { label: 'D', color: '#fb923c' };
    return { label: 'F', color: '#ef4444' };
}


// ---- ANTI-CHEATING: FOCUS MONITORING ----
let tabSwitchCount = 0;
let focusLostTime = 0;

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        focusLostTime = Date.now();
        tabSwitchCount++;
        if (tabSwitchCount >= 2) {
            // Log cheating attempt
            const attempts = JSON.parse(localStorage.getItem('cheat_attempts') || '[]');
            attempts.push({ time: new Date().toISOString(), count: tabSwitchCount });
            localStorage.setItem('cheat_attempts', JSON.stringify(attempts));
        }
    }
});

function getAntiCheatReport() {
    return {
        tabSwitches: tabSwitchCount,
        totalFocusLost: focusLostTime
    };
}


// ---- GAMIFICATION HELPERS ----
function calculateXP(correct, total, streak, hintsUsed, timeTaken) {
    let xp = correct * 10;                          // 10 XP per correct
    if (streak >= 5) xp += 25;                      // Streak bonus
    if (streak >= 10) xp += 50;
    if (hintsUsed === 0) xp += 15;                  // No hints bonus
    const rate = correct / total;
    if (rate === 1) xp += 50;                       // Perfect score bonus
    if (rate >= 0.8) xp += 20;                      // High score bonus
    return Math.round(xp);
}

function getNextBadges(user, quizResult) {
    const earned = [];
    if (!user.badges) user.badges = [];

    if (!user.badges.includes('first_quiz')) {
        earned.push({ id: 'first_quiz', label: 'First Steps', icon: 'fa-star' });
    }
    if (quizResult.maxStreak >= 5 && !user.badges.includes('streak_5')) {
        earned.push({ id: 'streak_5', label: 'On Fire!', icon: 'fa-fire' });
    }
    if (quizResult.score === quizResult.totalQuestions && !user.badges.includes('perfect')) {
        earned.push({ id: 'perfect', label: 'Perfectionist', icon: 'fa-crown' });
    }
    return earned;
}


// ---- EXPORT ----
window.EduAI = {
    showToast,
    launchConfetti,
    toggleTheme,
    formatTime,
    formatXP,
    getGrade,
    getDifficultyConfig,
    calculateXP,
    getNextBadges,
    getAntiCheatReport,
    saveQuizProgress,
    loadQuizProgress,
    clearQuizProgress,
};
