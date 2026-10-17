const $ = s => document.querySelector(s);
const R = Math.random;
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ===== Edit me ===== */
const CFG = {
    name: 'Jeremy Ladista',
    status: 'Open to work · Remote',
    email: 'ladistajeremy11@gmail.com',
    formUrl: 'https://formspree.io/f/mljgzrrv',
    github: '#',
    linkedin: '#',
    resume: '#',
    roles: ['Front-end Developer', 'UI Animation Nerd', 'Bug Conductor'],
    bio: 'Front-end developer based in Montalban Rizal. I build fast, playful websites and apps, and I like turning rough ideas into things people enjoy using.',
    about2: 'Ready to build, learn, and make an impact. Armed with fresh perspectives, technical skills, and a portfolio of real projects. Currently open to freelance collaborations and entry-level full-time roles.',
    skills: [['PHP & Backend Logic', 75], ['JavaScript / Web Dev', 78], ['HTML & CSS', 80], ['MySQL & Databases', 70], ['UI/UX Design', 70]],
    projects: [
        {
            t: 'Mecha Haven',
           tag: 'E-commerce platform for mecha model kits',
            cat: 'Web app',
            year: '2024',
            role: 'Full-stack developer',
            art: '#ffb703,#000000',
            d: 'A full-stack e-commerce store with user authentication, custom product cataloging, and interactive searching for Gundam enthusiasts.',
            problem: 'Hobbyists needed a centralized, dark-themed platform designed specifically for showcasing and ordering scale-model kits.',
            approach: 'Built a responsive web application with a cyberpunk aesthetic, integrated search functionality, dynamic product banners, and user login/signup.',
            result: 'Delivered a fully functional local e-commerce store experience with seamless catalog navigation.',
            metrics: [['100%', 'custom built'], ['Local', 'XAMPP setup']],
            stack: ['PHP', 'MySQL', 'JavaScript', 'HTML/CSS']
        },
        {
            t: 'Select Right, Throw Right',
            tag: 'AI-powered waste classification and IoT bin control',
            cat: 'Web app · IoT',
            art: '#159b72,#17324d',
            d: 'A smart waste-sorting system that identifies waste through a camera and guides it to the right bin.',
            problem: 'Sorting waste correctly can be confusing, and shared bins often depend on people choosing the right compartment.',
            approach: 'Connected a PHP and MySQL dashboard to Gemini image recognition, live camera scanning, and an Arduino-controlled bin system through a Python serial bridge.',
            result: 'Brings camera-based classification, bin status monitoring, scan history, and physical bin control into one workflow.',
            metrics: [['AI', 'image recognition'], ['IoT', 'automated bins']],
            stack: ['PHP', 'MySQL', 'JavaScript', 'Python', 'Arduino', 'Gemini API']
        }
    ]
};

/* ===== Stations ===== */
const ST = {
    home: { n: 'Home Terminal', s: 'Home', f: 0, t: '--:--', pf: '-' },
    about: { n: 'Origin Station', s: 'About', f: 0.17, t: '09:15', pf: '1' },
    lib: { n: 'Gallery Junction', s: 'Projects', f: 0.4, t: '09:42', pf: '2' },
    potion: { n: 'Workshop Depot', s: 'Skills', f: 0.6, t: '10:08', pf: '3' },
    arcade: { n: 'Arcade Central', s: 'Games', f: 0.8, t: '10:30', pf: '4' },
    contact: { n: 'Post Office Terminus', s: 'Contact', f: 1, t: '11:05', pf: '5' }
};

const ORDER = ['home', 'about', 'lib', 'potion', 'arcade', 'contact'];

/* ===== Audio ===== */
const SOUND_VOLUME = 0.55;
const MUSIC_VOLUME = 4.00;
let ac, master, musicGain, lp, musicOn = true, timer, step = 0, nb;

function initAudio() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = SOUND_VOLUME;
    master.connect(ac.destination);
    musicGain = ac.createGain();
    musicGain.gain.value = MUSIC_VOLUME;
    musicGain.connect(master);
    lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2200;
    lp.connect(musicGain);
    nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
        d[i] = R() * 2 - 1;
    }
}

function tone(f, t, d, type, v, a, dest) {
    const o = ac.createOscillator(), g = ac.createGain();
    a = a || 0.008;
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(dest || master);
    o.start(t);
    o.stop(t + d + 0.05);
}

function sw(f1, f2, t, d, type, v, dest) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(dest || master);
    o.start(t);
    o.stop(t + d + 0.05);
}

function nz(t, d, v, hp) {
    const s = ac.createBufferSource();
    const g = ac.createGain();
    const h = ac.createBiquadFilter();
    s.buffer = nb;
    h.type = 'highpass';
    h.frequency.value = hp;
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(h);
    h.connect(g);
    g.connect(master);
    s.start(t);
    s.stop(t + d + 0.02);
}

const bell = (f, t, v) => {
    tone(f, t, 1.2, 'sine', v);
    tone(f * 2.4, t, 0.5, 'sine', v * 0.3);
};

function sfx(k) {
    if (!ac || !musicOn) {
        return;
    }
    const t = ac.currentTime;
    if (k === 'hover') {
        nz(t, 0.025, 0.05, 3500);
    }
    if (k === 'click') {
        sw(190, 60, t, 0.14, 'sine', 0.28);
        nz(t, 0.06, 0.1, 900);
    }
    if (k === 'horn' || k === 'travel' || k === 'depart' || k === 'brakes') {
        trainSfx(k);
        return;
    } // train sounds live in the 'Train audio' section
    if (k === 'chime') {
        bell(659, t, 0.12);
        bell(523, t + 0.5, 0.12);
    }
    if (k === 'coin') {
        bell(988, t, 0.1);
        bell(1319, t + 0.06, 0.08);
    }
    if (k === 'hit') {
        sw(200, 45, t, 0.35, 'sawtooth', 0.16);
    }
    if (k === 'flip') {
        nz(t, 0.05, 0.1, 1800);
    }
    if (k === 'win') {
        [523, 659, 784, 1047].forEach((f, i) => bell(f, t + i * 0.12, 0.1));
    }
}

const CH = [[174.6, 220, 261.6, 329.6], [164.8, 196, 246.9, 293.7], [146.8, 174.6, 220, 261.6], [130.8, 164.8, 196, 246.9]];
const PEN = [523, 587, 659, 784, 880, 1047];
const AR = [0, 2, 1, 3, 2, 1, 3, 2];

function tick() {
    if (!ac || !musicOn) {
        return;
    }
    const t = ac.currentTime + 0.04, i = step % 8, c = CH[(step / 8 | 0) % 4];
    const f = c[AR[i]];
    tone(f, t, 1.6, 'sine', 0.075, 0.01, lp);
    tone(f * 2, t, 0.6, 'sine', 0.02, 0.01, lp);
    tone(f * 1.004, t, 1.6, 'triangle', 0.035, 0.01, lp);
    if (i % 4 === 0) {
        tone(c[0] / 2, t, 1.2, 'triangle', 0.11, 0.01, lp);
        sw(120, 40, t, 0.18, 'sine', 0.13, musicGain);
    }
    if (R() < 0.25) {
        tone(PEN[R() * 6 | 0], t, 0.9, 'triangle', 0.05, 0.005, lp);
    }
    step++;
}

$('#go').onclick = () => {
    if (!ac) {
        initAudio();
        timer = setInterval(tick, 375);
        tick();
    }
    else if (ac.state === 'suspended') {
        ac.resume();
    }
    sfx('depart');
    const swap = () => {
        $('#start').style.display = 'none';
        document.body.classList.remove('title');
    };
    RM ? swap() : trainWipe(swap);
};

$('#mute').onclick = e => {
    musicOn = !musicOn;
    e.target.textContent = 'Sound: ' + (musicOn ? 'on' : 'off');
    e.target.setAttribute('aria-pressed', !musicOn);
    if (ac) {
        master.gain.value = musicOn ? SOUND_VOLUME : 0;
    }
    if (musicOn) {
        sfx('click');
    }
};

document.addEventListener('mouseover', e => {
    if (e.target.closest('.btn,.st,.row,.nav button,.mc')) {
        sfx('hover');
    }
});

document.addEventListener('click', e => {
    const b = e.target.closest('.btn,.st,.row,.nav button');
    if (b && b.id !== 'go' && b.id !== 'mute') {
        sfx('click');
    }
});

