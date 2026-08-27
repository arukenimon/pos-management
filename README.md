# Point of Sale (POS) System

A modern, full-stack Point of Sale system built with Laravel, React, TypeScript, and Inertia.js. Designed for small to medium-sized retail businesses and sari-sari stores.

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## 🌟 Features

### Admin — Point of Sale
- Fast product search by name or SKU (Enter key adds first result)
- Click a product to add it to the cart; variant picker dialog for multi-variant products
- Cart with typeable quantity input (in addition to +/− buttons), remove, and clear
- Payment method selection — **Cash** (with change calculation) and **Card**
- FIFO stock deduction on checkout
- **Mobile-optimised** — tabs switch between Products panel and Cart panel on small screens

### Admin — Dashboard
- Real-time KPI cards: Total Revenue, Total Orders, Average Order Value, Customers
- "Today" sub-stats on each card
- **Recent Stock Activity** feed — last 10 stock movements with product thumbnail, movement type badge, and quantity direction
- Quick-action links: Add Product, POS, Sales History, Stock Movements

### Admin — Analytics (`/admin/analytics`)
- Period selector: Today / 7 days / 30 days / 90 days
- KPI cards: Revenue, Orders, Avg Order Value, Units Sold
- **Revenue & Orders over time** — dual-axis area chart
- **Top Products by Units Sold** — horizontal bar chart (units + revenue)
- **Payment Method split** — donut chart with per-method breakdown
- **Stock In vs Out trend** — grouped bar chart per day
- **Sales by Hour of Day** — bar chart for peak-hour analysis
- Built with **Recharts** (no extra install needed)

### Admin — Stock Movements (`/admin/inventory/movements`)
- Paginated, filterable log of every stock change (purchase, sale, adjustment, deletion)
- Filter by type, product/SKU search, and date range
- Summary cards: Total Units In, Total Units Out, Purchase count, Sale count
- Each row: product thumbnail, variant, type badge, directional quantity, note, performed-by, timestamp

### Admin — Product & Inventory Management
- Full CRUD with multiple image upload (stored as JSON)
- Product variants with attributes (size, colour, etc.)
- SKU management with barcode scanner support (camera & USB/Bluetooth)
- Stock batches with cost price and selling price per batch
- Stock status labels: Safe / Low / Critical
- Delete individual stock batches

