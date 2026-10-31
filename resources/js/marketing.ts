import '../css/marketing.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const themeButton = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const updateThemeLabel = () => themeButton?.setAttribute('aria-label', `Switch to ${document.documentElement.classList.contains('dark') ? 'light' : 'dark'} mode`);
updateThemeLabel();
themeButton?.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('tindahub.theme.v2', dark ? 'dark' : 'light'); } catch (_) { /* The preference still applies to this page. */ }
    updateThemeLabel();
});

document.querySelectorAll<HTMLAnchorElement>('.marketing-mobile-menu a').forEach(link => {
    link.addEventListener('click', () => link.closest('details')?.removeAttribute('open'));
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelector('.marketing-mobile-menu[open]')?.removeAttribute('open');
});

const marqueeToggle = document.querySelector<HTMLButtonElement>('[data-marquee-toggle]');
marqueeToggle?.addEventListener('click', () => {
    const paused = marqueeToggle.getAttribute('aria-pressed') !== 'true';
    marqueeToggle.setAttribute('aria-pressed', String(paused));
    marqueeToggle.setAttribute('aria-label', `${paused ? 'Resume' : 'Pause'} feature animation`);
    document.querySelector<HTMLElement>('.marquee-track')?.style.setProperty('animation-play-state', paused ? 'paused' : 'running');
});

document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(carousel => {
    const slides = Array.from(carousel.querySelectorAll<HTMLElement>('[data-slide]'));
    let current = 0;
    const move = (direction: number) => {
        current = (current + direction + slides.length) % slides.length;
        slides.forEach((slide, index) => { slide.hidden = index !== current; });
    };
    carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => move(-1));
    carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => move(1));
    carousel.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        move(event.key === 'ArrowLeft' ? -1 : 1);
    });
});

// Keep the complete message in the DOM and readable without JavaScript or motion.
document.querySelectorAll<HTMLElement>('[data-word-reveal]').forEach(paragraph => {
    const words = paragraph.textContent?.trim().split(/\s+/) ?? [];
    paragraph.setAttribute('aria-label', words.join(' '));
    paragraph.replaceChildren(...words.flatMap((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.setAttribute('aria-hidden', 'true');
        return index ? [document.createTextNode(' '), span] : [span];
    }));
});

const media = gsap.matchMedia();
media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('[data-hero-copy]', { y: 22, opacity: 0, stagger: 0.09, duration: 0.85, ease: 'power3.out', clearProps: 'all' });
    gsap.from('.hero-art', { y: 40, opacity: 0, duration: 1.1, delay: 0.25, ease: 'power3.out', clearProps: 'all' });
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
        gsap.from(element, { y: 28, opacity: 0, duration: 0.7, ease: 'power2.out', clearProps: 'all', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
    });
    gsap.utils.toArray<HTMLElement>('[data-word-reveal]').forEach(element => {
        gsap.from(element.querySelectorAll('span'), { opacity: 0.2, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: element, start: 'top 83%', end: 'bottom 45%', scrub: 0.5 } });
    });
});
media.add('(min-width: 801px) and (prefers-reduced-motion: no-preference)', () => {
    const cards = gsap.utils.toArray<HTMLElement>('.tour-card');
    cards.slice(0, -1).forEach((card, index) => {
        gsap.to(card, { scale: 0.95, opacity: 0.3, transformOrigin: 'center top', ease: 'none', scrollTrigger: { trigger: cards[index + 1], start: 'top 75%', end: 'top 20%', scrub: true } });
    });
});
void document.fonts.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('pagehide', () => media.revert(), { once: true });