/* ===== Landscape background ===== */
(function () {
    const cv = $('#bg'), X = cv.getContext('2d');
    let W, H, last = 0, scroll = 0, from = 'home', to = 'home', bt = 1, tx = 0, px = 0;
    const SC = {
        home: {
            sky: ['#ffd9a8', '#ff9a8b', '#7a5bd6'],
            sun: [0.72, 0.6, 0.1, '#fff4c4'],
            rg: [['#b46fc9', 0.7, 0.1, 1, 0.05], ['#8a54b8', 0.77, 0.09, 2, 0.1], ['#5a3f9c', 0.85, 0.07, 3, 0.18]],
            pr: 'city',
            st: 0
        },
        about: {
            sky: ['#bfeaff', '#ffe9c7', '#ffd0a1'],
            sun: [0.25, 0.3, 0.07, '#fffbe0'],
            rg: [['#9fe0b0', 0.72, 0.08, 4, 0.05], ['#6cc88c', 0.79, 0.09, 5, 0.1], ['#3fa66d', 0.87, 0.07, 6, 0.18]],
            pr: 'trees',
            st: 0
        },
        lib: {
            sky: ['#ff9966', '#ff5e62', '#7b2d8f'],
            sun: [0.5, 0.56, 0.13, '#ffd27a'],
            rg: [['#a43c7a', 0.66, 0.16, 7, 0.04], ['#7a2a74', 0.76, 0.12, 8, 0.1], ['#4a1d5e', 0.86, 0.08, 9, 0.18]],
            pr: 'pines',
            st: 0.1
        },
        potion: {
            sky: ['#3a1c71', '#c0508f', '#ffaf7b'],
            sun: [0.78, 0.3, 0.05, '#fff0d0'],
            rg: [['#6b2d7a', 0.72, 0.07, 10, 0.05], ['#4a1f63', 0.8, 0.06, 11, 0.1], ['#2a1245', 0.88, 0.05, 12, 0.18]],
            pr: 'factory',
            st: 0.6
        },
        arcade: {
            sky: ['#0b0a2e', '#2a1a6e', '#ff4fa0'],
            sun: [0.2, 0.22, 0.05, '#fff7d6'],
            rg: [['#2a1660', 0.74, 0.05, 13, 0.05], ['#1a0f48', 0.82, 0.05, 14, 0.1], ['#0c0830', 0.9, 0.04, 15, 0.18]],
            pr: 'neon',
            st: 1
        },
        contact: {
            sky: ['#061a3a', '#0e5c8a', '#29d6c4'],
            sun: [0.7, 0.3, 0.07, '#e6fbff'],
            rg: [['#0d4f7a', 0.8, 0.04, 16, 0.05], ['#0a3a62', 0.86, 0.03, 17, 0.1], ['#062444', 0.93, 0.03, 18, 0.18]],
            pr: 'sea',
            st: 1
        }
    };
    const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const mx = (a, b, t) => hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t));
    const cm = (a, b, t) => `rgb(${mx(a, b, t)})`;
    const lp = (a, b, t) => a + (b - a) * t;
    const hs = i => {
        const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
        return x - Math.floor(x);
    };
    const rs = () => {
        W = cv.width = innerWidth;
        H = cv.height = innerHeight;
    };
    rs();
    addEventListener('resize', rs);
    const stars = Array.from({ length: 120 }, () => ({ x: R(), y: R() * 0.55, r: R() * 1.4 + 0.3, p: R() * 6, s: 0.6 + R() * 2 }));
    const ry = (r, wx) => H * r[1] - H * r[2] * (Math.sin(wx / 180 + r[3]) * 0.5 + Math.sin(wx / 71 + r[3] * 2) * 0.3 + Math.sin(wx / 29 + r[3] * 3) * 0.2);
    const props = (k, sp, al, t, r) => {
        if (al < 0.02 || k === 'sea') {
            return;
        }
        X.save();
        X.globalAlpha = al;
        const u = H / 700;
        const step = 150;
        const sc = scroll * sp;
        const i0 = Math.floor(sc / step) - 1;
        const n = Math.ceil(W / step) + 3;
        for (let i = i0; i < i0 + n; i++) {
            const wx = i * step + hs(i) * 60, sx = wx - sc, y = ry(r, wx), a = hs(i + 7), b = hs(i + 13);
            if (k === 'city') {
                const w = (34 + a * 30) * u, h = (50 + b * 150) * u;
                X.fillStyle = '#2a1a5a';
                X.fillRect(sx, y - h, w, h + 4);
                X.fillStyle = 'rgba(255,226,140,.85)';
                for (let p = 0; p < h - 8; p += 14 * u) {
                    for (let q = 6; q < w - 6; q += 10 * u) {
                        if (hs(i * 31 + p * 7 + q) > 0.55) {
                            X.fillRect(sx + q, y - h + p + 6, 4 * u, 6 * u);
                        }
                    }
                }
            }
            else if (k === 'trees') {
                X.fillStyle = '#2f6a46';
                X.fillRect(sx + 8 * u, y - 24 * u, 6 * u, 26 * u);
                X.fillStyle = ['#3fb06d', '#2f9a5c', '#58c27f'][a * 3 | 0];
                X.beginPath();
                X.arc(sx + 11 * u, y - 34 * u, (20 + b * 14) * u, 0, 6.283);
                X.fill();
            }
            else if (k === 'pines') {
                X.fillStyle = '#3a1250';
                for (let p = 0; p < 3; p++) {
                    X.beginPath();
                    X.moveTo(sx, y - (10 + p * 26) * u);
                    X.lineTo(sx + (34 - p * 7) * u, y - (10 + p * 26) * u);
                    X.lineTo(sx + (17) * u, y - (46 + p * 26 + b * 10) * u);
                    X.fill();
                }
            }
            else if (k === 'factory') {
                const w = (60 + a * 40) * u, h = (50 + b * 40) * u;
                X.fillStyle = '#2a1245';
                X.fillRect(sx, y - h, w, h + 4);
                for (let p = 0; p < w; p += 20 * u) {
                    X.beginPath();
                    X.moveTo(sx + p, y - h);
                    X.lineTo(sx + p, y - h - 14 * u);
                    X.lineTo(sx + p + 20 * u, y - h);
                    X.fill();
                }
                X.fillRect(sx + w * 0.7, y - h - 60 * u, 12 * u, 60 * u);
                for (let p = 0; p < 5; p++) {
                    const q = ((t * 0.25 + p / 5 + a) % 1);
                    X.fillStyle = `rgba(255,235,220,${0.28 * (1 - q)})`;
                    X.beginPath();
                    X.arc(sx + w * 0.7 + 6 * u + q * 30 * u, y - h - 60 * u - q * 90 * u, (8 + q * 22) * u, 0, 6.283);
                    X.fill();
                }
            }
            else if (k === 'neon') {
                const w = (36 + a * 34) * u;
                const h = (60 + b * 170) * u;
                const c = ['#ff4fd8', '#29f2ff', '#ffd166'][i % 3];
                X.fillStyle = '#0f0a3a';
                X.fillRect(sx, y - h, w, h + 4);
                X.strokeStyle = c;
                X.globalAlpha = al * (0.6 + 0.4 * Math.abs(Math.sin(t * 3 + i)));
                X.lineWidth = 2;
                X.shadowColor = c;
                X.shadowBlur = 12;
                X.strokeRect(sx + 2, y - h + 2, w - 4, h - 4);
                X.fillStyle = c;
                X.fillRect(sx + w * 0.2, y - h * 0.6, w * 0.6, 5 * u);
                X.shadowBlur = 0;
                X.globalAlpha = al;
                X.fillStyle = 'rgba(255,226,140,.8)';
                for (let p = 10; p < h - 10; p += 16 * u) {
                    for (let q = 8; q < w - 8; q += 12 * u) {
                        if (hs(i * 17 + p * 3 + q) > 0.62) {
                            X.fillRect(sx + q, y - h + p, 4 * u, 6 * u);
                        }
                    }
                }
            }
        }
        X.restore();
    };
    const sea = (al, t) => {
        if (al < 0.02) {
            return;
        }
        X.save();
        X.globalAlpha = al;
        const wl = H * 0.8, mx = W * 0.7;
        let g = X.createLinearGradient(0, wl, 0, H);
        g.addColorStop(0, '#0f6f9a');
        g.addColorStop(1, '#041d3f');
        X.fillStyle = g;
        X.fillRect(0, wl, W, H - wl);
        X.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 26; i++) {
            const y = wl + 8 + i * (H - wl) / 26, w = 30 + hs(i) * 70 + Math.sin(t * 1.2 + i) * 18;
            X.fillStyle = `rgba(230,251,255,${0.28 - i * 0.008})`;
            X.fillRect(mx - w / 2 + Math.sin(t + i) * 8, y, w, 2);
        }
        X.globalCompositeOperation = 'source-over';
        let lx = W * 0.88, u = H / 700;
        if (!sea.c || t - sea.c.t > 0.25 || sea.c.w !== W) {
            const pe = document.querySelector('.post'), pr = pe && pe.getBoundingClientRect();
            sea.c = { t, w: W, r: pr && pr.width ? pr.right : 0 };
        }
        const free = W - sea.c.r;
        if (sea.c.r && free > 120) {
            lx = sea.c.r + free * 0.5;
        }
        else if (W < 700) {
            lx = W * 0.92;
            u *= 0.7;
        }
        u = Math.min(u, W / 900);
        X.fillStyle = '#0a1a38';
        X.beginPath();
        X.moveTo(lx - 14 * u, wl + 4);
        X.lineTo(lx - 8 * u, wl - 120 * u);
        X.lineTo(lx + 8 * u, wl - 120 * u);
        X.lineTo(lx + 14 * u, wl + 4);
        X.fill();
        X.fillStyle = '#e6fbff';
        [30, 70].forEach(p => X.fillRect(lx - 11 * u + p * 0.03 * u, wl - p * u - 22 * u, 22 * u - p * 0.06 * u, 12 * u));
        X.fillStyle = '#ffe9a0';
        X.fillRect(lx - 10 * u, wl - 142 * u, 20 * u, 22 * u);
        const a = t * 0.9;
        X.globalCompositeOperation = 'lighter';
        const gg = X.createLinearGradient(lx, wl - 130 * u, lx + Math.cos(a) * W, wl - 130 * u);
        gg.addColorStop(0, 'rgba(255,240,170,.55)');
        gg.addColorStop(1, 'rgba(255,240,170,0)');
        X.fillStyle = gg;
        X.beginPath();
        X.moveTo(lx, wl - 131 * u);
        X.lineTo(lx + Math.cos(a) * W, wl - 131 * u - 120 * u * Math.cos(a));
        X.lineTo(lx + Math.cos(a) * W, wl - 131 * u + 120 * u * Math.cos(a));
        X.fill();
        X.restore();
    };
    const trainBg = t => {
        const u = H / 700 * 0.7;
        const n = 9;
        const cw = 70 * u;
        const tot = n * cw + 90 * u;
        const x0 = ((t * 70) % (W + tot * 1.2)) - tot;
        const y = H * 0.925;
        X.save();
        X.globalAlpha = 0.9;
        X.fillStyle = '#0a0828';
        X.fillRect(x0 + n * cw, y - 34 * u, 84 * u, 34 * u);
        X.fillRect(x0 + n * cw + 10 * u, y - 50 * u, 14 * u, 16 * u);
        X.fillRect(x0 + n * cw + 52 * u, y - 46 * u, 26 * u, 12 * u);
        for (let i = 0; i < n; i++) {
            X.fillRect(x0 + i * cw, y - 30 * u, cw - 6 * u, 30 * u);
            X.fillStyle = 'rgba(255,214,120,.9)';
            for (let w = 0; w < 4; w++) {
                X.fillRect(x0 + i * cw + 8 * u + w * 15 * u, y - 22 * u, 9 * u, 9 * u);
            }
            X.fillStyle = '#0a0828';
        }
        X.fillStyle = 'rgba(255,214,120,.9)';
        X.fillRect(x0 + n * cw + 60 * u, y - 40 * u, 10 * u, 8 * u);
        X.fillStyle = '#fff8c8';
        X.shadowColor = '#fff8c8';
        X.shadowBlur = 14;
        X.beginPath();
        X.arc(x0 + n * cw + 84 * u, y - 14 * u, 4 * u, 0, 6.283);
        X.fill();
        X.restore();
    };
    function frame(ms) {
        const t = RM ? 3 : ms / 1000, dt = Math.min(0.05, t - last);
        last = t;
        bt = Math.min(1, bt + dt / 0.7);
        px += (tx - px) * 0.05;
        scroll += (RM ? 6 : 34 + (window.RUSH || 0) * 1700) * dt;
        const A = SC[from], B = SC[to];
        let g = X.createLinearGradient(0, 0, 0, H);
        [0, 0.55, 1].forEach((s, i) => g.addColorStop(s, cm(A.sky[i], B.sky[i], bt)));
        X.fillStyle = g;
        X.fillRect(0, 0, W, H);
        const sa = lp(A.st, B.st, bt);
        stars.forEach(s => {
            X.globalAlpha = sa * (0.3 + 0.7 * Math.abs(Math.sin(t * s.s + s.p)));
            X.fillStyle = '#fff';
            X.fillRect(s.x * W, s.y * H, s.r, s.r);
        });
        X.globalAlpha = 1;
        const sx = lp(A.sun[0], B.sun[0], bt) * W + px * 10;
        const sy = lp(A.sun[1], B.sun[1], bt) * H;
        const sr = lp(A.sun[2], B.sun[2], bt) * H;
        const sc = cm(A.sun[3], B.sun[3], bt);
        let gl = X.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 3.4);
        gl.addColorStop(0, sc.replace('rgb', 'rgba').replace(')', ',.5)'));
        gl.addColorStop(1, sc.replace('rgb', 'rgba').replace(')', ',0)'));
        X.fillStyle = gl;
        X.fillRect(sx - sr * 3.4, sy - sr * 3.4, sr * 6.8, sr * 6.8);
        X.fillStyle = sc;
        X.beginPath();
        X.arc(sx, sy, sr, 0, 6.283);
        X.fill();
        for (let li = 0; li < 3; li++) {
            const ra = A.rg[li];
            const rb = B.rg[li];
            const r = [0, lp(ra[1], rb[1], bt), lp(ra[2], rb[2], bt), ra[3]];
            X.fillStyle = cm(ra[0], rb[0], bt);
            X.beginPath();
            X.moveTo(0, H);
            for (let x = 0; x <= W + 6; x += 6) {
                X.lineTo(x, ry(r, x + scroll * ra[4]));
            }
            X.lineTo(W, H);
            X.fill();
            if (li === 1) {
                const ra2 = [0, ra[1], ra[2], ra[3]];
                const wob = (k, al) => {
                    const rr = [0, ra[1], ra[2], ra[3]];
                    X.save();
                    X.translate(0, 0);
                    props(k, ra[4], al, t, rr);
                    X.restore();
                };
                if (bt < 1) {
                    wob(A.pr, 1 - bt);
                }
                wob(B.pr, bt);
            }
        }
        sea(from === 'contact' && bt < 1 ? 1 - bt : 0, t);
        sea(to === 'contact' ? bt : 0, t);
        if (!RM) {
            trainBg(t);
        }
        const gy = H * 0.95;
        X.fillStyle = '#120a30';
        X.fillRect(0, gy, W, H - gy);
        X.fillStyle = '#ffffff55';
        X.fillRect(0, gy + 4, W, 2);
        X.fillStyle = '#ffffff22';
        const sl = 34, so = (scroll * 1.1) % sl;
        for (let x = -sl; x < W + sl; x += sl) {
            X.fillRect(x - so, gy + 10, 16, 6);
        }
        X.strokeStyle = '#0a0828';
        X.fillStyle = '#0a0828';
        X.lineWidth = 2;
        const ps = 300, pc = scroll * 0.5, p0 = Math.floor(pc / ps) - 1;
        let prev = null;
        for (let i = p0; i < p0 + Math.ceil(W / ps) + 3; i++) {
            const x = i * ps - pc, top = H * 0.66;
            X.fillRect(x, top, 4, gy - top);
            X.fillRect(x - 14, top + 10, 32, 3);
            if (prev !== null) {
                X.beginPath();
                X.moveTo(prev + 2, top + 11);
                X.quadraticCurveTo((prev + x) / 2, top + 46, x + 2, top + 11);
                X.stroke();
            }
            prev = x;
        }
        g = X.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.5, W / 2, H / 2, Math.max(W, H) * 0.85);
        g.addColorStop(0, 'rgba(10,6,40,0)');
        g.addColorStop(1, 'rgba(10,6,40,.4)');
        X.fillStyle = g;
        X.fillRect(0, 0, W, H);
        if (!RM) {
            requestAnimationFrame(frame);
        }
    }
    requestAnimationFrame(frame);
    addEventListener('pointermove', e => {
        tx = e.clientX / innerWidth * 2 - 1;
    });
    window.setScene = n => {
        n = SC[n] ? n : 'home';
        if (n === to) {
            return;
        }
        from = to;
        to = n;
        bt = RM ? 1 : 0;
    };
})();

/* ===== Transit map ===== */
let routeEl, RL = 1, trainF = 0;

