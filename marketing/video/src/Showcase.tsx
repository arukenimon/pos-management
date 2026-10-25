import React, {useEffect, useState, type CSSProperties, type ReactNode} from 'react';
import {
  AbsoluteFill, Html5Audio, Sequence, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame,
} from 'remotion';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, Banknote, BarChart3, Bell, Check,
  CheckCircle2, ChevronDown, Coffee, CreditCard, Croissant, FileDown,
  LayoutDashboard, Leaf, LockKeyhole, Milk, Package, Plus, ReceiptText,
  Search, Settings, ShieldCheck, ShoppingBag, ShoppingCart, Users, X,
  type LucideIcon,
} from 'lucide-react';
import {FPS, ORDERS, PRODUCTS, PROFIT, REVENUE, SCENES, money} from './storyboard';

const ease = (frame: number, start: number, end: number, a = 0, b = 1) =>
  interpolate(frame, [start, end], [a, b], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const reveal = (frame: number, delay = 0): CSSProperties => {
  const progress = spring({frame: frame - delay, fps: FPS, config: {damping: 22, stiffness: 110}});
  return {opacity: ease(frame, delay, delay + 15), transform: `translateY(${(1 - progress) * 35}px)`};
};

function Brand({large = false}: {large?: boolean}) {
  return <div className={`brand ${large ? 'brand-large' : ''}`}>
    <span className="brand-mark">
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="14" y="14" width="36" height="36" rx="3" fill="currentColor" />
        <path d="M21 22H43V29H21ZM21 34H29V42H21ZM34 34H43V42H34Z" fill="#0f766e" />
      </svg>
    </span><span>POS<span className="brand-dot">.</span></span>
  </div>;
}

function Pill({icon: Icon, children, light = false}: {icon: LucideIcon; children: ReactNode; light?: boolean}) {
  return <span className={`pill ${light ? 'pill-light' : ''}`}><Icon size={20} strokeWidth={1.8} />{children}</span>;
}

function ProductArt({kind, small = false}: {kind: string; small?: boolean}) {
  const Icon = kind === 'croissant' ? Croissant : kind === 'matcha' ? Leaf : kind === 'milk' ? Milk : Coffee;
  return <div className={`product-art ${kind} ${small ? 'art-small' : ''}`}>
    <div className="product-art-disc" />
    <Icon size={small ? 28 : 62} strokeWidth={1.3} />
    {!small && <span className="art-spark">+</span>}
  </div>;
}

const nav: {icon: LucideIcon; title: string; key: string}[] = [
  {icon: LayoutDashboard, title: 'Dashboard', key: 'dashboard'},
  {icon: ShoppingCart, title: 'Point of sale', key: 'checkout'},
  {icon: Package, title: 'Inventory', key: 'inventory'},
  {icon: ReceiptText, title: 'Sales history', key: 'sales'},
  {icon: BarChart3, title: 'Analytics', key: 'analytics'},
  {icon: Users, title: 'Team', key: 'team'},
];

function AppWindow({active, title, subtitle, children, className = '', action}: {
  active: string; title: string; subtitle: string; children: ReactNode; className?: string; action?: ReactNode;
}) {
  return <div className={`app-window ${className}`}>
    <div className="window-bar">
      <div className="window-dots"><i /><i /><i /></div>
      <div className="window-location"><LockKeyhole size={12} /> POS workspace</div>
      <span className="demo-label">DEMO DATA</span>
    </div>
    <div className="app-body">
      <aside className="app-sidebar">
        <div className="shop-switch"><span className="shop-symbol"><ShoppingBag size={21} /></span><div><b>Everyday shop</b><small>Your workspace</small></div><ChevronDown size={15} /></div>
        <div className="nav-caption">WORKSPACE</div>
        <div className="app-nav">{nav.map(({icon: Icon, title: label, key}) =>
          <div key={key} className={active === key ? 'selected' : ''}><Icon size={19} strokeWidth={1.8} />{label}</div>,
        )}</div>
        <div className="sidebar-bottom"><div><Settings size={18} />Settings</div><div className="user-row"><span>AS</span><div><b>Alex Santos</b><small>Owner</small></div></div></div>
      </aside>
      <main className="app-main">
        <header className="app-toolbar"><span>Everyday shop <span className="slash">/</span> {title}</span><div><Bell size={18} /><span className="toolbar-avatar">A</span></div></header>
        <div className="app-page">
          <div className="page-heading"><div><h3>{title}</h3><p>{subtitle}</p></div>{action}</div>
          {children}
        </div>
      </main>
    </div>
  </div>;
}

function SceneCopy({number, eyebrow, title, body, children}: {
  number: string; eyebrow: string; title: ReactNode; body: string; children?: ReactNode;
}) {
  const frame = useCurrentFrame();
  return <div className="scene-copy">
    <div className="eyebrow" style={reveal(frame, 5)}><span>{number}</span>{eyebrow}</div>
    <h2 style={reveal(frame, 11)}>{title}</h2>
    <p style={reveal(frame, 20)}>{body}</p>
    <div className="scene-features" style={reveal(frame, 30)}>{children}</div>
  </div>;
}

function Cursor({frame, points, clicks = []}: {
  frame: number; points: {at: number; x: number; y: number}[]; clicks?: number[];
}) {
  const x = interpolate(frame, points.map(p => p.at), points.map(p => p.x), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(frame, points.map(p => p.at), points.map(p => p.y), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const click = clicks.find(at => frame >= at && frame < at + 15);
  return <div className="cursor" style={{left: x, top: y, opacity: ease(frame, 20, 35) * (1 - ease(frame, 213, 226))}}>
    {click !== undefined && <span className="cursor-pulse" style={{opacity: 1 - (frame - click) / 15, transform: `scale(${.6 + (frame - click) / 8})`}} />}
    <svg width="30" height="36" viewBox="0 0 30 36"><path d="M3 2L25 23L15 24L11 33L3 2Z" fill="#102a2a" stroke="white" strokeWidth="2.5" strokeLinejoin="round" /></svg>
  </div>;
}

function Intro() {
  const frame = useCurrentFrame();
  const float = Math.sin(frame / 30) * 5;
  return <AbsoluteFill className="intro-scene">
    <div className="intro-copy">
      <div className="eyebrow" style={reveal(frame, 3)}><span className="live-dot" /> MADE FOR YOUR EVERYDAY</div>
      <h1 style={reveal(frame, 9)}>Your shop.<br /><em>All together.</em></h1>
      <p style={reveal(frame, 18)}>Sales, stock, and your team.<br />One straightforward point of sale.</p>
      <div className="intro-pills" style={reveal(frame, 28)}><Pill icon={ShoppingCart}>Sell simply</Pill><Pill icon={Package}>Stay stocked</Pill><Pill icon={BarChart3}>See clearly</Pill></div>
    </div>
    <div className="intro-stage" style={{...reveal(frame, 12), transform: `translateY(${(1 - spring({frame: frame - 12, fps: FPS, config: {damping: 23}})) * 75 + float}px)`}}>
      <div className="stage-circle circle-one" /><div className="stage-circle circle-two" />
      <div className="mini-terminal">
        <div className="mini-terminal-top"><span className="mini-square"><ShoppingCart size={27} /></span><span>Point of sale<small>Ready for the next customer</small></span><span className="terminal-ready"><i />Ready</span></div>
        <div className="mini-products">{PRODUCTS.map(p => <div key={p.sku}><ProductArt kind={p.kind} /><b>{p.name}</b><span>{money(p.price)}</span></div>)}</div>
        <div className="mini-total"><span>One happy customer.<small>Three items. All taken care of.</small></span><strong>₱350<span>.00</span></strong></div>
      </div>
      <div className="floating-tag tag-stock" style={reveal(frame, 30)}><span><Package size={24} /></span><div><b>Stock, in sync.</b><small>Updated with every sale</small></div><CheckCircle2 size={22} /></div>
      <div className="floating-tag tag-sale" style={reveal(frame, 42)}><span><Check size={24} /></span><div><b>Sale completed</b><small>Looking good, everyday.</small></div></div>
      <div className="intro-demo-note">ILLUSTRATIVE PRODUCT PREVIEW · DEMO DATA</div>
    </div>
    <div className="intro-rule" style={{transform: `scaleX(${ease(frame, 10, 70)})`}} />
  </AbsoluteFill>;
}

function Checkout() {
  const frame = useCurrentFrame();
  const count = frame < 48 ? 0 : frame < 94 ? 1 : frame < 135 ? 2 : 3;
  const total = PRODUCTS.slice(0, count).reduce((sum, p) => sum + p.price, 0);
  const paid = frame >= 211;
  const cashEntered = frame >= 174;
  return <AbsoluteFill>
    <SceneCopy number="01" eyebrow="THE COUNTER" title={<>A smoother<br /><em>checkout.</em></>} body="Find the item. Take the payment. Keep the day moving.">
      <Pill icon={Search}>Quick product search</Pill><Pill icon={Banknote}>Cash & card payments</Pill><Pill icon={ReceiptText}>Printable receipts</Pill>
    </SceneCopy>
    <div className="screen-stage" style={reveal(frame, 13)}>
      <AppWindow active="checkout" title="Point of sale" subtitle="Make the next sale a simple one.">
        <div className="pos-layout">
          <section className="pos-products">
            <div className="search-box"><Search size={18} /><span>Search products or SKU…</span><kbd>↵</kbd></div>
            <div className="product-grid">{[...PRODUCTS, {name: 'Oat milk', variant: '1 litre', price: 110, stock: 3, kind: 'milk', sku: 'OAT-1L'}].map((p, i) => {
              const selected = count > i && i < 3;
              return <div className={`product-card ${selected ? 'product-selected' : ''}`} key={p.sku}>
                <ProductArt kind={p.kind} /><div className="product-card-copy"><b>{p.name}</b><small>{p.variant}</small><div><strong>{money(p.price)}</strong><span>{selected ? <Check size={17} /> : <Plus size={17} />}</span></div></div>
              </div>;
            })}</div>
          </section>
          <section className="cart-panel"><div className="cart-heading"><b>Current sale</b><span>{count} items</span></div>
            <div className="cart-lines">{count === 0 ? <div className="empty-cart"><ShoppingBag size={38} strokeWidth={1.2} /><b>Ready when you are</b><span>Add an item to begin</span></div> : PRODUCTS.slice(0, count).map((p, i) => <div key={p.sku} className="cart-line" style={reveal(frame, [48, 94, 135][i])}><ProductArt kind={p.kind} small /><div><b>{p.name}</b><small>{p.variant} · Qty 1</small></div><strong>{money(p.price)}</strong></div>)}</div>
            <div className="cart-summary"><div><span>Total</span><strong>{money(total)}</strong></div><div className="payment-tabs"><span className="active"><Banknote size={17} />Cash</span><span><CreditCard size={17} />Card</span></div><label>Cash received</label><div className={`cash-field ${cashEntered ? 'filled' : ''}`}>₱ <span>{cashEntered ? '500.00' : '0.00'}</span></div><div className="change-line"><span>Change</span><b>{money(cashEntered ? 500 - total : 0)}</b></div><div className={`checkout-button ${count === 0 ? 'button-muted' : ''}`}><CheckCircle2 size={18} />Complete sale</div></div>
          </section>
        </div>
      </AppWindow>
      <Cursor frame={frame} points={[{at: 0, x: 400, y: 450}, {at: 35, x: 330, y: 325}, {at: 48, x: 330, y: 325}, {at: 82, x: 555, y: 325}, {at: 94, x: 555, y: 325}, {at: 122, x: 330, y: 530}, {at: 135, x: 330, y: 530}, {at: 164, x: 938, y: 571}, {at: 179, x: 938, y: 571}, {at: 201, x: 943, y: 645}, {at: 211, x: 943, y: 645}]} clicks={[48, 94, 135, 174, 211]} />
      {paid && <div className="success-overlay" style={{opacity: ease(frame, 211, 224)}}><div className="success-card" style={reveal(frame, 212)}><span className="success-icon"><Check size={44} strokeWidth={2} /></span><div className="eyebrow">ALL TAKEN CARE OF</div><h3>Sale completed.</h3><p>3 items · Cash payment</p><strong>{money(350)}</strong><div className="success-details"><span>Cash received <b>₱500.00</b></span><span>Change to give <b>₱150.00</b></span></div><span className="stock-synced"><Package size={17} />Inventory updated automatically</span></div></div>}
    </div>
    <div className="scene-bottom" style={reveal(frame, 35)}><span>01 / SELL</span><p>From product to payment, in one flow.</p></div>
  </AbsoluteFill>;
}

function InventoryScene() {
  const frame = useCurrentFrame();
  const restocked = frame >= 112;
  const rows = [
    {name: 'Iced coffee', sku: 'COF-M', kind: 'coffee', qty: 13, state: 'In stock'},
    {name: 'Butter croissant', sku: 'CRS-01', kind: 'croissant', qty: 5, state: 'Low stock'},
    {name: 'Matcha latte', sku: 'MAT-M', kind: 'matcha', qty: 11, state: 'In stock'},
    {name: 'Oat milk', sku: 'OAT-1L', kind: 'milk', qty: restocked ? 23 : 3, state: restocked ? 'In stock' : 'Low stock'},
    {name: 'Cocoa blend', sku: 'COC-01', kind: 'coffee', qty: 0, state: 'Out of stock'},
  ];
  return <AbsoluteFill>
    <SceneCopy number="02" eyebrow="BEHIND THE COUNTER" title={<>A clear view<br />of <em>every item.</em></>} body="Know what’s on hand, what’s running low, and what just came in.">
      <Pill icon={Package}>Stock by product variant</Pill><Pill icon={Bell}>Low-stock alerts</Pill><Pill icon={ArrowDownLeft}>Stock movement history</Pill>
    </SceneCopy>
    <div className="screen-stage" style={reveal(frame, 13)}>
      <AppWindow active="inventory" title="Inventory" subtitle="Everything on your shelves, in view." action={<span className="small-button"><Plus size={16} />Add product</span>}>
        <div className="inventory-kpis"><div><Package size={22} /><span>Product variants<b>5</b></span></div><div><ShoppingBag size={22} /><span>Units on hand<b>{restocked ? '52' : '32'}</b></span></div><div className="warning-kpi"><Bell size={22} /><span>Need attention<b>{restocked ? '2' : '3'}</b></span></div></div>
        <div className="inventory-alert"><span><Bell size={19} /><b>{restocked ? '2' : '3'} items need your attention</b></span><span>Threshold: 5 units or fewer</span></div>
        <div className="inventory-table"><div className="inventory-table-head"><span>PRODUCT / SKU</span><span>ON HAND</span><span>STATUS</span><span /></div>{rows.map((row, i) => <div key={row.sku} className={`inventory-row ${restocked && i === 3 ? 'restocked-row' : ''}`} style={reveal(frame, 20 + i * 5)}><div className="inventory-product"><ProductArt kind={row.kind} small /><span><b>{row.name}</b><small>{row.sku}</small></span></div><strong>{row.qty}</strong><span className={`stock-state ${row.state === 'In stock' ? 'good' : row.state === 'Low stock' ? 'low' : 'out'}`}><i />{row.state}</span><span className="table-add"><Plus size={15} />Add stock</span></div>)}</div>
        <div className="movement-foot"><span className="movement-dot" /><span>Every stock change is recorded.</span><span>View movements <ArrowRight size={14} /></span></div>
      </AppWindow>
      <div className="restock-note" style={{...reveal(frame, 87), opacity: ease(frame, 87, 100) * (1 - ease(frame, 183, 200))}}><span className="restock-note-icon"><Package size={28} /></span><div><b>{restocked ? 'Stock added. All recorded.' : 'Receiving a fresh delivery…'}</b><small>Oat milk · {restocked ? '3 → 23 units on hand' : '20 new units'}</small></div><span className="restock-quantity">+20</span>{restocked && <CheckCircle2 size={24} />}</div>
    </div>
    <div className="scene-bottom" style={reveal(frame, 35)}><span>02 / STOCK</span><p>Fewer surprises on the shelf.</p></div>
  </AbsoluteFill>;
}

function RevenueChart({frame}: {frame: number}) {
  const progress = ease(frame, 26, 107);
  const values = REVENUE.map((value, i) => ({x: 38 + i * 91, y: 205 - value / 3500 * 166}));
  const path = values.map((point, i) => `${i === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
  return <svg className="revenue-chart" viewBox="0 0 636 260">
    <defs><linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity=".22" /><stop offset="100%" stopColor="#0f766e" stopOpacity="0" /></linearGradient><clipPath id="chart-reveal"><rect x="0" y="0" width={636 * progress} height="260" /></clipPath></defs>
    {[3000, 2000, 1000, 0].map((value, i) => {
      const y = 205 - value / 3500 * 166;
      return <g key={value}><line x1="38" x2="600" y1={y} y2={y} stroke="#e5eeea" strokeDasharray="4 5" /><text x="3" y={y + 4} fill="#78908b" fontSize="11">{['3k', '2k', '1k', '0'][i]}</text></g>;
    })}
    <g clipPath="url(#chart-reveal)"><path d={`${path}L584,205L38,205Z`} fill="url(#revenue-fill)" /><path d={path} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />{values.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="5" fill="white" stroke="#0f766e" strokeWidth="3" />)}</g>
    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => <text key={day} x={38 + i * 91} y="239" textAnchor="middle" fill="#78908b" fontSize="13">{day}</text>)}
  </svg>;
}

function AnalyticsScene() {
  const frame = useCurrentFrame();
  const counter = ease(frame, 18, 60);
  const revenue = REVENUE.reduce((sum, value) => sum + value, 0);
  const profit = PROFIT.reduce((sum, value) => sum + value, 0);
  const orders = ORDERS.reduce((sum, value) => sum + value, 0);
  return <AbsoluteFill>
    <SceneCopy number="03" eyebrow="THE BIGGER PICTURE" title={<>Less guessing.<br /><em>More clarity.</em></>} body="See your sales, understand your margins, and find the products people love.">
      <Pill icon={BarChart3}>Sales & profit trends</Pill><Pill icon={ShoppingBag}>Best-selling products</Pill><Pill icon={FileDown}>CSV & PDF reports</Pill>
    </SceneCopy>
    <div className="screen-stage" style={reveal(frame, 13)}>
      <AppWindow active="analytics" title="Analytics" subtitle="A closer look at how your shop is doing." action={<div className="period-select">7 days <ChevronDown size={16} /></div>}>
        <div className="analytics-kpis">{[{label: 'Revenue', value: money(Math.round(revenue * counter)), icon: Banknote}, {label: 'Gross profit', value: money(Math.round(profit * counter)), icon: ArrowUpRight}, {label: 'Orders', value: String(Math.round(orders * counter)), icon: ShoppingCart}].map(({label, value, icon: Icon}, i) => <div key={label} style={reveal(frame, 20 + i * 7)}><div><span>{label}</span><b>{value}</b><small>Last 7 days</small></div><span className="kpi-icon"><Icon size={23} /></span></div>)}</div>
        <div className="analytics-content"><section className="chart-card"><div className="chart-title"><b>Revenue over time</b><span><i />Revenue</span></div><RevenueChart frame={frame} /><div className="chart-caption"><span>Know your rhythm.</span><span>Daily sales, clearly plotted.</span></div></section><section className="chart-card top-products"><div className="chart-title"><b>Top products</b><span>Units sold</span></div>{PRODUCTS.map((p, i) => <div className="top-product" key={p.sku} style={reveal(frame, 65 + i * 12)}><div><span>0{i + 1}</span><b>{p.name}</b><strong>{[48, 32, 24][i]}</strong></div><div className="product-bar-track"><i style={{width: `${[100, 66.7, 50][i] * ease(frame, 65 + i * 12, 108 + i * 12)}%`}} /></div></div>)}<div className="top-product-summary"><Leaf size={20} /><span>A clearer view of<br />what keeps you growing.</span></div></section></div>
        <div className="analytics-footer"><span><CheckCircle2 size={17} />Based on completed sales</span><span>Illustrative figures · Demo data</span></div>
      </AppWindow>
    </div>
    <div className="scene-bottom" style={reveal(frame, 35)}><span>03 / LEARN</span><p>Your numbers, with a little more meaning.</p></div>
  </AbsoluteFill>;
}

function TeamScene() {
  const frame = useCurrentFrame();
  const roleIndex = frame < 63 ? 0 : frame < 100 ? 1 : 2;
  const roles = [
    {name: 'Owner', initial: 'AS', user: 'Alex Santos', label: 'The full picture.', description: 'Manage your shop, reports, and team.', icon: ShieldCheck},
    {name: 'Manager', initial: 'JC', user: 'Jamie Cruz', label: 'Keep things running.', description: 'Manage inventory and review sales.', icon: Package},
    {name: 'Cashier', initial: 'SR', user: 'Sam Reyes', label: 'Ready at the counter.', description: 'Complete sales and manage cash shifts.', icon: ShoppingCart},
  ];
  return <AbsoluteFill>
    <div className="team-heading"><div className="eyebrow" style={reveal(frame, 4)}><span>04</span>YOUR PEOPLE</div><h2 style={reveal(frame, 10)}>The right access.<br /><em>For every role.</em></h2><p style={reveal(frame, 20)}>One team. Clear responsibilities. A shop that works together.</p></div>
    <div className="role-cards">{roles.map(({name, initial, user, label, description, icon: Icon}, i) => <div key={name} className={`role-card ${roleIndex === i ? 'role-active' : ''}`} style={reveal(frame, 24 + i * 9)}><div className="role-top"><span className="role-icon"><Icon size={30} strokeWidth={1.5} /></span><span className="role-name">{name}</span><CheckCircle2 className="role-check" size={23} /></div><h3>{label}</h3><p>{description}</p><div className="role-user"><span>{initial}</span><div><b>{user}</b><small>{name} access</small></div><LockKeyhole size={19} /></div></div>)}</div>
    <div className="team-note" style={reveal(frame, 60)}><Users size={22} /> Invite your team. Assign a role. Get back to the shop.<span>Demo team</span></div>
  </AbsoluteFill>;
}

function Outro() {
  const frame = useCurrentFrame();
  return <AbsoluteFill className="outro-scene"><div className="outro-ring ring-one" /><div className="outro-ring ring-two" /><div className="outro-ring ring-three" />
    <div className="outro-content"><div className="eyebrow" style={reveal(frame, 6)}>A LITTLE LESS ADMIN. A LITTLE MORE YOU.</div><h2 style={reveal(frame, 12)}>Made for<br /><em>your everyday.</em></h2><p style={reveal(frame, 23)}>Your sales. Your stock. Your people.<br />All together, with POS.</p><div className="outro-cta" style={reveal(frame, 34)}><span>Start with your first sale.</span><ArrowRight size={28} /></div></div><div className="outro-symbol" style={reveal(frame, 20)}><Brand large /><span>POINT OF SALE, SIMPLIFIED.</span><div><ShoppingCart size={30} /><i /><Package size={30} /><i /><BarChart3 size={30} /><i /><Users size={30} /></div></div>
  </AbsoluteFill>;
}

const sceneComponents = [Intro, Checkout, InventoryScene, AnalyticsScene, TeamScene, Outro];

export function PosShowcase() {
  const frame = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('Load local brand fonts'));
  useEffect(() => {
    let live = true;
    Promise.all([
      document.fonts.load('400 24px "DM Sans"'), document.fonts.load('500 24px "DM Sans"'),
      document.fonts.load('600 24px "DM Sans"'), document.fonts.load('700 24px "DM Sans"'),
      document.fonts.load('600 100px "Fraunces"'),
    ]).then(() => {if (live) continueRender(fontHandle);}).catch(() => {if (live) continueRender(fontHandle);});
    return () => {live = false;};
  }, [fontHandle]);
  const dark = frame >= 960;
  const current = SCENES.findIndex(scene => frame >= scene.from && frame < scene.from + scene.duration);
  return <AbsoluteFill className={`video ${dark ? 'dark-scene' : ''}`}>
    <div className="ambient-disc" style={{transform: `translate(${Math.sin(frame / 240) * 45}px, ${Math.cos(frame / 300) * 24}px)`}} />
    {SCENES.map((scene, i) => {
      const Component = sceneComponents[i];
      return <Sequence key={scene.id} name={scene.label} from={scene.from} durationInFrames={scene.duration}><Component /></Sequence>;
    })}
    <header className="video-header"><Brand /><div><span>POINT OF SALE, SIMPLIFIED.</span><i /><span>PRODUCT SHOWCASE</span></div></header>
    <footer className="video-footer"><span>BUILT FOR THE EVERYDAY SHOP.</span><div className="chapter-list">{SCENES.map((scene, i) => <div key={scene.id} className={current === i ? 'chapter-active' : ''}><span>{scene.label}</span><i><b style={{width: `${ease(frame, scene.from, scene.from + scene.duration) * 100}%`}} /></i></div>)}</div><span className="video-time">{String(Math.floor(frame / FPS)).padStart(2, '0')} / 36</span></footer>
    {SCENES.slice(1).map((scene, i) => {
      const boundary = scene.from;
      if (frame < boundary - 11 || frame > boundary + 11) return null;
      return <AbsoluteFill key={scene.id} style={{zIndex: 100, transform: `translateX(${interpolate(frame, [boundary - 12, boundary, boundary + 12], [-1920, 0, 1920])}px)`, background: i % 2 === 0 ? '#0f766e' : '#d7f3ed'}}><span className="wipe-line" /></AbsoluteFill>;
    })}
    <Html5Audio src={staticFile('soundtrack.wav')} volume={1} />
  </AbsoluteFill>;
}
