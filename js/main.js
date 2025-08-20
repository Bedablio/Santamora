(() => {
    const loader = document.getElementById('app-loader');
    if (!loader) return;

    // mostra imediatamente e trava o scroll
    loader.hidden = false;
    document.documentElement.classList.add('lock');
    loader.setAttribute('aria-hidden','false');

    const hide = () => {
    if (loader.dataset.done) return;           // garante uma vez só
    loader.dataset.done = '1';
    loader.classList.add('is-fading');         // usa seu fade do CSS
    document.documentElement.classList.remove('lock');
    loader.setAttribute('aria-hidden','true');
    setTimeout(() => { loader.hidden = true; }, 350);
    };

    // sai quando a página termina de carregar / ou volta do histórico
    window.addEventListener('load', hide, { once:true });
    window.addEventListener('pageshow', e => { if (e.persisted) hide(); }, { once:true });

    // fallback de segurança
    setTimeout(hide, 5000);

    // opcional: permite “pular” clicando no overlay
    loader.addEventListener('click', hide, { once:true });
})();

// Util: on DOM ready
const ready = (fn) => (document.readyState !== 'loading') ? fn() : document.addEventListener('DOMContentLoaded', fn);

ready(() => {
    // Year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Hero slider (auto + dots)
    const slides = Array.from(document.querySelectorAll('#hero-slides .slide'));
    const dotsWrap = document.getElementById('hero-dots');
    let i = 0, timer;
    const makeDots = () => {
    slides.forEach((_, idx) => {
        const b = document.createElement('button');
        b.className = 'dot hero-button' + (idx === 0 ? ' active' : '');
        b.setAttribute('aria-label', 'Slide ' + (idx+1));
        b.addEventListener('click', () => go(idx));
        dotsWrap.appendChild(b);
    });
    };
    const go = (n) => {
    slides[i].classList.remove('active');
    slides[n].classList.add('active');
    dotsWrap.children[i]?.classList.remove('active');
    dotsWrap.children[n]?.classList.add('active');
    i = n;
    };
    const next = () => go((i + 1) % slides.length);
    const start = () => timer = setInterval(next, 4500);
    const stop = () => timer && clearInterval(timer);
    makeDots(); start();
    document.getElementById('hero-slides').addEventListener('mouseenter', stop);
    document.getElementById('hero-slides').addEventListener('mouseleave', start);

    // Auto-scroll suave que PAUSA quando o usuário interage
    const track = document.getElementById('produtos-track');
    let rafId, dir = 1, running = false;

    const atEnd = () => track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;

    function tick(){
    if(!running) return;
    const max = track.scrollWidth - track.clientWidth;
    track.scrollLeft = Math.max(0, Math.min(max, track.scrollLeft + dir));
    if (track.scrollLeft <= 0 || atEnd()) dir *= -1;
    rafId = requestAnimationFrame(tick);
    }
    function startAuto(){
    if (!matchMedia('(pointer:fine)').matches) return; // só desktop/mouse
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (running) return;
    running = true;
    rafId && cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
    }
    function stopAuto(){ running = false; rafId && cancelAnimationFrame(rafId); }

    startAuto();
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);
    track.addEventListener('pointerdown', stopAuto);
    track.addEventListener('touchstart', stopAuto, {passive:true});

    // Lightbox for gallery
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbClose = document.getElementById('lightbox-close');
    document.getElementById('masonry').addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;
    lbImg.src = img.dataset.full || img.src;
    lb.showModal();
    });
    lbClose.addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });

    // Reveal on scroll (simple)
    const revealEls = document.querySelectorAll('.product, .quote, .hi, .about .card, .hero-media');
    const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
        if(ent.isIntersecting){
        ent.target.animate([
            { opacity:0, transform:'translateY(12px)' },
            { opacity:1, transform:'translateY(0)' }
        ], { duration: 500, easing:'ease-out', fill:'forwards' });
        io.unobserve(ent.target);
        }
    });
    }, { threshold: .12 });
    revealEls.forEach(el => io.observe(el));

    // To top button
    const toTop = document.getElementById('toTop');
    window.addEventListener('scroll', () => {
    const show = window.scrollY > 600;
    toTop.style.opacity = show ? 1 : 0;
    toTop.style.pointerEvents = show ? 'auto' : 'none';
    });
    toTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

    /* === Palavra com efeito de digitação + rotação === */
    const rot = document.getElementById('rotating-word');
    if (rot){
    const words = ['memórias', 'carinho', 'amor', 'celebrações', 'sabores'];
    typeWords(rot, words, 85, 2500);
    }
    function typeWords(el, words, speed=90, pause=1200){
    let i = 0, j = 0, del = false;
    (function loop(){
        const w = words[i];
        el.textContent = del ? w.slice(0, --j) : w.slice(0, ++j);
        if (!del && j === w.length){ del = true; return setTimeout(loop, pause); }
        if (del && j === 0){ del = false; i = (i+1) % words.length; }
        setTimeout(loop, del ? 45 : speed);
    })();
    }

    // Mobile drawer + acessibilidade
    const hamb = document.getElementById('hamb');
    const drawer = document.getElementById('drawer');
    const mainEl = document.querySelector('main');
    const footEl = document.querySelector('footer');

    function setDrawer(open){
    drawer.classList.toggle('hidden', !open);
    hamb.setAttribute('aria-expanded', String(open));
    hamb.classList.toggle('is-open', open);
    // isola foco
    if (open){ mainEl?.setAttribute('inert',''); footEl?.setAttribute('inert',''); drawer.querySelector('a')?.focus(); }
    else { mainEl?.removeAttribute('inert'); footEl?.removeAttribute('inert'); hamb.focus(); }
    }

    hamb?.addEventListener('click', () => setDrawer(drawer.classList.contains('hidden')));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.classList.contains('hidden')) setDrawer(false); });

    const menuLinks = [...document.querySelectorAll('#nav-list a[href^="#"]')];
    const targets   = menuLinks.map(a => document.querySelector(a.hash)).filter(Boolean);

    function updateNavActive(){
    const trigger = window.innerHeight * 0.35; // ajuste se quiser mais/menos pra baixo
    let current = null;

    for (const sec of targets){
        const r = sec.getBoundingClientRect();
        // ativa só quando a "linha" entra na seção
        if (r.top <= trigger && r.bottom > trigger){
        current = sec;
        break;
        }
    }

    menuLinks.forEach(a => a.removeAttribute('aria-current'));
    if (current){
        const link = menuLinks.find(a => a.hash === '#' + current.id);
        link?.setAttribute('aria-current','true');
    }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
    if (!ticking){
        requestAnimationFrame(() => { updateNavActive(); ticking = false; });
        ticking = true;
    }
    });
    window.addEventListener('resize', updateNavActive);
    window.addEventListener('hashchange', updateNavActive);
    updateNavActive(); // inicial

    const prefersReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) stop();
    document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (!prefersReduce) start();
    });

});