(function () {
    const svg = $('#ms');
    const ns = 'http://www.w3.org/2000/svg';
    const el = (t, a, p) => {
        const e = document.createElementNS(ns, t);
        for (const k in a)
            e.setAttribute(k, a[k]);
        (p || svg).appendChild(e);
        return e;
    };
    const route = 'M120 430 H250 Q310 430 310 370 V250 Q310 190 370 190 H560 Q620 190 620 250 V330 Q620 390 680 390 H850';
    svg.innerHTML = `<defs><pattern id="gp" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#1b174714" stroke-width="2"/>` +
        `</pattern></defs><rect width="960" height="520" fill="url(#gp)"/>`;
    el('path', {
        d: 'M-20 110 C200 170 420 50 980 140',
        stroke: '#9edcff',
        fill: 'none',
        'stroke-width': 44,
        opacity: 0.55,
        'stroke-linecap': 'round'
    });
    [[740, 60, 150, 70], [90, 230, 120, 90], [430, 330, 110, 120], [760, 250, 150, 60]].forEach(([x, y, w, h]) => el('rect', { x, y, width: w, height: h, rx: 22, fill: '#9fe0b0', opacity: 0.55 }));
    [[160, 80, 24], [690, 150, 18], [520, 440, 22], [820, 470, 26]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#6cc88c', opacity: 0.7 }));
    el('path', {
        d: 'M70 100 H250 Q310 100 310 160',
        stroke: '#1b174733',
        fill: 'none',
        'stroke-width': 10,
        'stroke-linecap': 'round',
        'stroke-dasharray': '2 16'
    });
    el('path', {
        d: 'M620 480 H900',
        stroke: '#1b174733',
        fill: 'none',
        'stroke-width': 10,
        'stroke-linecap': 'round',
        'stroke-dasharray': '2 16'
    });
    el('text', {
        x: 36,
        y: 60,
        'font-family': 'Syne,sans-serif',
        'font-weight': 800,
        'font-size': 34,
        fill: '#1b1747'
    }).textContent = 'JEREMY’S LINE';
    el('text', {
        x: 38,
        y: 84,
        'font-family': 'Space Mono,monospace',
        'font-size': 13,
        fill: '#6a6396',
        'letter-spacing': 2
    }).textContent = 'ROUTE MAP · SIX STATIONS';
    el('path', {
        d: route,
        fill: 'none',
        stroke: '#1b1747',
        'stroke-width': 26,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });
    routeEl = el('path', {
        d: route,
        fill: 'none',
        stroke: '#ff6b9d',
        'stroke-width': 16,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });
    el('path', {
        d: route,
        fill: 'none',
        stroke: '#fff',
        'stroke-width': 3,
        'stroke-dasharray': '2 14',
        'stroke-linecap': 'round',
        opacity: 0.8
    });
    RL = routeEl.getTotalLength();
    const tr = el('g', { id: 'trn' });
    el('rect', { x: -58, y: -10, width: 30, height: 20, rx: 6, fill: '#7b8cff', stroke: '#1b1747', 'stroke-width': 3 }, tr);
    el('rect', { x: -26, y: -12, width: 44, height: 24, rx: 8, fill: '#ffd166', stroke: '#1b1747', 'stroke-width': 3 }, tr);
    el('rect', { x: -6, y: -7, width: 12, height: 9, rx: 3, fill: '#1b1747' }, tr);
    el('rect', { x: 8, y: -16, width: 7, height: 6, fill: '#1b1747' }, tr);
    el('circle', { cx: 20, cy: 0, r: 3.5, fill: '#fff' }, tr);
    ORDER.forEach((k, i) => {
        if (k === 'home') {
            return;
        }
        const o = ST[k];
        const pt = routeEl.getPointAtLength(RL * o.f);
        const p2 = routeEl.getPointAtLength(Math.min(RL, RL * o.f + 4));
        const vert = Math.abs(p2.y - pt.y) > Math.abs(p2.x - pt.x);
        const b = document.createElement('button');
        b.className = 'st ' + (vert ? 'r' : i % 2 ? 'b' : 't');
        b.dataset.k = k;
        b.style.cssText = `left:${pt.x / 9.6}%;top:${pt.y / 5.2}%`;
        b.setAttribute('aria-label', `${o.n}: ${o.s}`);
        b.innerHTML = `<i></i><b>${o.n}</b>`;
        b.onclick = () => travel(k);
        $('#mapc').appendChild(b);
    });
    const h = routeEl.getPointAtLength(0), hb = document.createElement('div');
    hb.className = 'st b here';
    hb.style.cssText = `left:${h.x / 9.6}%;top:${h.y / 5.2}%;pointer-events:none`;
    hb.innerHTML = '<i></i><b>Home Terminal</b>';
    $('#mapc').appendChild(hb);
    setTrain(0);
})();

function setTrain(f, back) {
    const p = routeEl.getPointAtLength(RL * f);
    const a = routeEl.getPointAtLength(Math.max(0, RL * f - 3));
    const b = routeEl.getPointAtLength(Math.min(RL, RL * f + 3));
    let ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    if (back) {
        ang += 180;
    }
    $('#trn').setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang})`);
    trainF = f;
}

let pf = 0;

function moveTrain(f0, f1, ms) {
    const t0 = performance.now(), back = f1 < f0;
    const st = now => {
        const p = Math.min(1, (now - t0) / ms), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        setTrain(f0 + (f1 - f0) * e, back);
        if (now - pf > 110) {
            pf = now;
            const pt = routeEl.getPointAtLength(RL * trainF);
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('class', 'puff');
            c.setAttribute('cx', pt.x);
            c.setAttribute('cy', pt.y - 18);
            c.setAttribute('r', 5);
            $('#ms').appendChild(c);
            setTimeout(() => c.remove(), 1100);
        }
        if (p < 1) {
            requestAnimationFrame(st);
        }
    };
    requestAnimationFrame(st);
}

/* departure board */
$('#board').insertAdjacentHTML('beforeend', ORDER.slice(1).map((k, i) => `<button class="row" data-go="${k}"><span>0${i + 1}</span><span><b>${ST[k].n.toUpperCase()}</b></span>` +
    `<span>${ST[k].s.toUpperCase()}</span><span><em>${ST[k].t}</em></span></button>`).join(''));
document.querySelectorAll('#board .row span').forEach((s, i) => s.style.animationDelay = (i * 0.04 + 0.3) + 's');

/* ===== Travel + pages ===== */
let cur = 'home', busy = false, stopGame = () => { };
const navOn = k => {
    document.querySelectorAll('.strip .sd').forEach(b => b.classList.toggle('on', b.dataset.go === k));
    $('#strip').style.setProperty('--p', ORDER.indexOf(k) / 5);
};

const fx = $('#fx'), F = fx.getContext('2d');

function drawLines(p, amt) {
    const W = fx.width = innerWidth, H = fx.height = innerHeight;
    F.clearRect(0, 0, W, H);
    if (!amt) {
        return;
    }
    F.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
        const y = (i * 53.7 + i * i * 7) % H;
        const len = (120 + (i * 37) % 400) * amt;
        const x = ((p * 3200 * (0.5 + (i % 5) / 5) + i * 211) % (W + len * 2)) - len;
        F.strokeStyle = `rgba(255,243,223,${(0.08 + (i % 4) * 0.05) * amt * 1.6})`;
        F.lineWidth = 1.5 + i % 3;
        F.beginPath();
        F.moveTo(W - x, y);
        F.lineTo(W - x + len, y);
        F.stroke();
    }
}

function travel(k) {
    if (busy || (k === cur && k !== 'home')) {
        return;
    }
    if (k === 'home' && !document.body.classList.contains('pg')) {
        return;
    }
    busy = true;
    const D = RM ? 600 : 1700, t0 = performance.now();
    let opened = false, sw2 = false, chimed = false;
    sfx('travel');
    navOn(k);
    if (!RM) {
        moveTrain(trainF, ST[k].f, 1300);
    }
    $('#sn').textContent = ST[k].n;
    $('#sign').classList.add('on');
    document.body.classList.add('wp');
    const step = now => {
        const p = Math.min(1, (now - t0) / D);
        const amt = RM ? 0 : Math.sin(Math.PI * Math.min(1, p * 1.05));
        window.RUSH = amt;
        drawLines(p, amt);
        if (p >= 0.4 && !sw2) {
            sw2 = true;
            setScene(k);
        }
        if (p >= 0.68 && !opened) {
            opened = true;
            cur = k;
            document.body.classList.remove('wp');
            k === 'home' ? closePage() : (openPage(k), stamp(k));
        }
        if (p >= 0.85 && !chimed) {
            chimed = true;
            sfx('chime');
        }
        if (p < 1) {
            requestAnimationFrame(step);
        }
        else {
            window.RUSH = 0;
            F.clearRect(0, 0, fx.width, fx.height);
            setTimeout(() => $('#sign').classList.remove('on'), 900);
            busy = false;
        }
    };
    requestAnimationFrame(step);
}

document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => travel(b.dataset.go));
$('#logo').onclick = () => {
    closePage();
    cur = 'home';
    setTrain(0);
    const s = $('#start');
    s.style.display = '';
    document.body.classList.add('title');
};

const head = k => {
    const i = ORDER.indexOf(k);
    return `<div class="kick">Stop ${i} of 5</div><div class="dock"><span>PLATFORM ${ST[k].pf}</span><span>·</span>` +
        `<span>${ST[k].n.toUpperCase()}</span></div>`;
};

const mock = a => {
    const [c, d] = a.split(',');
    return `<div class="mock" style="--a:${c};--b:${d}"><div class="mb"><i></i><i></i><i></i></div><div class="mx">` +
        `<s></s><b></b><u></u><u></u></div></div>`;
};

const mets = p => `<div class="mets">${p.metrics.map(m => `<div><b>${esc(m[0])}</b><span>${esc(m[1])}</span></div>`).join('')}</div>`;
const tags = p => p.stack.map(x => `<span class="tag">${esc(x)}</span>`).join('');
const detail = p => `<div class="det"><h4>The problem</h4><p>${esc(p.problem)}</p><h4>The approach</h4><p>${esc(p.approach)}</p>` +
    `<h4>The result</h4><p>${esc(p.result)}</p></div>`;
const PG = {
    about: () => `${head('about')}<div class="g2"><div><h2 class="gt">About me</h2><div class="stats"><span><b>${CFG.projects.length}</b>PROJECTS</span>` +
        `<span><b>${CFG.skills.length}</b>SKILLS</span><span><b>6</b>STATIONS</span></div><p>${esc(CFG.bio)}</p>` +
        `<p>${esc(CFG.about2)}</p><button class="btn p" data-go="lib">See my work</button>` +
        `</div>
  <div class="pass"><small>BOARDING PASS</small><h4>${esc(CFG.name)}</h4><small>${esc(CFG.roles[0]).toUpperCase()}</small>` +
        `<hr><small>FROM</small><b>MONTALBAN RIZAL</b><br><small>TO</small><b>YOUR NEXT PROJECT</b><hr><div class="bc">` +
        `</div></div></div>`,
    lib: () => {
        const f = CFG.projects[0];
        return `${head('lib')}<h2 class="gt">Projects</h2><p class="sub">${CFG.projects.length} journeys completed. Open a ticket for the full story.</p>` +
            `<div class="grid3">
  <article class="tk pj feat"><div><div class="meta"><span class="f">FEATURED</span><span>${f.year}</span>` +
            `<span>${esc(f.role)}</span></div><h3>${esc(f.t)}</h3><p style="color:var(--pink);font-weight:700">${esc(f.tag)}</p>` +
            `<p>${esc(f.d)}</p>${mets(f)}<div>${tags(f)}</div><p><button class="btn p tg">Read the story</button>` +
            `</p>${detail(f)}</div>${mock(f.art)}</article>
  ${CFG.projects.slice(1).map(p => `<article class="tk pj">${mock(p.art)}<div class="meta" style="margin-top:12px">${p.year ? `<span>${esc(p.year)}</span>` : ''}` +
      `<span>${esc(p.cat)}</span></div><h3>${esc(p.t)}</h3><p>${esc(p.tag)}</p>${mets(p)}<div>${tags(p)}</div>` +
      `<p><button class="btn p tg">Read the story</button></p>${detail(p)}</article>`).join('')}</div>`;
    },
    potion: () => `${head('potion')}<h2 class="gt">Skills</h2><p class="sub">Tools I carry on every trip.</p><div class="grid2">${CFG.skills.map(k => `<div class="tk"><b class="sy" style="font-size:22px">${esc(k[0])}</b><div class="trk"><i style="width:${k[1]}%">` +
        `</i></div><small class="mono" style="color:#6a6396">${k[1]}% of the way there</small></div>`).join('')}</div>`,
    arcade: () => `${head('arcade')}<h2 class="gt">Games</h2><div class="tabs"><button class="btn on" data-g="lanes">Track Switch</button>` +
        `<button class="btn" data-g="stopper">Station Master</button><button class="btn" data-g="stamps">Stamp Match</button>` +
        `</div><div id="game"></div>`,
    contact: () => `${head('contact')}<h2 class="gt">Let's talk</h2><div class="post"><div class="stamp">JL</div><p style="margin-top:0;color:#3a3566;max-width:60%">Send me a postcard. I read every one.</p>` +
        `<form class="cf" id="cf"><input type="hidden" name="_subject" value="Portfolio contact message"><div class="hp" aria-hidden="true"><label>Leave this field empty<input name="_gotcha" tabindex="-1" autocomplete="off"></label></div>` +
        `<input name="name" maxlength="100" placeholder="Your name" aria-label="Your name" required><input name="email" type="email" maxlength="254" placeholder="Your email" aria-label="Your email" required>` +
        `<textarea name="message" rows="4" maxlength="4000" placeholder="Your message" aria-label="Your message" required></textarea>` +
        `<button class="btn p" type="submit" style="justify-self:start">Post it</button></form><p id="cm" role="status" aria-live="polite" style="min-height:1.5em;color:#3a3566">` +
        `</p><p style="color:#3a3566">Or write to <a href="mailto:${esc(CFG.email)}">${esc(CFG.email)}</a> · <a href="${CFG.github}">GitHub</a> · <a href="${CFG.linkedin}">LinkedIn</a>` +
        `</p></div>`
};

