# J&JAY Hardware POS & Inventory Management System
## Full System Documentation (Version 1.0)
**Business:** J&JAY Hardware, Balingasag  
**Package:** `pos-inventory`  
**Word Document (.docx):** [`docs/JJAY_POS_Inventory_System_Documentation.docx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/docs/JJAY_POS_Inventory_System_Documentation.docx)  

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [System Architecture](#3-system-architecture)
4. [Functional Modules](#4-functional-modules)
5. [Database Design](#5-database-design)
6. [API Reference](#6-api-reference)
7. [Installation and Setup Guide](#7-installation-and-setup-guide)
8. [Configuration](#8-configuration)
9. [User Guide — Standard Procedures](#9-user-guide--standard-procedures)
10. [Business Rules and Computations](#10-business-rules-and-computations)
11. [Security Considerations and Known Limitations](#11-security-considerations-and-known-limitations)
12. [Future Enhancements](#12-future-enhancements)
- [Appendix A. Demo Data Summary](#appendix-a-demo-data-summary)
- [Appendix B. Source File Index](#appendix-b-source-file-index)

---

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive overview of the design, features, architecture, database schema, REST API, and deployment of the **J&JAY Hardware Point of Sale (POS) & Inventory Management System**. It serves as the primary technical and operational reference for store administrators, cashiers, developers, and project evaluators.

### 1.2 Scope
The system is tailored for retail hardware stores and construction supplies distributors. Key capabilities include:
- **Point of Sale (POS):** Fast SKU/barcode catalog lookup, cart management, tender calculation, 12% Value Added Tax (VAT), and printable customer receipts.
- **Inventory Management:** Centralized product catalog, stock level monitoring, dynamic reorder thresholds, and inventory valuation.
- **Sales History:** Searchable and filterable transaction ledger, receipt reprint, and sale voiding with automatic stock restoration.
- **Reporting & Business Analytics:** Periodic revenue reporting, hourly/daily sales vs. projection charts, top-selling products, and PDF/print export.
- **Supplier Directory:** Vendor contact directory, terms of payment, reliability rating, and delivery tracking.
- **Real-Time Notifications:** Low-stock and out-of-stock alerts with 1-click batch restock capabilities.
- **Role-Based Access Control (RBAC):** Segregated portals for Admin (full system access) and Cashier (POS & Sales history).

### 1.3 Target Audience
| Role | Recommended Sections |
|---|---|
| **Store Owner / General Manager** | Sections 2, 4, 9, 10 |
| **Cashier / POS Operator** | Sections 4.4, 4.5, 4.6, 9.1 |
| **Software Developer / IT Admin** | Sections 3, 5, 6, 7, 8, 11 |
| **System Evaluator / Panel** | All Sections |

### 1.4 Terminology and Definitions
- **POS:** Point of Sale terminal.
- **SKU:** Stock Keeping Unit (e.g., `PWR-DRL-001`, `CON-CMT-001`).
- **Reorder Level:** Minimum inventory threshold before triggering a restock notification.
- **VAT:** Value-Added Tax (12% applied to sales subtotal).
- **Void:** Transaction cancellation that reverses revenue and restores sold stock to the warehouse.
- **XAMPP:** Apache, MariaDB/MySQL, and PHP local development server stack.

---

## 2. System Overview

### 2.1 System Summary
The J&JAY POS & Inventory System combines a high-speed Single-Page Application (SPA) frontend built on **React 19 + TypeScript** with a lightweight, ACID-compliant **PHP PDO REST API** connected to **MariaDB/MySQL**.

Real-time synchronization between the cashier checkout terminal and the back-office dashboard is maintained via an automated **15-second background polling cycle**. If the backend server becomes unreachable, the client features an **offline fallback mode** using browser `localStorage` caching to guarantee continuity during network disruptions.

### 2.2 System Modules
- **Authentication Portal:** Operator identification, quick sample account sign-in, and role-based routing.
- **Executive Dashboard:** Live daily revenue metrics, daily transaction volume, average ticket value, warehouse asset valuation, low-stock count, real-time sales chart, and vendor delivery projection.
- **Inventory Control:** Full CRUD operations on products, category filtering with live counts, stock-level sorting, pagination, and stock threshold warnings.
- **POS Checkout Terminal:** Image-driven product grid, out-of-stock disabling, shopping cart with instant quantity controls, multi-tender modal (Cash, GCash/Maya, Card, Check), quick cash tenders, and pop-up receipt printing.
- **Sales History:** Audit trail of all sales, searchable across Order ID, customer, cashier, and item names. Supports full void operations with database-level rollback.
- **Reporting Center:** Performance metrics over custom date intervals, comparative revenue vs. projection charts, and PDF generation.
- **Supplier Directory:** Vendor catalog, payment terms (`COD`, `Net30`, `Net60`, `Net90`), performance ratings, and delivery lead times.
- **Alerts & Restocking Center:** Active stock alerts with a 1-tap `+20` quick restock button.
- **Global Search:** Topbar universal search across both the product catalog and historical sales.

### 2.3 User Role & Access Matrix
| Feature / Route | Route Path | Admin | Cashier |
|---|---|:---:|:---:|
| Login Page | `/login` | Yes | Yes |
| Operations Dashboard | `/` | Yes | No (Redirects to `/pos`) |
| Inventory Catalog | `/inventory` | Yes | No |
| POS Terminal | `/pos` | No (Redirects to `/`) | Yes |
| Sales History Ledger | `/sales` | Yes | Yes |
| Performance Reports | `/reports` | Yes | No |
| Supplier Directory | `/suppliers` | Yes | No |
| Notifications Center | `/notifications` | Yes | No |

---

## 3. System Architecture

### 3.1 Architectural Design
The solution is organized into a **Three-Tier Architecture**:

```
+-------------------------------------------------------------+
|                     PRESENTATION TIER                       |
|   React 19 + TypeScript + Tailwind CSS + Lucide Icons       |
|   State: AppContext (Global Store) + LocalStorage Cache     |
|   Server: Vite Dev Server (http://localhost:5173)           |
+-------------------------------------------------------------+
                              |
                     HTTP / JSON (REST)
                 (Polled every 15 seconds)
                              |
                              v
+-------------------------------------------------------------+
|                     APPLICATION / API TIER                  |
|   PHP 8 on Apache Web Server (XAMPP)                        |
|   Path: http://localhost/POS_inventory/api                  |
|   Endpoints: products.php, sales.php, suppliers.php, etc.   |
|   Features: PDO Prepared Statements, ACID Transactions      |
+-------------------------------------------------------------+
                              |
                    PDO MySQL Connection
                              |
                              v
+-------------------------------------------------------------+
|                         DATA TIER                           |
|   MariaDB / MySQL Server (XAMPP)                            |
|   Database: pos_inventory                                  |
|   Tables: products, suppliers, sales, sale_items, alerts    |
+-------------------------------------------------------------+
```

### 3.2 Technology Stack
- **Frontend Framework:** React 19.2 + TypeScript (strict typing)
- **Styling & Theme:** Tailwind CSS 4 with custom dark sidebar and brand orange (`#C2410C`) accents
- **Build & Development Tool:** Vite 8 with Babel React Compiler plugin
- **Client Routing:** React Router DOM 6.26
- **Data Visualization:** Recharts 2.12 (Interactive Line & Bar charts)
- **Icons:** Lucide React
- **Backend API:** PHP 8.x with PDO (PHP Data Objects)
- **Database Engine:** MariaDB 10.4+ / MySQL 8.0+ (InnoDB Engine)
- **Local Development Environment:** XAMPP for Windows

### 3.3 Project Structure
```
JAY-murag-final-najud-ni/
├── api/                     # PHP Backend REST API
│   ├── db.php               # PDO DB connection, CORS headers & JSON helper
│   ├── products.php         # Product CRUD & automated low-stock alert trigger
│   ├── sales.php            # Transactional sale recording & voiding
│   ├── suppliers.php        # Supplier directory CRUD
│   ├── alerts.php           # Inventory notifications query & dismissal
│   ├── init_tables.php      # Schema verification & creation
│   ├── fix_db.php           # Schema migration script (adds missing columns)
│   ├── populate_db.php      # Demo data seeder (120 products, 6 suppliers, 30-day sales)
│   └── seed_demo_data.php   # Alternative dataset seeder
├── docs/                    # System Documentation (.docx & .md)
│   ├── JJAY_POS_Inventory_System_Documentation.docx
│   └── SYSTEM_DOCUMENTATION.md
├── public/IMG/              # Product image assets organized by category (PWR, ELE, PLU, etc.)
├── logo/                    # Store branding (J&JAY.jpg)
├── src/
│   ├── assets/              # Logos and graphics
│   ├── components/
│   │   ├── auth/            # LoginForm.tsx
│   │   ├── dashboard/       # SalesChart.tsx, LowStockWidget.tsx, StatCard.tsx
│   │   ├── inventory/       # InventoryTable.tsx, AddProductModal.tsx, EditProductModal.tsx
│   │   ├── layout/          # MainLayout.tsx, Sidebar.tsx, Topbar.tsx
│   │   ├── pos/             # ProductGrid.tsx, CartPanel.tsx, CheckoutModal.tsx, Reciept.tsx
│   │   ├── suppliers/       # SupplierTable.tsx, SupplierForm.tsx
│   │   └── ui/              # Badge, Button, Card, Input, Modal
│   ├── contexts/            # AppContext.tsx (Global state, syncing, offline caching)
│   ├── data/                # In-memory datasets & utility calculations
│   ├── pages/               # Dashboard, Inventory, POS, SalesHistory, Reports, Supplier, Notifications, Login
│   ├── services/            # api.ts (HTTP client)
│   ├── App.tsx              # Route configuration & ProtectedRoute
│   └── main.tsx             # React DOM bootstrap
├── server/
│   ├── schema.sql           # Base MariaDB database schema
│   └── index.js             # Optional Node.js/Express API server
└── package.json             # NPM dependencies & scripts
```

---

## 4. Functional Modules

### 4.1 Authentication & Operator Login
- Dedicated login interface with custom numeric/text inputs.
- Quick auto-fill buttons for demo credentials:
  - **Admin:** `admin` / `admin123` (Access to Dashboard, Inventory, Reports, Suppliers, Notifications, Sales History).
  - **Cashier:** `cashier` / `cashier123` (Access to POS Terminal & Sales History).
- Operator sessions are persisted in browser memory and local storage.

### 4.2 Operations Dashboard
- **Live Revenue Cards:** Real-time computation of Today's Revenue, Daily Transactions, Average Order Ticket, and Total Catalog Retail Valuation.
- **Sales Analytics Chart:** Visual breakdown of sales performance over time.
- **Stock Attention Widget:** Direct overview of items currently breaching reorder limits with a shortcut to print procurement requirements.
- **Vendor Lead-Time Tracker:** Real-time tracking of top-performing suppliers with auto-calculated arrival dates for upcoming shipments.

### 4.3 Inventory Management
- **Catalog Management:** Add, edit, and soft-delete products. Form fields include Name, SKU, Category, Price, Cost Price, Quantity, Reorder Threshold, Supplier, and Image.
- **Sorting & Filtering:** Sort by stock levels (lowest-to-highest or highest-to-lowest); filter by 7 primary hardware categories with real-time SKU tallies.
- **Pagination:** Clean table presentation capped at 10 items per page.
- **Automatic Alert Synchronization:** Modifying stock immediately generates or clears corresponding low-stock alerts.

### 4.4 Point of Sale (POS) Terminal
- **Visual Product Grid:** Interactive product cards showing live stock counts, pricing, and category tags. Out-of-stock items are automatically disabled and greyed out.
- **Shopping Cart Panel:** Real-time subtotal, 12% VAT, and grand total calculations. Cashiers can increment, decrement, or purge cart items instantly.
- **Checkout Dialog:**
  - Customer name input (defaults to "Walk-in Customer"; input sanitization prevents accidental numbers).
  - Multi-Tender selection: Cash, GCash/Maya (Online), Credit/Debit Card, or Check.
  - Tender amount with live Change Due calculation.
  - Quick-cash preset shortcuts: Exact, ₱100, ₱500, ₱1,000.
  - Cash payment validation prevents completing sales with insufficient funds.

### 4.5 Customer Receipt
- Displays complete store details: J&JAY Hardware Balingasag, Transaction ID, Timestamp, Cashier Name, Customer Name, itemized product lines, Subtotal, 12% VAT, Total, Tendered, Change, and Payment Type.
- Built-in pop-up printer driver that opens a formatted receipt ready for physical thermal or standard 80mm printers.

### 4.6 Sales History & Transaction Voiding
- Search across Order ID, Cashier, Customer, or Product lines.
- Filter by payment method, status (completed vs. cancelled), and custom date ranges.
- **Transaction Reversal (Void):** Admins and Cashiers can void completed transactions. Voiding executes a database-level rollback that marks the sale as cancelled, restores item quantities to inventory, and cleans up resolved low-stock alerts.

### 4.7 Reports & Performance Analytics
- Configurable start and end date pickers.
- Dynamically switches visualization modes:
  - Single-day range: Hourly transaction buckets (08:00 to 20:00).
  - Multi-day range: Daily sales volume with target comparison projections.
- Top 10 revenue-generating products table.
- Direct Export to PDF or formatted printing.

### 4.8 Supplier Management
- Vendor directory with contact person, phone number, email, address, and city.
- Commercial parameters: Payment terms (`COD`, `Net30`, `Net60`, `Net90`), operational status, and average delivery duration in days.
- Input validation safeguards phone numbers and name formatting.

### 4.9 Notifications Center
- Real-time catalog health metric `((total - low_stock) / total * 100)`.
- Dedicated tabs for All Warnings, Low Stock, and Operational Alerts.
- **Quick Restock Action:** 1-click button on each alert card that instantly adds `+20` units to warehouse inventory.

---

## 5. Database Design

### 5.1 Database Specifications
- **Database Name:** `pos_inventory`
- **RDBMS:** MariaDB / MySQL
- **Collation:** `utf8mb4_unicode_ci`

### 5.2 Entity-Relationship Structure
```
+------------------+         +------------------+         +------------------+
|    SUPPLIERS     |         |     PRODUCTS     | 1     * |    SALE_ITEMS    |
+------------------+         +------------------+---------+------------------+
| id (PK)          |         | id (PK)          |         | id (PK, AI)      |
| name             | 1     * | name             |         | sale_id (FK)     |
| contact_person   |---------| sku (UNIQUE)     |         | product_id       |
| email            |         | category         |         | product_name     |
| phone            |         | price            |         | quantity         |
| payment_terms    |         | cost_price       |         | price            |
| rating           |         | quantity         |         +------------------+
+------------------+         | reorder_level    |                   | *
                             +------------------+                   |
                                      | 1                           | 1
                                      |                       +------------------+
                                      | *                     |      SALES       |
                             +------------------+             +------------------+
                             |      ALERTS      |             | id (PK)          |
                             +------------------+             | customer_name    |
                             | id (PK)          |             | total            |
                             | product_id       |             | tax              |
                             | type             |             | discount         |
                             | message          |             | payment_method   |
                             +------------------+             | amount_paid      |
                                                              | change_amount    |
                                                              | status           |
                                                              | cashier          |
                                                              +------------------+
```

### 5.3 Data Dictionary

#### 1. `products`
| Column | Type | Nullable | Key | Default | Description |
|---|---|:---:|:---:|---|---|
| `id` | VARCHAR(50) | NO | PK | — | Unique product identifier |
| `name` | VARCHAR(255) | NO | — | — | Full product title |
| `sku` | VARCHAR(100) | NO | UNI | — | Unique SKU code |
| `category` | VARCHAR(100) | YES | — | NULL | Category classification |
| `price` | DECIMAL(10,2) | NO | — | 0.00 | Retail selling price (PHP) |
| `cost_price` | DECIMAL(10,2) | YES | — | 0.00 | Wholesale acquisition cost |
| `quantity` | INT | YES | — | 0 | Available warehouse stock |
| `reorder_level` | INT | YES | — | 10 | Low stock threshold trigger |
| `supplier` | VARCHAR(255) | YES | — | NULL | Name of associated vendor |
| `description` | TEXT | YES | — | NULL | Detailed specifications |
| `image` | TEXT | YES | — | NULL | Image path or web URL |
| `created_at` | TIMESTAMP | YES | — | CURRENT_TIMESTAMP | Record creation timestamp |

#### 2. `sales`
| Column | Type | Nullable | Key | Default | Description |
|---|---|:---:|:---:|---|---|
| `id` | VARCHAR(50) | NO | PK | — | Sale ID (e.g. `SALE-1716...`) |
| `customer_name` | VARCHAR(255) | YES | — | 'Walk-in' | Customer reference |
| `total` | DECIMAL(12,2) | NO | — | — | Grand total amount |
| `tax` | DECIMAL(15,2) | YES | — | 0.00 | Calculated 12% VAT portion |
| `discount` | DECIMAL(10,2) | YES | — | 0.00 | Applied discount amount |
| `payment_method` | ENUM | NO | — | — | `'cash'`, `'card'`, `'check'`, `'online'` |
| `amount_paid` | DECIMAL(15,2) | YES | — | 0.00 | Customer tendered amount |
| `change_amount` | DECIMAL(15,2) | YES | — | 0.00 | Returned change |
| `cashier` | VARCHAR(100) | YES | — | 'Unknown' | Name of acting cashier |
| `notes` | TEXT | YES | — | NULL | Transaction remarks |
| `status` | ENUM | YES | — | 'completed' | `'completed'`, `'pending'`, `'cancelled'` |
| `created_at` | TIMESTAMP | YES | — | CURRENT_TIMESTAMP | Transaction timestamp |

#### 3. `sale_items`
| Column | Type | Nullable | Key | Default | Description |
|---|---|:---:|:---:|---|---|
| `id` | INT | NO | PK (AI) | — | Auto-incrementing line ID |
| `sale_id` | VARCHAR(50) | YES | FK | — | References `sales(id)` ON DELETE CASCADE |
| `product_id` | VARCHAR(50) | YES | — | — | Reference to product ID |
| `product_name` | VARCHAR(255) | YES | — | — | Snapshot of product title |
| `quantity` | INT | NO | — | — | Quantity purchased |
| `price` | DECIMAL(10,2) | NO | — | — | Unit price at time of sale |
| `unit_price` | DECIMAL(15,2) | YES | — | 0.00 | Unit price (extended) |
| `discount` | DECIMAL(5,2) | YES | — | 0.00 | Line-item discount |
| `total` | DECIMAL(15,2) | YES | — | 0.00 | Line-item total (qty * price) |

#### 4. `suppliers`
| Column | Type | Nullable | Key | Default | Description |
|---|---|:---:|:---:|---|---|
| `id` | VARCHAR(50) | NO | PK | — | Supplier ID (e.g. `SUP-001`) |
| `name` | VARCHAR(255) | NO | — | — | Vendor company name |
| `contact_person` | VARCHAR(255) | YES | — | NULL | Representative name |
| `email` | VARCHAR(255) | YES | — | NULL | Official email address |
| `phone` | VARCHAR(50) | YES | — | NULL | Contact phone number |
| `address` | TEXT | YES | — | NULL | Office street address |
| `city` | VARCHAR(100) | YES | — | NULL | City location |
| `state` | VARCHAR(100) | YES | — | NULL | Province / State |
| `zip_code` | VARCHAR(20) | YES | — | NULL | Postal Code |
| `country` | VARCHAR(100) | YES | — | NULL | Country name |
| `payment_terms` | ENUM | YES | — | 'Net30' | `'COD'`, `'Net30'`, `'Net60'`, `'Net90'` |
| `category` | TEXT | YES | — | NULL | Supplied merchandise categories |
| `status` | ENUM | YES | — | 'active' | `'active'`, `'inactive'`, `'blocked'` |
| `rating` | DECIMAL(3,2) | YES | — | 0.00 | Rating score (1.00 - 5.00) |
| `average_delivery_time`| INT | YES | — | 0 | Lead time in days |
| `created_at` | TIMESTAMP | YES | — | CURRENT_TIMESTAMP | Supplier registration date |

#### 5. `alerts`
| Column | Type | Nullable | Key | Default | Description |
|---|---|:---:|:---:|---|---|
| `id` | VARCHAR(50) | NO | PK | — | Alert ID (e.g. `ALT-a1b2c3d4`) |
| `product_id` | VARCHAR(50) | YES | — | — | Associated product ID |
| `type` | VARCHAR(50) | YES | — | 'low-stock' | Alert classification |
| `message` | TEXT | YES | — | NULL | Description of the alert |
| `created_at` | TIMESTAMP | YES | — | CURRENT_TIMESTAMP | Timestamp generated |

---

## 6. API Reference

All requests and responses use JSON. The base endpoint URL is:  
`http://localhost/POS_inventory/api`

### 6.1 Products API (`products.php`)
- `GET /products.php` — Returns all active products.
- `POST /products.php` — Creates a new product. Automatically generates a low-stock alert if `quantity <= reorder_level`.
- `PUT /products.php?id={id}` — Updates product fields. Clears low-stock alert if new quantity exceeds reorder level; creates alert if at or below.
- `DELETE /products.php?id={id}` — Permanently deletes a product.

### 6.2 Sales API (`sales.php`)
- `GET /sales.php` — Returns all historical sales including their nested `items[]` array.
- `POST /sales.php` — Atomically records a transaction. Inside a database transaction:
  1. Inserts into `sales`.
  2. Inserts line items into `sale_items`.
  3. Decrements `products.quantity`.
  4. Generates an alert in `alerts` if quantity breaches reorder level.
- `PUT /sales.php?id={id}` — Voids a transaction:
  1. Marks status as `cancelled`.
  2. Increments `products.quantity` by the sold amounts.
  3. Deletes low-stock alerts if stock levels recover.

### 6.3 Suppliers API (`suppliers.php`)
- `GET /suppliers.php` — Returns all registered vendor profiles.
- `POST /suppliers.php` — Adds a new vendor profile.
- `PUT /suppliers.php?id={id}` — Updates supplier information.
- `DELETE /suppliers.php?id={id}` — Removes a vendor profile.

### 6.4 Alerts API (`alerts.php`)
- `GET /alerts.php` — Returns current active inventory alerts.
- `DELETE /alerts.php?id={id}` — Dismisses a single alert.
- `DELETE /alerts.php?id=all` — Clears all system alerts.

### 6.5 Database Seeding & Maintenance Utilities
- `GET /fix_db.php` — Automatic database migration that alters existing tables to ensure all modern columns exist.
- `POST /populate_db.php` — Flushes all database tables and seeds 120 products (20 per category), 6 suppliers, 30 days of sales history, and active alerts.

---

## 7. Installation and Setup Guide

### 7.1 Prerequisites
1. **XAMPP for Windows** (with Apache, PHP 8+, and MySQL/MariaDB).
2. **Node.js** (v18.0 or higher) and **npm**.
3. Modern web browser (Google Chrome, Microsoft Edge, or Mozilla Firefox).

### 7.2 Backend & Database Setup
1. Launch **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Deploy the backend API files:
   - Navigate to `C:\xampp\htdocs\`.
   - Create a folder named `POS_inventory`.
   - Copy the `api` folder from the project into `C:\xampp\htdocs\POS_inventory\api\`.
3. Import the database schema:
   - Open your browser to `http://localhost/phpmyadmin`.
   - Click on the **Import** tab.
   - Choose `server/schema.sql` from the repository and click **Import**.
4. Verify & update the table schema:
   - Open `http://localhost/POS_inventory/api/fix_db.php` in your browser.
   - You should see: `{"success": true, "message": "Database schema updated successfully!"}`.
5. (Optional) Populate demo inventory and transaction history:
   - Open `http://localhost/POS_inventory/api/populate_db.php`.

### 7.3 Frontend Setup & Execution
1. Open a terminal in the root project folder:
   ```powershell
   cd c:\Users\Lenovo\Desktop\JAY-murag-final-najud-ni
   ```
2. Install frontend dependencies:
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. Open the application in your browser:
   ```
   http://localhost:5173
   ```
5. Sign in using the demo accounts:
   - **Admin:** `admin` / `admin123`
   - **Cashier:** `cashier` / `cashier123`

---

## 8. Configuration

| Setting | File Location | Default Value | Notes |
|---|---|---|---|
| API Base URL | `src/services/api.ts` | `http://localhost/POS_inventory/api` | Points to the local XAMPP Apache endpoint |
| DB Host | `api/db.php` | `localhost` | MariaDB server address |
| DB Name | `api/db.php` | `pos_inventory` | Target database |
| DB User / Password | `api/db.php` | `root` / `""` (empty) | Standard XAMPP default credentials |
| Polling Interval | `src/contexts/AppContext.tsx` | `15000` (15 seconds) | Background sync rate for live cashier sales |
| Tax Rate (VAT) | `src/components/pos/CheckoutModal.tsx` | `0.12` (12%) | Philippine Value Added Tax rate |
| Pagination Limit | `src/components/inventory/InventoryTable.tsx` | `10` items | Table rows per page |
| Quick Restock Qty | `src/pages/Notifications.tsx` | `20` units | Amount added per 1-click restock |

---

## 9. User Guide — Standard Procedures

### 9.1 Processing a POS Sale (Cashier)
1. Sign in with the **Cashier** account (`cashier` / `cashier123`).
2. Search products using the top search bar or category pills.
3. Click any product to add it to the cart.
4. Adjust quantities or remove unwanted items in the right-side Cart Panel.
5. Click **Proceed to Checkout**.
6. (Optional) Enter the customer's name (defaults to "Walk-in").
7. Select a payment method:
   - **Cash:** Enter the tendered amount or click a Quick Cash shortcut (Exact, ₱100, ₱500, ₱1,000). Verify the change due.
   - **GCash/Maya, Card, or Check:** The system auto-fills the exact total.
8. Click **Complete Sale**.
9. The receipt displays on screen. Click **Print Receipt** to open the print dialog.
10. Click **Close** to return to a clean POS terminal.

### 9.2 Adding a New Product (Admin)
1. Sign in with the **Admin** account (`admin` / `admin123`).
2. Navigate to **Inventory** in the sidebar.
3. Click the orange **Add New Product** button in the upper right.
4. Fill in product details: Name, SKU, Category, Price, Cost Price, Quantity, Reorder Level, and Supplier.
5. Click **Save Product**. The product immediately appears in inventory and POS terminals.

### 9.3 Voiding / Cancelling a Transaction
1. Go to **Sales History** in the sidebar.
2. Locate the target transaction using the search bar or filters.
3. Click the red **Void** button on the transaction row.
4. Confirm the prompt. The sale status changes to `cancelled`, total revenue updates, and inventory stock is restored.

### 9.4 Generating Performance Reports (Admin)
1. Navigate to **Reports** in the sidebar.
2. Adjust the **Start Date** and **End Date** filters.
3. Review the KPI cards, sales vs. projection chart, and top 10 products table.
4. Click **Export PDF** or **Print Report** to generate a clean, branded hard copy.

---

## 10. Business Rules and Computations

1. **Subtotal:**  
   $$\text{Subtotal} = \sum (\text{item unit price} \times \text{item quantity})$$
2. **Value Added Tax (12%):**  
   $$\text{VAT} = \text{Subtotal} \times 0.12$$
3. **Total Amount Due:**  
   $$\text{Total} = \text{Subtotal} + \text{VAT} - \text{Discount}$$
4. **Change Calculation:**  
   $$\text{Change} = \text{Amount Paid} - \text{Total}$$
   *(Cash transactions require $\text{Amount Paid} \ge \text{Total}$)*
5. **Low Stock Condition:**  
   $$\text{Quantity} \le \text{Reorder Level}$$
6. **Catalog Health Metric:**  
   $$\text{Catalog Health} = \frac{\text{Total SKUs} - \text{Low Stock SKUs}}{\text{Total SKUs}} \times 100\%$$
7. **Average Order Value (AOV):**  
   $$\text{AOV} = \frac{\text{Total Completed Sales Revenue}}{\text{Count of Completed Transactions}}$$
8. **Inventory Asset Value:**  
   $$\text{Total Valuation} = \sum (\text{Product Selling Price} \times \text{Product Quantity})$$

---

## 11. Security Considerations and Known Limitations

1. **Client-Side Auth Verification:** Current login credentials are validated in the frontend `LoginForm.tsx` against demo presets. In production, authentication should use bcrypt-hashed passwords in a `users` table with JWT or session cookies.
2. **Unrestricted CORS:** `api/db.php` includes `Access-Control-Allow-Origin: *`. In production, restrict this header to the authorized domain name.
3. **Direct Database Seeder Access:** `populate_db.php` truncates tables upon execution. Access to this script should be restricted or removed in production environments.
4. **Stock Validation at Checkout:** The POS interface disables adding 0-quantity items to the cart; server-side locking during concurrent high-volume checkouts should be added for enterprise deployments.

---

## 12. Future Enhancements

- **Barcode Scanner Integration:** USB and Bluetooth HID barcode scanner integration for automatic cart population.
- **Official BIR Cash Register Integration:** Formatting receipts to meet Bureau of Internal Revenue (BIR) POS machine registration requirements.
- **Purchase Order Tracking:** Dedicated interface for generating POs directly to suppliers when items reach reorder levels.
- **Stock Movement Log:** Detailed audit ledger logging who restocked, sold, or adjusted items with timestamps.
- **Multi-Branch Support:** Support for multiple store branches and centralized warehouse replenishment.

---

## Appendix A. Demo Data Summary

The built-in demo database seeder (`api/populate_db.php`) provides:
- **6 Hardware Categories:** Power Tools, Electrical, Plumbing, Construction, Fasteners, Painting.
- **120 Distinct Products:** 20 items per category with realistic Philippine Peso pricing, cost prices, and high-resolution product photography.
- **6 Local Suppliers:** Complete supplier entries with Philippine addresses, phone numbers, and payment terms.
- **30-Day Historical Sales:** Realistic transaction patterns with higher volume on weekends, varied payment methods, customer names, cashiers, and 12% VAT calculations.
- **Simulated Stock Alerts:** Several items pre-configured below reorder levels to demonstrate notification workflows.

---

## Appendix B. Source File Index

| File Path | Description |
|---|---|
| [`src/App.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/App.tsx) | Master router and role authentication guards |
| [`src/contexts/AppContext.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/contexts/AppContext.tsx) | Application state store, real-time polling, and offline cache |
| [`src/services/api.ts`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/services/api.ts) | HTTP client mapping frontend methods to PHP API endpoints |
| [`src/pages/Dashboard.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/pages/Dashboard.tsx) | Executive Operations Dashboard |
| [`src/pages/Inventory.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/pages/Inventory.tsx) | Warehouse catalog management and valuation |
| [`src/pages/POS.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/pages/POS.tsx) | Cashier Point of Sale Terminal |
| [`src/pages/SalesHistory.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/pages/SalesHistory.tsx) | Audit ledger and sale voiding logic |
| [`src/pages/Reports.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/pages/Reports.tsx) | Periodic sales analytics and PDF export |
| [`src/pages/Supplier.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/pages/Supplier.tsx) | Vendor management and performance rating |
| [`src/pages/Notifications.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/pages/Notifications.tsx) | Alert center and 1-click batch restock |
| [`src/components/pos/CheckoutModal.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/components/pos/CheckoutModal.tsx) | Multi-tender payment and VAT processing modal |
| [`src/components/pos/Reciept.tsx`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/src/components/pos/Reciept.tsx) | Customer receipt layout and print handler |
| [`api/db.php`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/api/db.php) | PDO connection, error handling, and CORS utilities |
| [`api/sales.php`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/api/sales.php) | Transactional checkout and void rollback controller |
| [`api/products.php`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/api/products.php) | Product catalog endpoint with auto-alert triggers |
| [`server/schema.sql`](file:///c:/Users/Lenovo/Desktop/JAY-murag-final-najud-ni/server/schema.sql) | Base database schema definition for MariaDB/MySQL |
