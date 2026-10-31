import { ArrowUpRight, Check, Layers3, Package, ScanLine } from 'lucide-react';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import Brand from '@/Components/Brand';

export default function AuthBrandPanel({ registering = false }: { registering?: boolean }) {
    const scope = useRef<HTMLDivElement>(null);
    useGSAP(() => {
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference)', () => {
            gsap.from('.auth-art-card', { y: 25, rotation: 0, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' });
        });
        return () => media.revert();
    }, { scope });

    return <aside ref={scope} className="auth-brand-panel relative hidden flex-col justify-between overflow-hidden border-r border-border p-10 lg:flex xl:p-14">
        <a href="/" className="relative z-10 w-fit rounded-lg" aria-label="TindaHub home"><Brand /></a>
        <div className="relative z-10 my-12 max-w-[28rem]">
            <p className="mb-5 flex items-center gap-2 text-xs font-medium text-accent-foreground"><span className="h-px w-7 bg-primary" />Made for your everyday</p>
            <h2 className="font-display text-[clamp(2.5rem,3.9vw,4rem)] font-medium leading-[1.04] tracking-[-0.045em]">A little less busy.<br /><span className="text-muted-foreground">A lot more business.</span></h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">{registering ? 'Your products, your people, your next chapter. Bring it all together in one workspace.' : 'From the first sale to the final count. Everything you need to keep your shop moving.'}</p>
            <div className="auth-art mt-12" role="img" aria-label="Illustration of a sale, inventory update, and shop overview">
                <div className="auth-art-card auth-art-back"><Layers3 className="h-5 w-5 text-cyan-400" /><span>One connected workspace</span><ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" /></div>
                <div className="auth-art-card auth-art-middle"><span className="dashboard-icon"><Package className="h-4 w-4" /></span><span><strong>Inventory, in sync.</strong><small>Stock updates as you sell</small></span><span className="ml-auto h-2 w-2 rounded-full bg-cyan-400" /></div>
                <div className="auth-art-card auth-art-front"><span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500/10 text-emerald-500"><Check className="h-5 w-5" /></span><span><strong>Another sale. All sorted.</strong><small>A smoother day starts here.</small></span><ScanLine className="ml-auto h-5 w-5 text-accent-foreground" /></div>
            </div>
        </div>
        <p className="relative z-10 text-[11px] text-muted-foreground">Built for the businesses that keep our neighborhoods going.</p>
    </aside>;
}