function openPage(k) {
    stopGame();
    const b = $('#box');
    b.style.animation = 'none';
    void b.offsetWidth;
    b.style.animation = '';
    b.innerHTML = PG[k]() + (() => {
        const i = ORDER.indexOf(k), pv = ORDER[i - 1], nx = ORDER[i + 1];
        return `<div class="pn">${pv ? `<button class="btn o" data-go="${pv}">← ${ST[pv].n}</button>` : '<span></span>'}<button class="btn o" data-go="home">Back to the platform</button>${nx ? `<button class="btn p" data-go="${nx}">Next: ${ST[nx].n} →</button>` : '<span></span>'}</div>`;
    })();
    $('#ov').classList.add('show');
    $('#ov').scrollTop = 0;
    document.body.classList.add('pg');
    b.querySelectorAll('[data-go]').forEach(x => x.onclick = () => travel(x.dataset.go));
    b.querySelectorAll('.pj .tg').forEach(x => x.onclick = () => {
        const c = x.closest('.pj');
        c.classList.toggle('open');
        x.textContent = c.classList.contains('open') ? 'Close the story' : 'Read the story';
    });
    if (k === 'arcade') {
        b.querySelectorAll('.tabs .btn').forEach(t => t.onclick = () => {
            b.querySelectorAll('.tabs .btn').forEach(x => x.classList.toggle('on', x === t));
            loadGame(t.dataset.g);
        });
        loadGame('lanes');
    }
    if (k === 'contact') {
        const f = $('#cf');
        f.onsubmit = async e => {
            e.preventDefault();
            const msg = $('#cm'), btn = f.querySelector('button');
            if (!CFG.formUrl) {
                msg.textContent = 'The contact form is not configured. Please write to ' + CFG.email + ' directly.';
                return;
            }
            btn.disabled = true;
            msg.textContent = 'Sending your postcard...';
            try {
                const response = await fetch(CFG.formUrl, {
                    method: 'POST',
                    body: new FormData(f),
                    headers: { Accept: 'application/json' }
                });
                if (!response.ok) {
                    let detail = '';
                    try {
                        const result = await response.json();
                        detail = result.errors?.map(error => error.message).join(' ') || '';
                    } catch (error) {
                        console.error('Could not read contact form error response:', error);
                    }
                    throw new Error(detail || `Form submission failed with status ${response.status}`);
                }
                f.reset();
                msg.textContent = 'Postcard delivered! Thanks, I will write back soon.';
            } catch (error) {
                console.error('Contact form submission failed:', error);
                msg.textContent = 'Your message could not be sent. Please try again or email ' + CFG.email + ' directly.';
            } finally {
                btn.disabled = false;
            }
        };
    }
}

function closePage() {
    stopGame();
    $('#ov').classList.remove('show');
    document.body.classList.remove('pg');
    cur = 'home';
    navOn('home');
    setScene('home');
    if (trainF > 0 && !busy) {
        moveTrain(trainF, 0, 700);
    }
}

addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('pg') && !busy) {
        travel('home');
    }
});

$('#nm').innerHTML = CFG.name.split(' ').map((w, i) => `<span class="${i ? 'gt' : ''}">${esc(w)}</span>`).join('');
$('#bio').textContent = CFG.bio;
$('#stt').textContent = CFG.status;

(function () {
    const el = $('#role');
    let i = 0, j = 0, del = false;
    const tk = () => {
        const w = CFG.roles[i];
        el.textContent = w.slice(0, j);
        if (!del && j < w.length) {
            j++;
            setTimeout(tk, 70);
        }
        else if (!del) {
            del = true;
            setTimeout(tk, 1400);
        }
        else if (j > 0) {
            j--;
            setTimeout(tk, 35);
        }
        else {
            del = false;
            i = (i + 1) % CFG.roles.length;
            setTimeout(tk, 300);
        }
    };
    tk();
})();

/* ===== Mini games ===== */
const best = { lanes: 0, stopper: 0, stamps: 0 };

function loadGame(g) {
    stopGame();
    ({ lanes, stopper, stamps })[g]();
}

const GH = (a, b) => `<div class="ghud"><span>${a}: <b id="sc">0</b></span><span>${b}</span><span>Best: <b id="bs"></b></span></div>`;

function fitFont(x, t, maxW, px) {
    let s = px;
    x.font = `800 ${s}px Syne,sans-serif`;
    while (x.measureText(t).width > maxW && s > 11) {
        s--;
        x.font = `800 ${s}px Syne,sans-serif`;
    }
}

function lanes() {
    $('#game').innerHTML = `<p style="text-align:center">Switch tracks to collect gold tickets and dodge the red barriers. Use the arrow keys, or tap the left or right side of the screen. 3 lives.</p>` +
        `<canvas class="gc" id="cv" width="340" height="440"></canvas>${GH('Tickets', 'Lives: <b id="lv">3</b>')}<p style="text-align:center">` +
        `<button class="btn p" id="play">Start</button></p>`;
    const cv = $('#cv');
    const x = cv.getContext('2d');
    const W = 340;
    const H = 440;
    const HZ = 128;
    const VX = 170;
    const BX = [46, 170, 294];
    const TY = 392;
    const R2 = Math.random;
    let run = false;
    let over = false;
    let ln = 1;
    let cx = 170;
    let it = [];
    let pt = [];
    let pp = [];
    let sc = 0;
    let lv = 3;
    let t = 0;
    let sp = 0;
    let raf;
    let last = 0;
    let ph = 0;
    let flash = 0;
    let shake = 0;
    let id = 0;
    $('#bs').textContent = best.lanes;
    const SK = Array.from({ length: 14 }, (_, i) => [i * 26 + R2() * 6, 8 + R2() * 26, 12 + R2() * 10]);
    const LX = (l, p) => VX + (BX[l] - VX) * p;
    const YS = p => HZ + (TY + 10 - HZ) * p;
    const burst = (px, py, cols, n) => {
        for (let i = 0; i < n; i++) {
            pt.push({ x: px, y: py, vx: (R2() - 0.5) * 220, vy: -60 - R2() * 200, l: 0.7, c: cols[i % cols.length] });
        }
    };
    const heart = (hx, hy, s, on) => {
        x.save();
        x.translate(hx, hy);
        x.scale(s, s);
        x.beginPath();
        x.moveTo(0, 4);
        x.bezierCurveTo(-10, -4, -6, -12, 0, -6);
        x.bezierCurveTo(6, -12, 10, -4, 0, 4);
        x.closePath();
        if (on) {
            x.fillStyle = '#ff4d6d';
            x.fill();
        }
        x.lineWidth = 2;
        x.strokeStyle = '#fff3df';
        x.stroke();
        x.restore();
    };
    const scene = () => {
        let g = x.createLinearGradient(0, 0, 0, HZ);
        g.addColorStop(0, '#5b3fb0');
        g.addColorStop(0.6, '#ff6b9d');
        g.addColorStop(1, '#ffc08a');
        x.fillStyle = g;
        x.fillRect(0, 0, W, HZ + 2);
        x.save();
        x.globalCompositeOperation = 'lighter';
        const sg = x.createRadialGradient(236, HZ - 8, 4, 236, HZ - 8, 70);
        sg.addColorStop(0, 'rgba(255,240,190,.9)');
        sg.addColorStop(1, 'rgba(255,200,140,0)');
        x.fillStyle = sg;
        x.fillRect(150, HZ - 80, 170, 100);
        x.restore();
        x.fillStyle = '#fff6d0';
        x.beginPath();
        x.arc(236, HZ - 8, 24, 0, 6.283);
        x.fill();
        [['#8a54b8', 22, 0.5], ['#5a3f9c', 16, 1]].forEach(([c, a, m], i) => {
            x.fillStyle = c;
            x.beginPath();
            x.moveTo(0, HZ + 1);
            for (let q = 0; q <= W; q += 6) {
                x.lineTo(q, HZ - a * (0.5 + Math.sin((q + ph * 90 * m) / 38 + i * 3) * 0.3 + Math.sin((q + ph * 90 * m) / 15 + i) * 0.2));
            }
            x.lineTo(W, HZ + 1);
            x.fill();
        });
        x.fillStyle = '#2a1a5a';
        SK.forEach(b => x.fillRect(b[0], HZ - b[1], b[2], b[1] + 1));
        g = x.createLinearGradient(0, HZ, 0, H);
        g.addColorStop(0, '#3b2a78');
        g.addColorStop(1, '#0e0b2a');
        x.fillStyle = g;
        x.fillRect(0, HZ, W, H - HZ);
        for (let k = 0; k < 6; k++) {
            const u = (k / 6 + ph * 0.35) % 1, p = Math.pow(u, 1.8), y = YS(p), h = 14 + 110 * p;
            [-1, 1].forEach(s => {
                const q = VX + s * (34 + 150 * p);
                x.fillStyle = '#0a0828';
                x.fillRect(q - 1 - 3 * p, y - h, 2 + 6 * p, h);
                x.fillRect(q - 8 * p - 6, y - h + 3, 16 * p + 12, 2 + 2 * p);
            });
        }
        const P0 = 0.14;
        const pb = (H - HZ) / (TY + 10 - HZ);
        const RXs = (l, s, p) => LX(l, p) + s * (2 + 21.7 * p);
        const yT = YS(P0);
        const fadeG = (rgb, a0) => {
            const gr = x.createLinearGradient(0, yT, 0, YS(P0 + 0.24));
            gr.addColorStop(0, `rgba(${rgb},0)`);
            gr.addColorStop(1, `rgba(${rgb},${a0})`);
            return gr;
        };
        for (let l = 0; l < 3; l++) {
            const hw = p => 4 + 48 * p;
            x.fillStyle = fadeG('43,35,88', 1);
            x.beginPath();
            x.moveTo(LX(l, P0) - hw(P0), yT);
            x.lineTo(LX(l, P0) + hw(P0), yT);
            x.lineTo(LX(l, pb) + hw(pb), H);
            x.lineTo(LX(l, pb) - hw(pb), H);
            x.fill();
            for (let k = 0; k < 14; k++) {
                const u = (k / 14 + ph) % 1, p = Math.pow(u, 1.8);
                if (p < P0) {
                    continue;
                }
                const f = Math.min(1, (p - P0) / 0.2);
                x.fillStyle = `rgba(138,106,74,${(0.35 + 0.6 * p) * f})`;
                x.fillRect(LX(l, p) - (6 + 32 * p), YS(p), 2 * (6 + 32 * p), 1 + 5 * p);
            }
            [-1, 1].forEach(s => {
                const w = p => 0.4 + 1.9 * p;
                x.fillStyle = fadeG('232,226,212', 1);
                x.beginPath();
                x.moveTo(RXs(l, s, P0) - w(P0), yT);
                x.lineTo(RXs(l, s, P0) + w(P0), yT);
                x.lineTo(RXs(l, s, pb) + w(pb), H);
                x.lineTo(RXs(l, s, pb) - w(pb), H);
                x.fill();
            });
        }
        g = x.createLinearGradient(0, HZ - 4, 0, HZ + 50);
        g.addColorStop(0, 'rgba(255,190,150,.55)');
        g.addColorStop(1, 'rgba(255,190,150,0)');
        x.fillStyle = g;
        x.fillRect(0, HZ - 4, W, 54);
    };
    const item = o => {
        const p = o.p, s = 0.1 + 0.9 * p, px = LX(o.l, p), py = YS(p);
        x.save();
        x.globalAlpha = Math.min(1, (p - 0.14) / 0.12);
        if (o.k) {
            x.translate(px, py - 16 * s);
            x.rotate(Math.sin(t * 3 + o.id) * 0.12);
            x.scale(s, s);
            x.shadowColor = '#ffd166';
            x.shadowBlur = 14;
            const g = x.createLinearGradient(0, -14, 0, 14);
            g.addColorStop(0, '#ffe9a0');
            g.addColorStop(1, '#ffb020');
            x.fillStyle = g;
            x.beginPath();
            x.roundRect(-22, -14, 44, 28, 6);
            x.fill();
            x.shadowBlur = 0;
            x.fillStyle = '#143a4a';
            x.beginPath();
            x.arc(-22, 0, 4.5, 0, 6.283);
            x.arc(22, 0, 4.5, 0, 6.283);
            x.fill();
            x.fillStyle = '#b8801a';
            x.beginPath();
            for (let a = 0; a < 10; a++) {
                const r = a % 2 ? 3.5 : 8;
                x.lineTo(Math.cos(a * 0.628 - 1.57) * r, Math.sin(a * 0.628 - 1.57) * r);
            }
            x.fill();
            x.fillStyle = 'rgba(255,255,255,.7)';
            x.fillRect(-18 + (t * 50 + o.id * 13) % 40, -14, 4, 28);
        }
        else {
            x.translate(px, py);
            x.scale(s, s);
            x.fillStyle = '#222';
            x.fillRect(-26, -26, 5, 26);
            x.fillRect(21, -26, 5, 26);
            for (let a = 0; a < 4; a++) {
                x.fillStyle = a % 2 ? '#fff' : '#e03a4e';
                x.fillRect(-28 + a * 14, -34, 14, 14);
            }
            x.strokeStyle = '#1b1747';
            x.lineWidth = 2;
            x.strokeRect(-28, -34, 56, 14);
            const b = Math.floor(t * 4 + o.id) % 2;
            [-1, 1].forEach((q, i) => {
                x.fillStyle = (i + b) % 2 ? '#ffb020' : '#6a3a10';
                x.shadowColor = '#ffb020';
                x.shadowBlur = (i + b) % 2 ? 14 : 0;
                x.beginPath();
                x.arc(q * 20, -40, 4, 0, 6.283);
                x.fill();
            });
        }
        x.restore();
    };
    const train = () => {
        x.save();
        x.translate(cx, TY + Math.sin(t * 14));
        x.fillStyle = 'rgba(0,0,0,.35)';
        x.beginPath();
        x.ellipse(0, 18, 40, 8, 0, 0, 6.283);
        x.fill();
        x.save();
        x.globalCompositeOperation = 'lighter';
        const bg2 = x.createLinearGradient(0, -6, 0, -TY + HZ + 40);
        bg2.addColorStop(0, 'rgba(255,248,200,.3)');
        bg2.addColorStop(1, 'rgba(255,248,200,0)');
        x.fillStyle = bg2;
        x.beginPath();
        x.moveTo(-22, -6);
        x.lineTo(22, -6);
        x.lineTo(8, -TY + HZ + 40);
        x.lineTo(-8, -TY + HZ + 40);
        x.fill();
        x.restore();
        let g = x.createLinearGradient(-30, 0, 30, 0);
        g.addColorStop(0, '#2a2370');
        g.addColorStop(0.5, '#3c3296');
        g.addColorStop(1, '#2a2370');
        x.fillStyle = g;
        x.beginPath();
        x.roundRect(-30, -80, 60, 94, [20, 20, 8, 8]);
        x.fill();
        x.lineWidth = 3;
        x.strokeStyle = '#0f0c2c';
        x.stroke();
        g = x.createLinearGradient(0, -70, 0, -42);
        g.addColorStop(0, '#fff0b8');
        g.addColorStop(1, '#ffb865');
        x.fillStyle = g;
        x.beginPath();
        x.roundRect(-23, -70, 46, 28, 8);
        x.fill();
        x.fillStyle = '#1b1747';
        x.fillRect(-1.5, -70, 3, 28);
        x.fillStyle = '#ff6b9d';
        x.fillRect(-30, -30, 60, 8);
        x.fillStyle = '#ffd166';
        x.fillRect(-30, -21, 60, 3);
        x.fillStyle = '#ffd166';
        x.beginPath();
        x.roundRect(-35, 5, 70, 12, 5);
        x.fill();
        x.strokeStyle = '#1b1747';
        x.stroke();
        x.shadowColor = '#fff8c8';
        x.shadowBlur = 16;
        x.fillStyle = '#fff8c8';
        [-19, 19].forEach(q => {
            x.beginPath();
            x.arc(q, -6, 6, 0, 6.283);
            x.fill();
        });
        x.restore();
    };
    const draw = () => {
        x.clearRect(0, 0, W, H);
        x.save();
        if (shake > 0) {
            x.translate((R2() - 0.5) * 8 * shake, (R2() - 0.5) * 8 * shake);
        }
        scene();
        it.slice().sort((a, b) => a.p - b.p).forEach(item);
        train();
        pt.forEach(q => {
            x.globalAlpha = Math.max(0, q.l / 0.7);
            x.fillStyle = q.c;
            x.fillRect(q.x - 2, q.y - 2, 4, 4);
        });
        x.globalAlpha = 1;
        pp.forEach(q => {
            x.globalAlpha = Math.min(1, q.l * 2);
            x.fillStyle = '#fff';
            x.strokeStyle = '#1b1747';
            x.lineWidth = 4;
            x.font = '800 20px Syne,sans-serif';
            x.textAlign = 'center';
            x.strokeText(q.t, q.x, q.y);
            x.fillText(q.t, q.x, q.y);
        });
        x.globalAlpha = 1;
        x.textAlign = 'left';
        for (let i = 0; i < 3; i++) {
            heart(22 + i * 26, 22, 1.2, i < lv);
        }
        if (flash > 0) {
            x.fillStyle = `rgba(255,40,80,${flash * 0.35})`;
            x.fillRect(0, 0, W, H);
        }
        x.restore();
        if (!run) {
            x.fillStyle = 'rgba(18,16,58,.78)';
            x.fillRect(0, 0, W, H);
            x.fillStyle = '#fff3df';
            x.beginPath();
            x.roundRect(45, 150, 250, 140, 16);
            x.fill();
            x.fillStyle = '#1b1747';
            x.textAlign = 'center';
            fitFont(x, over ? 'END OF THE LINE' : 'READY?', 212, 26);
            x.fillText(over ? 'END OF THE LINE' : 'READY?', 170, 200);
            x.font = '15px DM Sans,sans-serif';
            x.fillText(over ? 'Tickets collected: ' + sc : 'Press Start to depart', 170, 230);
            x.fillStyle = '#ff6b9d';
            x.fillRect(65, 250, 210, 6);
            x.fillStyle = '#ffd166';
            x.fillRect(65, 260, 210, 3);
            x.textAlign = 'left';
        }
    };
    const loop = ts => {
        if (!run) {
            return;
        }
        const dt = Math.min(0.05, (ts - last) / 1000 || 0);
        last = ts;
        t += dt;
        sp -= dt;
        const k = 1 + t * 0.012;
        ph = (ph + dt * 0.5 * k) % 1;
        cx += (BX[ln] - cx) * Math.min(1, dt * 14);
        flash = Math.max(0, flash - dt * 3);
        shake = Math.max(0, shake - dt * 3);
        if (sp <= 0) {
            it.push({ l: R2() * 3 | 0, p: 0.14, k: R2() < 0.55, id: id++ });
            sp = Math.max(0.42, 0.95 - t / 60);
        }
        it.forEach(o => o.p += dt * (0.16 + 1.5 * o.p) * k * 0.78);
        it = it.filter(o => {
            if (o.p > 0.86 && o.p < 1.06 && Math.abs(cx - BX[o.l]) < 30) {
                if (o.k) {
                    sc += 10;
                    $('#sc').textContent = sc;
                    sfx('coin');
                    burst(cx, TY - 40, ['#ffd166', '#fff3df', '#ff6b9d'], 12);
                    pp.push({ x: cx, y: TY - 70, l: 0.8, t: '+10' });
                }
                else {
                    lv--;
                    $('#lv').textContent = Math.max(0, lv);
                    sfx('hit');
                    flash = 1;
                    shake = 1;
                    burst(cx, TY - 30, ['#ff4d6d', '#ff9f43', '#fff3df'], 16);
                }
                return false;
            }
            return o.p < 1.2;
        });
        pt.forEach(q => {
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            q.vy += 520 * dt;
            q.l -= dt;
        });
        pt = pt.filter(q => q.l > 0);
        pp.forEach(q => {
            q.y -= 40 * dt;
            q.l -= dt;
        });
        pp = pp.filter(q => q.l > 0);
        if (lv <= 0) {
            run = false;
            over = true;
            if (sc > best.lanes) {
                best.lanes = sc;
                $('#bs').textContent = sc;
            }
            sfx('win');
            $('#play').textContent = 'Play again';
        }
        draw();
        if (run) {
            raf = requestAnimationFrame(loop);
        }
    };
    const kd = e => {
        if (!run) {
            return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            ln = Math.max(0, ln - 1);
            e.preventDefault();
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            ln = Math.min(2, ln + 1);
            e.preventDefault();
        }
    };
    document.addEventListener('keydown', kd);
    cv.addEventListener('pointerdown', e => {
        if (!run) {
            return;
        }
        e.preventDefault();
        const r = cv.getBoundingClientRect();
        (e.clientX - r.left) < r.width / 2 ? ln = Math.max(0, ln - 1) : ln = Math.min(2, ln + 1);
    });
    $('#play').onclick = () => {
        it = [];
        pt = [];
        pp = [];
        sc = 0;
        lv = 3;
        t = 0;
        sp = 0;
        ln = 1;
        cx = 170;
        flash = 0;
        shake = 0;
        run = true;
        over = false;
        last = performance.now();
        $('#sc').textContent = 0;
        $('#lv').textContent = 3;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
    };
    stopGame = () => {
        run = false;
        cancelAnimationFrame(raf);
        document.removeEventListener('keydown', kd);
    };
    draw();
}