### Admin — Sales History
- Paginated orders list with search and payment-method filter
- Per-order detail view with line items
- Analytics summary cards (total sales, revenue, today's figures)

### Customer
- Product catalogue with variant support
- Shopping cart (add, remove, update quantity)
- Checkout flow

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12, Sanctum, Breeze, Inertia.js |
| Frontend | React 18, TypeScript, Tailwind CSS 3 |
| Charts | Recharts 2 |
| UI primitives | Radix UI, Lucide React |
| Forms | React Hook Form + Zod |
| Data fetching | React Query (TanStack Query v5) |
| Build | Vite 7, TypeScript 5 |

---

## 📋 Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18.x
- NPM
- MySQL / PostgreSQL / SQLite

---

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/pos.git
cd pos
```

### 2. Install dependencies
```bash
composer install
npm install
```

### 3. Environment setup
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Database setup
```bash
# SQLite (default)
touch database/database.sqlite

# Run all migrations (includes stock_movements table)
php artisan migrate

# Optional: seed sample data
php artisan db:seed
```

### 5. Storage link
```bash
php artisan storage:link
```

### 6. Build & serve
```bash
# Development (both servers)
composer dev

# Or separately:
php artisan serve   # http://localhost:8000
npm run dev

# Production build
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 📁 Project Structure

```
pos/
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/
│   │   │   ├── DashboardController.php       # Real stats + recent movements
│   │   │   ├── AnalyticsController.php       # Charts data (revenue, products, stock)
│   │   │   ├── PosController.php             # POS index + checkout (FIFO)
│   │   │   ├── SalesController.php           # Orders list & detail
│   │   │   ├── StockMovementController.php   # Movements log page
│   │   │   └── Admin/ProductController.php   # Product & inventory CRUD
│   └── Models/
│       ├── Product.php
│       ├── ProductVariant.php
│       ├── Inventory.php          # Stock batches
│       ├── StockMovement.php      # Movement log entries
│       ├── Order.php
│       ├── OrderItem.php
│       └── User.php
├── database/
│   └── migrations/                # Includes stock_movements migration
├── resources/js/
│   ├── Layouts/AdminLayout.tsx
│   └── Pages/Auth/Admin/
│       ├── AdminDashboard.tsx     # Real-data dashboard + activity feed
│       ├── Analytics/Index.tsx    # Analytics page with Recharts
│       ├── Inventory/Movements.tsx # Stock movements log
│       ├── POS/Index.tsx          # POS terminal (mobile-friendly)
│       ├── Sales/                 # Sales history & order detail
│       └── Products/              # Product CRUD + inventory
└── routes/web.php
```

---

## 🔐 Routes Reference

### Admin (requires `admin` middleware)

| Method | URL | Description |
|---|---|---|
| GET | `/admin` | Dashboard |
| GET | `/admin/analytics` | Analytics & charts |
| GET | `/admin/inventory/movements` | Stock movements log |
| GET | `/admin/pos` | POS terminal |
| POST | `/admin/pos/checkout` | Process sale |
| GET | `/admin/sales` | Sales history |
| GET | `/admin/sales/{id}` | Order detail |
| GET | `/admin/products/inventory` | Inventory management |
| GET | `/admin/products/create` | Add product |
| POST | `/admin/products/create` | Store product |
| GET | `/admin/products/edit/{id}` | Edit product |
| PUT | `/admin/products/edit/{id}` | Update product |
| POST | `/admin/products/add-stock/{variant_id}` | Add stock batch |
| DELETE | `/admin/products/stocks/delete/{id}` | Delete stock batch |

### Customer

| Method | URL | Description |
|---|---|---|
| GET | `/` | Product catalogue |
| POST | `/cart/add/{variant_id}` | Add to cart |
| DELETE | `/cart/remove/{cart_id}` | Remove from cart |
| PUT | `/cart/quantity/update/{cart_id}` | Update cart quantity |
| GET | `/checkout` | Checkout page |

---

## 🗄️ Key Database Tables

| Table | Purpose |
|---|---|
| `products` | Product catalogue |
| `product_variants` | SKU / price per variant |
| `inventories` | Stock batches (FIFO deduction) |
| `stock_movements` | Audit log of every stock change |
| `orders` | Completed sales |
| `order_items` | Line items per order |
| `carts` | Customer cart items |
| `users` | Admin & customer accounts |

### `stock_movements` columns
- `product_variant_id` — which variant
- `inventory_id` — which batch (nullable)
- `type` — `purchase` | `sale` | `adjustment` | `deletion`
- `quantity` — positive = stock in, negative = stock out
- `reference_type` / `reference_id` — polymorphic link (e.g. to `Order`)
- `performed_by` — user who triggered it

---

## 🧪 Testing

```bash
php artisan test
```

---

## 🚢 Docker VPS deployment

The included Compose stack is intended for a single Linux VPS. It builds the
Laravel app and Vite assets in containers, runs MariaDB, a queue worker and the
Laravel scheduler, and uses Caddy to issue and renew HTTPS certificates.

### First deployment

1. Install Docker Engine with the Docker Compose plugin on the VPS, clone this
   repository, and point the domain's DNS A/AAAA record at the VPS.
2. Create the production environment file and set its secrets and domain:

   ```bash
   cp .env.docker.example .env
   nano .env
   docker compose run --rm app php artisan key:generate --show
   ```

   Copy the command's output into `APP_KEY=` in `.env`. Set `DOMAIN` and
   `APP_URL` to the real domain, and replace both database passwords with unique
   long values. Do not commit this file.

3. Build the images, initialise the database, then start the services:

   ```bash
   docker compose build
   docker compose up -d db
   docker compose run --rm app php artisan migrate --force
   docker compose up -d
   ```

4. Verify the running services:

   ```bash
   docker compose ps
   docker compose logs -f web app queue
   ```

Only ports 80 and 443 are exposed. MariaDB is private to the Docker network,
and its data plus uploaded product images are stored in named Docker volumes.
Caddy automatically provisions TLS after DNS resolves to the VPS; ensure the
VPS firewall permits inbound TCP 80 and 443.

### Optional: real-time Pusher notifications

When using Pusher Channels, add the server credentials to `.env`, then
duplicate only the public app key and cluster for Vite:

```env
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-public-app-key
PUSHER_APP_SECRET=your-private-app-secret
PUSHER_APP_CLUSTER=ap1

VITE_PUSHER_APP_KEY=your-public-app-key
VITE_PUSHER_APP_CLUSTER=ap1
```

`deploy.sh` passes the two `VITE_` values to the Docker build, where they are
embedded in the browser bundle. Never expose `PUSHER_APP_SECRET` as a `VITE_`
variable or Docker build argument. Redeploy after changing either Vite value.

### Updates and backups

For each deployment, use the included script. It refuses to overwrite local Git
changes, fast-forwards `master`, rebuilds the images, waits for MariaDB, runs
migrations, and recreates the app, queue, scheduler, and web containers from
the new images:

```bash
bash deploy.sh
```

By default it deploys `master`. To deploy a different existing branch for a
one-off release, run `DEPLOY_BRANCH=branch-name bash deploy.sh`.

Back up the `pos_database` and `pos_storage` Docker volumes before upgrades.
`docker compose down` is safe for normal maintenance; do **not** add `-v` unless
you intentionally want to delete the database, uploads, and Caddy certificates.

---

## 📝 License

MIT License

---

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) — backend framework
- [Inertia.js](https://inertiajs.com) — SPA without the API
- [Recharts](https://recharts.org) — React charting library
- [Radix UI](https://www.radix-ui.com) — accessible component primitives
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling
- [Lucide](https://lucide.dev) — icon library
