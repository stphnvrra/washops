# 💧 WashOps | Premium Laundry Management System SaaS

WashOps is a high-performance, visually stunning Next.js 15 SaaS workspace designed for laundromat owners to manage daily workflows, tracking, CRM, active machinery cycles, financials, and dynamic usage-based subscription billing.

---

## 🚀 Key Features

*   **Unified Owner Authentication Portal**: Secure registration and sessions mapped to custom shop names (e.g. "Stephen's Wash Hub"), with a one-click Recruiter Demo bypass.
*   **Operations Control Dashboard**: Real-time analytics, revenue gauges, order statuses, and active machinery runners.
*   **Laundry Orders Workspace**: Dynamic check-in calculator computing weights, service types (Wash-Dry-Fold, Dry Clean, etc.), and extras. Includes confetti milestones and QR-code logs.
*   **IoT Machine Monitors**: Live status trackers (Idle, Running, Out of Service) with countdown timers and cycle parameters.
*   **Customer CRM Database**: Loyalty scoring trackers, registration, and comprehensive wash history details.
*   **Supplies & Inventory Tracker**: Automated restock alerts and stock adjustment widgets.
*   **Financial Ledger**: Ledger records logging operating expenses (rent, water bills) and calculating capital margins.
*   **Stripe Checkout Simulator & Billing Hub**:
    *   Displays subscription parameters and invoices.
    *   Features a dynamic database storage size estimator (150 KB/order, 80 KB/customer) with sandbox overage drivers (+120 MB mock files) to test overage charges.
    *   An authentic Stripe Checkout Portal clone with auto-spacing cards, real-time brand detection (Visa/Mastercard/Amex), secure elements, and printable invoice receipts.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: Next.js 15 (React 19, App Router, TypeScript)
*   **Styling & UI**: Tailwind CSS, CSS scroll-reveals, backdrop-blur glassmorphism, and fluid animated mesh gradients.
*   **Database**: Supabase / PostgreSQL schema layer with automatic persistent LocalStorage fallback (allows complete sandbox operation without credentials).
*   **Visualizations**: Recharts SVG graph modules.

---

## ⚙️ Getting Started

### Prerequisites
*   Node.js v20.x or higher
*   npm

### Installation & Execution
1.  Clone the repository:
    ```bash
    git clone https://github.com/stphnvrra/washops.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the local development server:
    ```bash
    npm run dev
    ```
4.  Run the production build locally:
    ```bash
    npm run build
    ```