function stopper() {
    $('#game').innerHTML = `<p style="text-align:center">The train is rolling into the station. Brake so its nose stops on the green platform mark. Press the button, click the scene, or hit Space. Five rounds, and the mark gets smaller each time.</p>` +
        `<canvas class="gc wide" id="cv" width="520" height="260"></canvas>${GH('Score', 'Round: <b id="rd">0</b>/5')}<p style="text-align:center">` +
        `<button class="btn p" id="play">Start</button> <button class="btn" id="brk" disabled>Brake!</button>` +
        `</p>`;
    const cv = $('#cv');
    const x = cv.getContext('2d');
    const W = 520;
    const H = 260;
    const RY = 170;
    const TG = W * 0.7;
    const A = 420;
    $('#bs').textContent = best.stopper;
    let st = 'idle';
    let round = 0;
    let score = 0;
    let nose = -300;
    let v = 0;
    let wa = 0;
    let raf;
    let last = 0;
    let msg = '';
    let pf = [];
    let t = 0;
    let nt;
    let res = null;
    const zw = () => Math.max(12, 34 - round * 5);
    const wheel = (wx, r) => {
        x.fillStyle = '#14102e';
        x.beginPath();
        x.arc(wx, RY - r, r, 0, 6.283);
        x.fill();
        x.strokeStyle = '#ffd166';
        x.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const a = wa + i * 1.57;
            x.beginPath();
            x.moveTo(wx, RY - r);
            x.lineTo(wx + Math.cos(a) * (r - 2), RY - r + Math.sin(a) * (r - 2));
            x.stroke();
        }
        x.fillStyle = '#ffd166';
        x.beginPath();
        x.arc(wx, RY - r, 2.5, 0, 6.283);
        x.fill();
    };
    const trainDraw = () => {
        const n = nose;
        [[n - 224, 100, '#1fd1c4'], [n - 118 - 6 - 100 + 0, 100, '#ffd166']].forEach(([cx0, w, c], i) => {
            const xl = n - 118 - 6 - (i ? 106 : 0) - 100 + (i ? 0 : 0) + (i ? 0 : 0);
            const left = n - 118 - 6 - 100 - (i ? 106 : 0);
            x.fillStyle = c;
            x.beginPath();
            x.roundRect(left, RY - 50, 100, 36, 6);
            x.fill();
            x.strokeStyle = '#1b1747';
            x.lineWidth = 3;
            x.stroke();
            x.fillStyle = '#1b1747';
            x.fillRect(left, RY - 26, 100, 6);
            for (let k = 0; k < 4; k++) {
                x.fillStyle = '#fff0b8';
                x.beginPath();
                x.roundRect(left + 8 + k * 23, RY - 44, 16, 14, 3);
                x.fill();
            }
            wheel(left + 20, 9);
            wheel(left + 80, 9);
            x.fillStyle = '#14102e';
            x.fillRect(left + 100, RY - 22, 6, 4);
        });
        const l = n - 118;
        x.fillStyle = '#2f2878';
        x.beginPath();
        x.roundRect(l, RY - 56, 118, 42, [8, 18, 6, 6]);
        x.fill();
        x.strokeStyle = '#1b1747';
        x.lineWidth = 3;
        x.stroke();
        x.fillStyle = '#ff6b9d';
        x.fillRect(l, RY - 30, 118, 7);
        x.fillStyle = '#ffd166';
        x.fillRect(l + 6, RY - 62, 68, 6);
        x.fillStyle = '#1b1747';
        x.fillRect(l + 86, RY - 72, 12, 16);
        x.fillStyle = '#fff0b8';
        x.beginPath();
        x.roundRect(l + 10, RY - 48, 28, 16, 3);
        x.fill();
        x.beginPath();
        x.roundRect(l + 44, RY - 48, 24, 16, 3);
        x.fill();
        x.shadowColor = '#fff8c8';
        x.shadowBlur = 16;
        x.fillStyle = '#fff8c8';
        x.beginPath();
        x.arc(n - 4, RY - 34, 5, 0, 6.283);
        x.fill();
        x.shadowBlur = 0;
        [l + 14, l + 46, l + 80, l + 104].forEach(w => wheel(w, 10));
    };
    const draw = () => {
        let g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#5b3fb0');
        g.addColorStop(0.5, '#ff6b9d');
        g.addColorStop(0.75, '#ffc08a');
        g.addColorStop(1, '#3b2a78');
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        x.fillStyle = '#fff6d0';
        x.beginPath();
        x.arc(90, 92, 26, 0, 6.283);
        x.fill();
        x.fillStyle = '#8a54b8';
        x.beginPath();
        x.moveTo(0, RY - 40);
        for (let q = 0; q <= W; q += 8) {
            x.lineTo(q, RY - 40 - 24 * (0.5 + Math.sin(q / 60) * 0.3 + Math.sin(q / 23) * 0.2));
        }
        x.lineTo(W, RY);
        x.lineTo(0, RY);
        x.fill();
        x.fillStyle = '#fff3df';
        x.fillRect(TG - 70, 38, 190, RY - 56 - 38 + 2);
        x.fillStyle = '#e0457b';
        x.beginPath();
        x.moveTo(TG - 80, 38);
        x.lineTo(TG + 40, 10);
        x.lineTo(TG + 130, 38);
        x.fill();
        x.fillStyle = '#1b1747';
        x.beginPath();
        x.arc(TG + 25, 60, 14, 0, 6.283);
        x.fill();
        x.fillStyle = '#fff3df';
        x.beginPath();
        x.arc(TG + 25, 60, 11, 0, 6.283);
        x.fill();
        x.strokeStyle = '#1b1747';
        x.lineWidth = 2;
        x.beginPath();
        x.moveTo(TG + 25, 60);
        x.lineTo(TG + 25, 52);
        x.moveTo(TG + 25, 60);
        x.lineTo(TG + 31, 62);
        x.stroke();
        for (let k = 0; k < 4; k++) {
            x.fillStyle = k % 2 ? '#ffd166' : '#7b8cff';
            x.fillRect(TG - 58 + k * 44, 84, 26, 34);
        }
        x.fillStyle = '#2b2358';
        x.fillRect(0, RY, W, 16);
        for (let q = -20 + ((-nose * 0) % 24); q < W; q += 24) {
            x.fillStyle = '#6a4e3a';
            x.fillRect(q, RY + 4, 14, 6);
        }
        x.fillStyle = '#e8e2d4';
        x.fillRect(0, RY, W, 3);
        pf.filter(q => q.t === 's').forEach(q => {
            x.fillStyle = `rgba(255,255,255,${q.l * 0.5})`;
            x.beginPath();
            x.arc(q.x, q.y, q.r, 0, 6.283);
            x.fill();
        });
        trainDraw();
        x.fillStyle = '#fff3df';
        x.fillRect(0, RY + 16, W, H - RY - 16);
        x.fillStyle = '#ffd166';
        x.fillRect(0, RY + 20, W, 5);
        x.fillStyle = '#e8d8b8';
        for (let q = 0; q < W; q += 40) {
            x.fillRect(q, RY + 26, 2, H);
        }
        const z = zw();
        x.fillStyle = 'rgba(31,209,120,.35)';
        x.fillRect(TG - z, RY + 26, z * 2, H - RY - 26);
        x.strokeStyle = '#139e5c';
        x.setLineDash([5, 4]);
        x.lineWidth = 2;
        x.strokeRect(TG - z, RY + 26, z * 2, H - RY - 30);
        x.setLineDash([]);
        x.fillStyle = '#139e5c';
        x.fillRect(TG - 1.5, RY - 76, 3, 102);
        x.fillStyle = '#139e5c';
        x.beginPath();
        x.roundRect(TG - 26, RY + 34, 52, 22, 5);
        x.fill();
        x.fillStyle = '#fff';
        x.font = '800 14px Syne,sans-serif';
        x.textAlign = 'center';
        x.fillText('STOP', TG, RY + 50);
        pf.filter(q => q.t === 'k').forEach(q => {
            x.fillStyle = `rgba(255,${180 + q.l * 70 | 0},60,${q.l})`;
            x.fillRect(q.x, q.y, 3, 3);
        });
        x.textAlign = 'left';
        if (msg) {
            x.textAlign = 'center';
            x.lineWidth = 6;
            x.strokeStyle = '#1b1747';
            fitFont(x, msg, W - 60, 34);
            x.strokeText(msg, W / 2, 60);
            x.fillStyle = '#ffd166';
            x.fillText(msg, W / 2, 60);
            x.textAlign = 'left';
        }
        if (st === 'idle' || st === 'done') {
            x.fillStyle = 'rgba(18,16,58,.55)';
            x.fillRect(0, 0, W, H);
            x.fillStyle = '#fff3df';
            x.textAlign = 'center';
            {
                const tt = st === 'done' ? 'Final score ' + score : 'Ready to stop a train?';
                fitFont(x, tt, W - 90, 26);
                x.fillText(tt, W / 2, H / 2 - 6);
            }
            x.font = '15px DM Sans,sans-serif';
            x.fillText(st === 'done' ? 'Press Play again' : 'Press Start', W / 2, H / 2 + 20);
            x.textAlign = 'left';
        }
    };
    const loop = ts => {
        const dt = Math.min(0.05, (ts - last) / 1000 || 0);
        last = ts;
        t += dt;
        if (st === 'approach' || st === 'braking') {
            nose += v * dt;
            wa += v * dt / 9;
            if (R() < dt * (6 + v / 40)) {
                pf.push({ t: 's', x: nose - 118 + 90, y: RY - 76, r: 5, l: 1 });
            }
            if (st === 'approach' && nose > TG + zw() * 3) {
                brake();
            }
            if (st === 'braking') {
                v -= A * dt;
                for (let i = 0; i < 3; i++) {
                    if (R() < 0.6) {
                        pf.push({ t: 'k', x: nose - 118 + 14 + R() * 90, y: RY - 8, vx: (R() - 0.5) * 60, vy: -30 - R() * 60, l: 0.5 });
                    }
                }
                if (v <= 0) {
                    v = 0;
                    fin();
                }
            }
        }
        pf.forEach(q => {
            q.l -= dt;
            if (q.t === 's') {
                q.x -= 10 * dt;
                q.y -= 26 * dt;
                q.r += 10 * dt;
            }
            else {
                q.x += q.vx * dt;
                q.y += q.vy * dt;
                q.vy += 200 * dt;
            }
        });
        pf = pf.filter(q => q.l > 0);
        draw();
        if (st !== 'idle' && st !== 'done') {
            raf = requestAnimationFrame(loop);
        }
    };
    function brake() {
        if (st !== 'approach') {
            return;
        }
        st = 'braking';
        sfx('brakes');
        $('#brk').disabled = true;
    }
    function fin() {
        st = 'stopped';
        const e = Math.abs(nose - TG), z = zw();
        let p = 0, m = 'Missed the platform';
        if (e < 3) {
            p = 100;
            m = 'Perfect stop!';
        }
        else if (e < z) {
            p = Math.round(80 - e / z * 40);
            m = 'Good stop';
        }
        else if (e < z * 2) {
            p = 20;
            m = nose < TG ? 'Stopped short' : 'Overshot a little';
        }
        score += p;
        round++;
        $('#sc').textContent = score;
        $('#rd').textContent = round;
        msg = m + ' +' + p;
        sfx(p >= 60 ? 'chime' : 'hit');
        if (round >= 5) {
            nt = setTimeout(() => {
                st = 'done';
                msg = '';
                if (score > best.stopper) {
                    best.stopper = score;
                    $('#bs').textContent = score;
                }
                sfx('win');
                $('#play').textContent = 'Play again';
                draw();
            }, 1300);
        }
        else {
            nt = setTimeout(next, 1400);
        }
    }
    function next() {
        msg = '';
        st = 'approach';
        nose = -300;
        v = 250 + round * 55;
        pf = [];
        $('#brk').disabled = false;
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
    }
    $('#play').onclick = () => {
        clearTimeout(nt);
        round = 0;
        score = 0;
        $('#sc').textContent = 0;
        $('#rd').textContent = 0;
        next();
    };
    $('#brk').onclick = brake;
    cv.addEventListener('pointerdown', brake);
    const kd = e => {
        if (e.code === 'Space' && st === 'approach') {
            e.preventDefault();
            brake();
        }
    };
    document.addEventListener('keydown', kd);
    stopGame = () => {
        st = 'idle';
        cancelAnimationFrame(raf);
        clearTimeout(nt);
        document.removeEventListener('keydown', kd);
    };
    nose = TG - 200;
    draw();
}

