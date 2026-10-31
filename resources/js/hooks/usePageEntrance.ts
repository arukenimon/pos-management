import { RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

export default function usePageEntrance(scope: RefObject<HTMLElement>, page: string) {
    useGSAP(() => {
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference)', () => {
            gsap.from('[data-page-heading]', { y: 8, opacity: 0, duration: 0.3, clearProps: 'all' });
            const panels = scope.current?.querySelectorAll('.dashboard-card, [data-page-panel]');
            if (panels?.length) gsap.from(Array.from(panels).slice(0, 8), {
                y: 10, opacity: 0, duration: 0.35, stagger: 0.035, ease: 'power2.out', clearProps: 'all',
            });
        });
        return () => media.revert();
    }, { scope, dependencies: [page], revertOnUpdate: true });
}
