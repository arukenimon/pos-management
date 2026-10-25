export const FPS = 30;
export const TOTAL_FRAMES = 36 * FPS;

export const SCENES = [
  {id: 'intro', label: 'Meet POS', from: 0, duration: 120},
  {id: 'checkout', label: 'Sell', from: 120, duration: 270},
  {id: 'inventory', label: 'Stock', from: 390, duration: 210},
  {id: 'analytics', label: 'Learn', from: 600, duration: 210},
  {id: 'team', label: 'Team', from: 810, duration: 150},
  {id: 'outro', label: 'Your everyday', from: 960, duration: 120},
] as const;

export const PRODUCTS = [
  {name: 'Iced coffee', variant: 'Medium', sku: 'COF-M', price: 120, stock: 14, kind: 'coffee'},
  {name: 'Butter croissant', variant: 'Classic', sku: 'CRS-01', price: 85, stock: 6, kind: 'croissant'},
  {name: 'Matcha latte', variant: 'Medium', sku: 'MAT-M', price: 145, stock: 12, kind: 'matcha'},
] as const;

export const REVENUE = [1800, 2450, 2100, 3050, 2700, 3100, 3250];
export const PROFIT = [500, 700, 580, 850, 740, 850, 900];
export const ORDERS = [10, 13, 11, 15, 14, 16, 17];

export const money = (value: number) =>
  `₱${value.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