function stamps() {
    const sy = [['◆', '#e0457b'], ['●', '#e89a00'], ['▲', '#139e92'], ['■', '#4a5bf0'], ['✚', '#e8641c'], ['✦', '#5aa81c']];
    $('#game').innerHTML = `<p style="text-align:center">Flip two passport stamps at a time and match all six pairs in as few moves as you can.</p>` +
        `<div class="pp"><h5>PASSPORT · JEREMY LINE</h5><div class="mg" id="mg"></div><div class="ap" id="ap">APPROVED</div>` +
        `</div>${GH('Moves', 'Pairs: <b id="pr">0</b>/6')}<p style="text-align:center"><button class="btn p" id="play">Shuffle</button>` +
        `</p>`;
    $('#bs').textContent = best.stamps || '-';
    let deck, first = null, lock = false, mv = 0, pr = 0, tm = [];
    const build = () => {
        tm.forEach(clearTimeout);
        deck = [...sy, ...sy].sort(() => R() - 0.5);
        first = null;
        lock = false;
        mv = 0;
        pr = 0;
        $('#sc').textContent = 0;
        $('#pr').textContent = 0;
        $('#ap').classList.remove('on');
        $('#mg').innerHTML = deck.map((_, i) => `<button class="mc" data-i="${i}" aria-label="Stamp ${i + 1}"><span class="in"><span class="bk"></span>` +
            `<span class="ft"></span></span></button>`).join('');
        document.querySelectorAll('.mc').forEach(c => c.onclick = () => flip(c));
    };
    const flip = c => {
        const i = +c.dataset.i;
        if (lock || c.classList.contains('up') || c.classList.contains('dn')) {
            return;
        }
        c.classList.add('up');
        c.style.setProperty('--c', deck[i][1]);
        c.querySelector('.ft').textContent = deck[i][0];
        c.style.setProperty('--r', (R() * 14 - 7) + 'deg');
        sfx('flip');
        if (first === null) {
            first = i;
            return;
        }
        mv++;
        $('#sc').textContent = mv;
        const a = first, ca = document.querySelectorAll('.mc')[a];
        first = null;
        if (deck[a][0] === deck[i][0]) {
            ca.classList.replace('up', 'dn');
            c.classList.replace('up', 'dn');
            pr++;
            $('#pr').textContent = pr;
            sfx('coin');
            if (pr === 6) {
                sfx('win');
                $('#ap').classList.add('on');
                if (!best.stamps || mv < best.stamps) {
                    best.stamps = mv;
                    $('#bs').textContent = mv;
                }
            }
        }
        else {
            lock = true;
            tm.push(setTimeout(() => {
                ca.classList.remove('up');
                c.classList.remove('up');
                lock = false;
            }, 800));
        }
    };
    $('#play').onclick = build;
    build();
    stopGame = () => tm.forEach(clearTimeout);
}

/* ===== Passport, toasts, extras ===== */
const store = { get: k => {
        try {
            return localStorage.getItem(k);
        }
        catch (e) {
            return null;
        }
    }, set: (k, v) => {
        try {
            localStorage.setItem(k, v);
        }
        catch (e) { }
    } };
let stamped = new Set();
try {
    stamped = new Set(JSON.parse(store.get('alStamps') || '[]'));
}

catch (e) { }
const toast = m => {
    const t = $('#toast');
    t.textContent = m;
    t.classList.add('show');
    clearTimeout(toast.h);
    toast.h = setTimeout(() => t.classList.remove('show'), 3200);
};

const updStamps = () => document.querySelectorAll('.strip .sd').forEach(b => b.classList.toggle('vis', stamped.has(b.dataset.go)));
updStamps();

function confetti() {
    const W = fx.width = innerWidth;
    const H = fx.height = innerHeight;
    const C = ['#ffd166', '#ff6b9d', '#7b8cff', '#1fd1c4', '#ff9f43'];
    const ps = Array.from({ length: 110 }, () => ({
        x: R() * W,
        y: -20 - R() * H * 0.5,
        v: 120 + R() * 220,
        w: 6 + R() * 8,
        h: 4 + R() * 6,
        c: C[R() * 5 | 0],
        a: R() * 6,
        s: (R() - 0.5) * 8
    }));
    const t0 = performance.now();
    const f = now => {
        const e = (now - t0) / 1000;
        F.clearRect(0, 0, W, H);
        ps.forEach(q => {
            q.y += q.v / 60;
            q.a += q.s / 60;
            q.x += Math.sin(q.a) * 1.2;
            F.save();
            F.translate(q.x, q.y);
            F.rotate(q.a);
            F.fillStyle = q.c;
            F.fillRect(-q.w / 2, -q.h / 2, q.w, q.h);
            F.restore();
        });
        if (e < 3.2) {
            requestAnimationFrame(f);
        }
        else {
            F.clearRect(0, 0, W, H);
        }
    };
    requestAnimationFrame(f);
}

function stamp(k) {
    if (k === 'home' || stamped.has(k)) {
        return;
    }
    stamped.add(k);
    store.set('alStamps', JSON.stringify([...stamped]));
    updStamps();
    toast('Passport stamped: ' + ST[k].n + ' (' + stamped.size + '/5)');
    sfx('coin');
    if (stamped.size === 5) {
        setTimeout(() => {
            toast('All five stations visited! Golden ticket unlocked');
            sfx('win');
            if (!RM) {
                confetti();
            }
        }, 3400);
    }
}

