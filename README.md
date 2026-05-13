# Hardware Pro - POS & Inventory System

A comprehensive Point of Sale (POS) and inventory management system built for hardware stores and construction material suppliers.

## Features

### 🏪 Point of Sale (POS)
- Real-time product search and selection
- Shopping cart management
- Multiple payment methods (Cash, Card, Check, Online)
- Receipt generation and printing
- Tax calculation and discounts

### 📦 Inventory Management
- Product catalog with categories
- Stock level tracking and alerts
- Low stock notifications
- Stock movement history
- Supplier management
- Automatic reorder alerts

### 📊 Dashboard & Reports
- Real-time sales dashboard
- Weekly/monthly sales charts
- Top-selling products analysis
- Inventory value reports
- Supplier performance metrics
- Daily sales summaries

### 👥 Supplier Management
- Supplier directory
- Purchase order tracking
- Payment management
- Supplier ratings and reviews
- Delivery performance monitoring

### 🔔 Notifications
- Low stock alerts
- System notifications
- Inventory alerts management

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS (custom dark theme)
- **Build Tool**: Vite
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd POS_inventory
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Demo Accounts

**Admin Access:**
- Email: `admin@hardware.com`
- Password: `admin123`

**Cashier Access:**
- Email: `cashier@hardware.com`
- Password: `cashier123`

## Project Structure

```
POS_inventory/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard widgets
│   ├── inventory/      # Inventory management
│   ├── layout/         # App layout components
│   ├── pages/          # Page components
│   ├── pos/            # POS terminal components
│   ├── suppliers/      # Supplier management
│   └── ui/             # Reusable UI components
├── data/               # In-memory data stores
│   ├── inventory.ts    # Product & inventory data
│   ├── sales.ts        # Sales & transactions
│   └── supplier.ts     # Supplier & purchase orders
├── contexts/           # React contexts for state management
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## Key Features Implementation

### Data Management
- In-memory data stores (easily replaceable with database)
- CRUD operations for all entities
- Data validation and error handling
- Real-time updates across components

### State Management
- React Context API for global state
- Centralized data access functions
- Automatic UI updates on data changes

### UI/UX Design
- Dark theme optimized for retail environments
- Responsive design for various screen sizes
- Intuitive navigation and workflows
- Real-time data visualization

## API Reference

### Inventory Management
- `addProduct(product)` - Add new product
- `getAllProducts()` - Get all products
- `updateProduct(id, updates)` - Update product
- `deleteProduct(id)` - Delete product
- `searchProducts(query)` - Search products
- `addStock(productId, quantity)` - Add stock
- `removeStock(productId, quantity)` - Remove stock

### Sales Management
- `createSale(items, paymentMethod, amountPaid)` - Create sale
- `getAllSales()` - Get all sales
- `getDailyReport(date)` - Get daily sales report
- `getSalesReport(startDate, endDate)` - Get sales report

### Supplier Management
- `addSupplier(supplier)` - Add new supplier
- `getAllSuppliers()` - Get all suppliers
- `updateSupplier(id, updates)` - Update supplier
- `createPurchaseOrder(supplierId, items)` - Create PO

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication & authorization
- [ ] Barcode scanning integration
- [ ] Receipt printing
- [ ] Email notifications
- [ ] Multi-store support
- [ ] Mobile app companion
- [ ] Advanced reporting & analytics
- [ ] API endpoints for external integrations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on the GitHub repository.

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