const _ab = PG.about;
PG.about = () => _ab().replace('<div class="bc"></div>', `<small>PASSPORT STAMPS</small><div class="stm">${ORDER.slice(1).map(k => `<span class="${stamped.has(k) ? 'on' : ''}" title="${ST[k].n}">${ST[k].s[0]}</span>`).join('')}</div>${stamped.size === 5 ? '<span class="gold">★ GOLDEN TICKET</span>' : ''}<div class="bc">` +
    `</div>`);
$('#trn').addEventListener('click', () => {
    sfx('horn');
    const ms = $('#ms');
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const pt = routeEl.getPointAtLength(RL * trainF);
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('class', 'puff');
            c.setAttribute('cx', pt.x + 8);
            c.setAttribute('cy', pt.y - 18);
            c.setAttribute('r', 6);
            ms.appendChild(c);
            setTimeout(() => c.remove(), 1100);
        }, i * 110);
    }
});

document.addEventListener('visibilitychange', () => {
    if (ac && musicOn) {
        master.gain.value = document.hidden ? 0 : SOUND_VOLUME;
    }
});

/* ===== Realistic train audio ===== */
function bus() {
    if (ac.__b) {
        return ac.__b;
    }
    const dl = ac.createDelay(0.6);
    const fb = ac.createGain();
    const wet = ac.createGain();
    const inp = ac.createGain();
    const lf = ac.createBiquadFilter();
    lf.type = 'lowpass';
    lf.frequency.value = 2500;
    dl.delayTime.value = 0.14;
    fb.gain.value = 0.33;
    wet.gain.value = 0.5;
    inp.connect(master);
    inp.connect(dl);
    dl.connect(lf);
    lf.connect(fb);
    fb.connect(dl);
    lf.connect(wet);
    wet.connect(master);
    const N = 40, re = new Float32Array(N + 1), im = new Float32Array(N + 1);
    for (let n = 1; n <= N; n++) {
        const f = n * 300;
        im[n] = (1 + 1.6 * Math.exp(-(((f - 900) / 500) ** 2)) + 0.8 * Math.exp(-(((f - 2200) / 700) ** 2))) / Math.pow(n, 0.9);
    }
    ac.__b = { inp, wave: ac.createPeriodicWave(re, im) };
    return ac.__b;
}

function hornBlast(t, dur, v) {
    const B = bus(), l = ac.createBiquadFilter();
    l.type = 'lowpass';
    l.frequency.value = 3800;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.05);
    g.gain.linearRampToValueAtTime(v * 1.08, t + dur * 0.5);
    g.gain.setValueAtTime(v, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.4);
    l.connect(g);
    g.connect(B.inp);
    [233.1, 293.7, 349.2, 466.2].forEach((f, i) => [-0.5, 0.5].forEach(d => {
        const o = ac.createOscillator();
        o.setPeriodicWave(B.wave);
        o.frequency.setValueAtTime(f * 0.94 + d, t);
        o.frequency.exponentialRampToValueAtTime(f + d, t + 0.12);
        o.frequency.setValueAtTime(f + d, t + dur);
        o.frequency.exponentialRampToValueAtTime(f * 0.985 + d, t + dur + 0.4);
        const og = ac.createGain();
        og.gain.value = 0.22 - i * 0.02;
        o.connect(og);
        og.connect(l);
        o.start(t);
        o.stop(t + dur + 0.45);
    }));
    const sr = ac.createBufferSource();
    const bp = ac.createBiquadFilter();
    const ng = ac.createGain();
    sr.buffer = nb;
    sr.loop = true;
    bp.type = 'bandpass';
    bp.frequency.value = 1800;
    bp.Q.value = 0.7;
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime(v * 0.5, t + 0.03);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    sr.connect(bp);
    bp.connect(ng);
    ng.connect(B.inp);
    sr.start(t);
    sr.stop(t + 0.35);
}

function nzb(t, d, v, fc, q) {
    const s = ac.createBufferSource();
    const b = ac.createBiquadFilter();
    const g = ac.createGain();
    s.buffer = nb;
    b.type = 'bandpass';
    b.frequency.value = fc;
    b.Q.value = q;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(b);
    b.connect(g);
    g.connect(master);
    s.start(t, R() * 0.5);
    s.stop(t + d + 0.02);
}

const hit = (t, v) => {
    nzb(t, 0.05, v, 2200, 1.3);
    nzb(t, 0.14, v * 0.8, 350, 1.2);
    sw(120, 58, t, 0.13, 'sine', v * 0.9);
};

function clatter(t, dur, r0, r1, v) {
    let x = t;
    while (x < t + dur) {
        hit(x, v);
        hit(x + 0.07, v * 0.75);
        x += 1 / (r0 + (r1 - r0) * ((x - t) / dur));
    }
}

function rumble(t, dur, v) {
    const s = ac.createBufferSource();
    const l = ac.createBiquadFilter();
    const g = ac.createGain();
    const lf = ac.createOscillator();
    const lg = ac.createGain();
    s.buffer = nb;
    s.loop = true;
    l.type = 'lowpass';
    l.frequency.value = 170;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + dur * 0.35);
    g.gain.setValueAtTime(v, t + dur * 0.65);
    g.gain.linearRampToValueAtTime(0, t + dur);
    lf.frequency.value = 9;
    lg.gain.value = v * 0.35;
    lf.connect(lg);
    lg.connect(g.gain);
    s.connect(l);
    l.connect(g);
    g.connect(master);
    s.start(t);
    s.stop(t + dur);
    lf.start(t);
    lf.stop(t + dur);
}

function hiss(t, d, v) {
    const s = ac.createBufferSource();
    const h = ac.createBiquadFilter();
    const b = ac.createBiquadFilter();
    const g = ac.createGain();
    s.buffer = nb;
    s.loop = true;
    h.type = 'highpass';
    h.frequency.value = 2200;
    b.type = 'lowpass';
    b.frequency.value = 9000;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(h);
    h.connect(b);
    b.connect(g);
    g.connect(master);
    s.start(t);
    s.stop(t + d + 0.05);
}

function squeal(t, d, v) {
    const g = ac.createGain(), b = ac.createBiquadFilter();
    b.type = 'bandpass';
    b.frequency.value = 2000;
    b.Q.value = 6;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    b.connect(g);
    g.connect(master);
    [2300, 2310, 3400].forEach((f, i) => {
        const o = ac.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f, t);
        o.frequency.exponentialRampToValueAtTime(f * 0.66, t + d);
        const og = ac.createGain();
        og.gain.value = i < 2 ? 1 : 0.4;
        o.connect(og);
        og.connect(b);
        o.start(t);
        o.stop(t + d + 0.05);
    });
}

function cwhistle(t, dur, v) {
    const o = ac.createOscillator();
    const lf = ac.createOscillator();
    const lg = ac.createGain();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.value = 2650;
    lf.frequency.value = 38;
    lg.gain.value = 320;
    lf.connect(lg);
    lg.connect(o.frequency);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.02);
    g.gain.setValueAtTime(v, t + dur - 0.05);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur);
    lf.start(t);
    lf.stop(t + dur);
    nzb(t, dur, v * 0.5, 3000, 1.2);
}

function trainSfx(k) {
    const t = ac.currentTime + 0.02;
    if (k === 'horn') {
        hornBlast(t, 0.6, 0.5);
    }
    if (k === 'brakes') {
        squeal(t, 0.7, 0.05);
        hiss(t + 0.25, 0.9, 0.15);
    }
    if (k === 'travel') {
        hornBlast(t, 0.55, 0.5);
        hornBlast(t + 0.78, 0.28, 0.45);
        rumble(t + 0.2, 2, 0.36);
        clatter(t + 0.3, 1.4, 2.2, 6.2, 0.3);
        squeal(t + 1.3, 0.5, 0.05);
        hiss(t + 1.42, 0.9, 0.16);
    }
    if (k === 'depart') {
        cwhistle(t, 0.5, 0.22);
        hornBlast(t + 0.75, 1, 0.55);
        hornBlast(t + 2, 0.45, 0.5);
        rumble(t + 1, 3.6, 0.38);
        clatter(t + 1.4, 3, 1.5, 6.5, 0.3);
    }
}

/* ===== Train passes the camera (All aboard transition) ===== */
function trainWipe(cb) {
    const cv = $('#tw');
    const X = cv.getContext('2d');
    const W = cv.width = innerWidth;
    const H = cv.height = innerHeight;
    const cw = W * 0.78;
    const gap = W * 0.05;
    const lw = W * 0.9;
    const L = lw + 3 * (cw + gap);
    const D = 1750;
    const t0 = performance.now();
    let done = false;
    const car = (x0, w, loco, k) => {
        if (x0 > W || x0 + w < 0) {
            return;
        }
        const top = H * 0.07, h = H - top;
        let g = X.createLinearGradient(0, top, 0, H);
        g.addColorStop(0, '#2f2878');
        g.addColorStop(0.6, '#1b1747');
        g.addColorStop(1, '#0f0c2c');
        X.fillStyle = g;
        X.beginPath();
        if (loco) {
            X.moveTo(x0, top);
            X.lineTo(x0 + w * 0.86, top);
            X.lineTo(x0 + w, top + h * 0.3);
            X.lineTo(x0 + w, H + 10);
            X.lineTo(x0, H + 10);
        }
        else {
            X.rect(x0, top, w, H + 10 - top);
        }
        X.closePath();
        X.fill();
        X.fillStyle = 'rgba(255,255,255,.07)';
        X.fillRect(x0, top, w, h * 0.05);
        const wn = loco ? 5 : 8;
        const ww = w * (loco ? 0.11 : 0.085);
        const sp = (w * (loco ? 0.78 : 0.96) - wn * ww) / (wn - 1);
        const wy = top + h * 0.17;
        const wh = h * 0.2;
        for (let i = 0; i < wn; i++) {
            const wx = x0 + w * 0.03 + i * (ww + sp);
            if (loco && wx + ww > x0 + w * 0.8) {
                continue;
            }
            const gg = X.createLinearGradient(0, wy, 0, wy + wh);
            gg.addColorStop(0, '#fff0b8');
            gg.addColorStop(1, '#ffb865');
            X.fillStyle = gg;
            X.shadowColor = '#ffcf80';
            X.shadowBlur = 26;
            X.beginPath();
            X.roundRect(wx, wy, ww, wh, ww * 0.18);
            X.fill();
            X.shadowBlur = 0;
            if ((i * 7 + k * 3) % 5 !== 0) {
                X.fillStyle = 'rgba(30,20,60,.8)';
                X.beginPath();
                X.arc(wx + ww * 0.5, wy + wh * 0.62, ww * 0.17, 0, 6.283);
                X.fill();
                X.beginPath();
                X.ellipse(wx + ww * 0.5, wy + wh + 2, ww * 0.3, wh * 0.3, 0, Math.PI, 0);
                X.fill();
            }
        }
        X.fillStyle = '#ff6b9d';
        X.fillRect(x0, top + h * 0.62, w, h * 0.05);
        X.fillStyle = '#ffd166';
        X.fillRect(x0, top + h * 0.68, w, h * 0.012);
        if (!loco) {
            X.fillStyle = 'rgba(8,6,28,.55)';
            X.fillRect(x0 + w * 0.46, top + h * 0.12, w * 0.07, h * 0.62);
        }
        X.fillStyle = '#08061c';
        X.fillRect(x0, H - h * 0.1, w, h * 0.12);
        if (loco) {
            X.save();
            X.globalCompositeOperation = 'lighter';
            const hx = x0 + w;
            const hy = top + h * 0.55;
            const gl = X.createRadialGradient(hx, hy, 0, hx, hy, H * 0.7);
            gl.addColorStop(0, 'rgba(255,248,200,.9)');
            gl.addColorStop(1, 'rgba(255,248,200,0)');
            X.fillStyle = gl;
            X.fillRect(hx - H * 0.7, hy - H * 0.7, H * 1.4, H * 1.4);
            X.restore();
        }
    };
    const f = now => {
        const p = Math.min(1, (now - t0) / D), e = p * p * (3 - 2 * p), fx = (L + W) * e;
        X.clearRect(0, 0, W, H);
        X.save();
        X.translate(0, (Math.random() - 0.5) * 3 * Math.sin(Math.PI * p));
        let x = fx;
        car(x - lw, lw, true, 0);
        x -= lw + gap;
        for (let i = 0; i < 3; i++) {
            car(x - cw, cw, false, i + 1);
            x -= cw + gap;
        }
        X.restore();
        X.fillStyle = 'rgba(255,243,223,.12)';
        for (let i = 0; i < 14; i++) {
            const y = (i * 79 + 30) % H;
            X.fillRect(0, y, W, 2);
        }
        if (!done && p >= 0.5) {
            done = true;
            cb();
        }
        if (p < 1) {
            requestAnimationFrame(f);
        }
        else {
            X.clearRect(0, 0, W, H);
        }
    };
    requestAnimationFrame(f);
}

/* ===== Map upgrade ===== */
(function () {
    const svg = $('#ms');
    const ns = 'http://www.w3.org/2000/svg';
    const el = (t, a, p) => {
        const e = document.createElementNS(ns, t);
        for (const k in a)
            e.setAttribute(k, a[k]);
        (p || svg).appendChild(e);
        return e;
    };
    const casing = routeEl.previousSibling;
    const under = document.createElementNS(ns, 'g');
    svg.insertBefore(under, casing);
    // river shimmer
    el('path', {
        d: 'M-20 110 C200 170 420 50 980 140',
        stroke: '#fff',
        fill: 'none',
        'stroke-width': 4,
        opacity: 0.55,
        'stroke-dasharray': '8 36',
        'stroke-linecap': 'round',
        class: 'flow'
    }, under);
    // side lines
    const SL = [['M-10 150 H250 Q310 150 310 210 V250', '#1fd1c4'], ['M970 470 H690 Q626 470 626 410 V372', '#ff9f43']];
    const sp = [];
    SL.forEach(([d, c]) => {
        el('path', { d, fill: 'none', stroke: '#1b1747', 'stroke-width': 16, 'stroke-linecap': 'round' }, under);
        const pa = el('path', { d, fill: 'none', stroke: c, 'stroke-width': 9, 'stroke-linecap': 'round' }, under);
        sp.push({ pa, L: pa.getTotalLength(), c });
    });
    // city blocks (isometric), kept clear of the lines
    let sd = 11;
    const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647, rp = [];
    for (let l = 0; l < RL; l += 18) {
        const q = routeEl.getPointAtLength(l);
        rp.push([q.x, q.y]);
    }
    SL.forEach((_, i) => {
        for (let l = 0; l < sp[i].L; l += 18) {
            const q = sp[i].pa.getPointAtLength(l);
            rp.push([q.x, q.y]);
        }
    });
    const bl = [];
    for (let x = 50; x < 930; x += 52) {
        for (let y = 190; y < 500; y += 50) {
            const bx = x + rn() * 18, by = y + rn() * 14;
            if (by < 190 || (bx < 330 && by < 130)) {
                continue;
            }
            if (rp.some(q => Math.hypot(q[0] - bx - 15, q[1] - by - 8) < 50)) {
                continue;
            }
            if (rn() < 0.42) {
                continue;
            }
            bl.push([bx, by, 24 + rn() * 18, 14 + rn() * 10, 10 + rn() * 30, rn()]);
        }
    }
    bl.sort((a, b) => a[1] - b[1]).forEach(([x, y, w, h, ht, r]) => {
        const top = ['#ffd9b0', '#ffc9a8', '#f5e0c8', '#ffe8c0'][r * 4 | 0];
        const fr = ['#e0b894', '#e8a888', '#d8c4a8', '#e6c898'][r * 4 | 0];
        el('ellipse', { cx: x + w / 2 + 6, cy: y + h + 3, rx: w * 0.7, ry: h * 0.35, fill: '#1b1747', opacity: 0.12 }, under);
        el('rect', { x, y: y + h - ht, width: w, height: ht, fill: fr, stroke: '#1b1747', 'stroke-width': 1.5 }, under);
        el('rect', { x, y: y - ht, width: w, height: h, fill: top, stroke: '#1b1747', 'stroke-width': 1.5 }, under);
        if (ht > 20) {
            for (let k = 4; k < w - 4; k += 8) {
                el('rect', { x: x + k, y: y + h - ht + 4, width: 4, height: 5, fill: '#6a6396', opacity: 0.6 }, under);
            }
        }
    });
    [[310, 250], [633, 372]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 9, fill: '#fff', stroke: '#1b1747', 'stroke-width': 4 }, under));
    // route-preview highlight + side trains + birds + compass + legend
    const hl = el('path', {
        d: routeEl.getAttribute('d'),
        fill: 'none',
        stroke: '#fff7b0',
        'stroke-width': 16,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        opacity: 0,
        style: 'transition:opacity .25s;filter:drop-shadow(0 0 6px #ffd166)'
    });
    svg.insertBefore(hl, routeEl.nextSibling);
    const mkTr = c => {
        const g = el('g', {});
        el('rect', { x: -14, y: -6, width: 28, height: 12, rx: 4, fill: c, stroke: '#1b1747', 'stroke-width': 2.5 }, g);
        el('rect', { x: -8, y: -3, width: 5, height: 5, fill: '#1b1747' }, g);
        el('rect', { x: 2, y: -3, width: 5, height: 5, fill: '#1b1747' }, g);
        return g;
    };
    sp.forEach(o => o.g = mkTr(o.c));
    const birds = [0, 1, 2].map(i => el('path', {
        d: 'M-7 0q7-8 14 0q7-8 14 0',
        fill: 'none',
        stroke: '#1b1747',
        'stroke-width': 2.2,
        'stroke-linecap': 'round'
    }));
    const cg = el('g', { transform: 'translate(905 72)' });
    el('circle', { r: 23, fill: '#fff3df', stroke: '#1b1747', 'stroke-width': 3 }, cg);
    el('path', { d: 'M0 -17 L7 4 L0 0 L-7 4 Z', fill: '#ff6b9d' }, cg);
    el('text', {
        y: 19,
        'text-anchor': 'middle',
        'font-family': 'Space Mono,monospace',
        'font-weight': 700,
        'font-size': 10,
        fill: '#1b1747'
    }, cg).textContent = 'N';
    [['#ff6b9d', 'JEREMY LINE'], ['#1fd1c4', 'WEST BRANCH'], ['#ff9f43', 'HARBOR LINE']].forEach(([c, t], i) => {
        const g = el('g', { transform: `translate(${40 + i * 128} 490)` });
        el('rect', { width: 26, height: 7, rx: 3.5, fill: c, stroke: '#1b1747', 'stroke-width': 2 }, g);
        el('text', {
            x: 34,
            y: 8,
            'font-family': 'Space Mono,monospace',
            'font-size': 10.5,
            'font-weight': 700,
            fill: '#1b1747'
        }, g).textContent = t;
    });
    const place = (g, pa, L, f) => {
        const q = pa.getPointAtLength(L * f);
        const a = pa.getPointAtLength(Math.max(0, L * f - 3));
        const b = pa.getPointAtLength(Math.min(L, L * f + 3));
        g.setAttribute('transform', `translate(${q.x} ${q.y}) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI})`);
    };
    const loop = now => {
        const t = now / 1000;
        if (!document.body.classList.contains('pg') && !document.body.classList.contains('title')) {
            sp.forEach((o, i) => place(o.g, o.pa, o.L, RM ? 0.5 : Math.sin(t * 0.32 + i * 2.4) * 0.5 + 0.5));
            birds.forEach((b, i) => {
                const x = ((t * 38 + i * 330) % 1100) - 100, y = 95 + i * 34 + Math.sin(t * 1.6 + i) * 10;
                b.setAttribute('transform', `translate(${x} ${y})`);
            });
        }
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    // station icons, tooltips, route preview, tilt
    const ICO = {
        home: "<path d='M4 11l8-7 8 7v9H4z'/>",
        about: "<circle cx='12' cy='8' r='3.5'/><path d='M5 20c0-4 3-6 7-6s7 2 7 6'/>",
        lib: "<rect x='4' y='5' width='16' height='14' rx='2'/><path d='M4 16l5-5 4 4 3-3 4 4'/><circle cx='15' cy='9.5' r='1.4'/>",
        potion: "<circle cx='12' cy='12' r='3.2'/><path d='M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1'/>",
        arcade: "<rect x='3' y='8' width='18' height='9' rx='4.5'/><path d='M8 10.5v4M6 12.5h4'/><circle cx='15.5' cy='11.5' r='1'/><circle cx='18' cy='13.5' r='1'/>",
        contact: "<rect x='3' y='6' width='18' height='13' rx='2'/><path d='M3.5 7.5l8.5 6 8.5-6'/>"
    };
    const BL = {
        about: 'Who I am',
        lib: CFG.projects.length + ' projects',
        potion: CFG.skills.length + ' skills',
        arcade: '3 mini games',
        contact: 'Say hello'
    };
    document.querySelectorAll('#mapc .st').forEach(b => {
        const k = b.dataset.k || 'home';
        const i = b.querySelector('i');
        const lab = b.querySelector('b');
        const nm = lab.textContent;
        i.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#1b1747" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`;
        if (!b.dataset.k) {
            return;
        }
        lab.innerHTML = `${nm}<small></small>`;
        const sm = lab.querySelector('small');
        const on = () => {
            sm.textContent = BL[k] + ' · Platform ' + ST[k].pf + (stamped.has(k) ? ' · ✓ stamped' : '');
            const a = Math.min(trainF, ST[k].f) * RL, c = Math.max(trainF, ST[k].f) * RL;
            if (c > a) {
                hl.setAttribute('stroke-dasharray', `0 ${a} ${c - a} ${RL * 2}`);
                hl.setAttribute('opacity', 0.95);
            }
        };
        const off = () => hl.setAttribute('opacity', 0);
        b.addEventListener('mouseenter', on);
        b.addEventListener('focus', on);
        b.addEventListener('mouseleave', off);
        b.addEventListener('blur', off);
    });
    const mc = $('#mapc');
    if (!RM) {
        $('#hero').addEventListener('pointermove', e => {
            const r = mc.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            mc.style.setProperty('--ry', (x * 5) + 'deg');
            mc.style.setProperty('--rx', (-y * 4) + 'deg');
        });
    }
    $('#hero').addEventListener('pointerleave', () => {
        mc.style.setProperty('--ry', '0deg');
        mc.style.setProperty('--rx', '0deg');
    });
})();

/* ===== Map label layout: no overlaps, nothing clipped ===== */
function layoutLabels() {
    const mc = $('#mapc'), mw = mc.clientWidth;
    if (!mw) {
        return;
    }
    const u = 960 / mw, sts = [...mc.querySelectorAll('.st')];
    const obst = [[30, 34, 390, 98], [868, 44, 942, 102], [34, 482, 406, 510]];
    const placed = [];
    const rp = [];
    for (let l = 0; l < RL; l += 14) {
        const q = routeEl.getPointAtLength(l);
        rp.push([q.x, q.y]);
    }
    const ov = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
    const circ = sts.map(b => {
        const d = b.querySelector('i').offsetWidth * u;
        const cx = parseFloat(b.style.left) * 9.6;
        const cy = parseFloat(b.style.top) * 5.2;
        return { b, cx, cy, d, r: [cx - d / 2, cy - d / 2, cx + d / 2, cy + d / 2] };
    });
    circ.forEach(c => placed.push(c.r));
    circ.forEach(c => {
        const lab = c.b.querySelector('b');
        if (!lab || !lab.offsetWidth) {
            return;
        }
        const w = lab.offsetWidth * u;
        const h = lab.offsetHeight * u;
        const g = 7 * u;
        const cand = {
            b: [c.cx - w / 2, c.cy + c.d / 2 + g],
            t: [c.cx - w / 2, c.cy - c.d / 2 - g - h],
            r: [c.cx + c.d / 2 + g, c.cy - h / 2],
            l: [c.cx - c.d / 2 - g - w, c.cy - h / 2],
            br: [c.cx + c.d / 2 - w, c.cy + c.d / 2 + g],
            bl: [c.cx - c.d / 2, c.cy + c.d / 2 + g],
            tr: [c.cx + c.d / 2 - w, c.cy - c.d / 2 - g - h],
            tl: [c.cx - c.d / 2, c.cy - c.d / 2 - g - h],
            tr2: [c.cx + c.d / 2 - w, c.cy - c.d / 2 - g * 3.4 - h],
            tl2: [c.cx - c.d / 2, c.cy - c.d / 2 - g * 3.4 - h],
            br2: [c.cx + c.d / 2 - w, c.cy + c.d / 2 + g * 3.4],
            bl2: [c.cx - c.d / 2, c.cy + c.d / 2 + g * 3.4]
        };
        let best = null, bs = 1e9;
        ['b', 't', 'r', 'l', 'br', 'bl', 'tr', 'tl', 'tr2', 'tl2', 'br2', 'bl2'].forEach((sd, k) => {
            const q = cand[sd], r = [q[0], q[1], q[0] + w, q[1] + h];
            let pen = k * 2;
            if (r[0] < 8) {
                pen += (8 - r[0]) * 60;
            }
            if (r[2] > 952) {
                pen += (r[2] - 952) * 60;
            }
            if (r[1] < 8) {
                pen += (8 - r[1]) * 60;
            }
            if (r[3] > 512) {
                pen += (r[3] - 512) * 60;
            }
            placed.forEach(o => {
                if (o !== c.r) {
                    pen += ov(r, o) * 3;
                }
            });
            obst.forEach(o => pen += ov(r, o) * 3);
            rp.forEach(q => {
                if (q[0] > r[0] && q[0] < r[2] && q[1] > r[1] && q[1] < r[3]) {
                    pen += 18;
                }
            });
            if (pen < bs) {
                bs = pen;
                best = [sd, r];
            }
        });
        c.b.classList.remove('t', 'b', 'r', 'l', 'br', 'bl', 'tr', 'tl', 'tr2', 'tl2', 'br2', 'bl2');
        c.b.classList.add(best[0]);
        placed.push(best[1]);
    });
}

let _lt;
const relayout = () => {
    clearTimeout(_lt);
    _lt = setTimeout(layoutLabels, 60);
};

addEventListener('resize', relayout);
requestAnimationFrame(() => requestAnimationFrame(layoutLabels));
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layoutLabels);
}
