// Sales and Transaction types
export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number; // amount
  total: number;
  paymentMethod: 'cash' | 'card' | 'check' | 'online';
  amountPaid: number;
  change: number;
  status: 'completed' | 'pending' | 'cancelled';
  saleDate: Date;
  customerName?: string;
  cashier?: string;
  notes?: string;
  reference?: string;
}

export interface DailyReport {
  date: Date;
  totalSales: number;
  totalTransactions: number;
  totalItems: number;
  totalTax: number;
  paymentBreakdown: {
    cash: number;
    card: number;
    check: number;
    online: number;
  };
  topProducts: Array<{ productId: string; productName: string; quantity: number }>;
}

export interface Receipt {
  saleId: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  change: number;
  saleDate: Date;
  paymentMethod: string;
  receiptNumber: string;
  cashier?: string;
}

// In-memory storage
let sales: Sale[] = [
  {
    id: '#TXN-98421',
    items: [
      {
        productId: 'drill-1',
        productName: 'DeWalt Cordless Drill',
        quantity: 2,
        unitPrice: 174.5,
        discount: 0,
        total: 349,
      },
    ],
    subtotal: 349,
    tax: 0,
    discount: 0,
    total: 349,
    paymentMethod: 'card',
    amountPaid: 349,
    change: 0,
    status: 'completed',
    saleDate: new Date(),
    customerName: 'Alex Johnson',
    cashier: 'Store Manager',
  },
  {
    id: '#TXN-98420',
    items: [
      {
        productId: 'pipe-1',
        productName: 'Galvanized Steel Pipe 2m',
        quantity: 1,
        unitPrice: 1120.45,
        discount: 0,
        total: 1120.45,
      },
    ],
    subtotal: 1120.45,
    tax: 0,
    discount: 0,
    total: 1120.45,
    paymentMethod: 'cash',
    amountPaid: 1200,
    change: 79.55,
    status: 'completed',
    saleDate: new Date(Date.now() - 3600000),
    customerName: 'Commercial Build Co.',
    cashier: 'Store Manager',
  },
  {
    id: '#TXN-98419',
    items: [
      {
        productId: 'nails-1',
        productName: 'Bulk Masonry Nails (50kg)',
        quantity: 1,
        unitPrice: 85.2,
        discount: 0,
        total: 85.2,
      },
    ],
    subtotal: 85.2,
    tax: 0,
    discount: 0,
    total: 85.2,
    paymentMethod: 'online',
    amountPaid: 85.2,
    change: 0,
    status: 'pending',
    saleDate: new Date(Date.now() - 7200000),
    customerName: 'Sarah Miller',
    cashier: 'Store Manager',
  },
];
let TAX_RATE = 0.1; // 10% tax

// ============= SALE CREATION & MANAGEMENT =============

/**
 * Create a new sale/transaction
 */
export const createSale = (
  items: SaleItem[],
  paymentMethod: 'cash' | 'card' | 'check' | 'online',
  amountPaid: number,
  discountAmount: number = 0,
  cashier?: string,
  notes?: string
): Sale | null => {
  if (items.length === 0) return null;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax - discountAmount;

  // Validate payment
  if (amountPaid < total) return null;

  const sale: Sale = {
    id: generateId(),
    items,
    subtotal,
    tax,
    discount: discountAmount,
    total,
    paymentMethod,
    amountPaid,
    change: amountPaid - total,
    status: 'completed',
    saleDate: new Date(),
    cashier,
    notes,
  };

  sales.push(sale);
  return sale;
};

/**
 * Get sale by ID
 */
export const getSale = (saleId: string): Sale | undefined => {
  return sales.find(s => s.id === saleId);
};

/**
 * Get all sales
 */
export const getAllSales = (): Sale[] => {
  return [...sales];
};

/**
 * Cancel a sale
 */
export const cancelSale = (saleId: string): Sale | null => {
  const sale = sales.find(s => s.id === saleId);
  if (!sale) return null;

  sale.status = 'cancelled';
  return sale;
};

/**
 * Refund a sale
 */
export const refundSale = (saleId: string, partialAmount?: number): {
  originalSale: Sale;
  refundAmount: number;
  success: boolean;
} | null => {
  const sale = sales.find(s => s.id === saleId);
  if (!sale || sale.status === 'cancelled') return null;

  const refundAmount = partialAmount || sale.total;

  if (refundAmount > sale.total) {
    return null;
  }

  sale.status = 'cancelled';

  return {
    originalSale: sale,
    refundAmount,
    success: true,
  };
};

// ============= SALES LINE ITEMS =============

/**
 * Calculate line item total
 */
export const calculateLineItem = (
  quantity: number,
  unitPrice: number,
  discount: number = 0
): number => {
  const subtotal = quantity * unitPrice;
  const discountAmount = (subtotal * discount) / 100;
  return subtotal - discountAmount;
};

/**
 * Create a sale item
 */
export const createSaleItem = (
  productId: string,
  productName: string,
  quantity: number,
  unitPrice: number,
  discount: number = 0
): SaleItem => {
  const total = calculateLineItem(quantity, unitPrice, discount);

  return {
    productId,
    productName,
    quantity,
    unitPrice,
    discount,
    total,
  };
};

// ============= RECEIPTS =============

/**
 * Generate receipt from sale
 */
export const generateReceipt = (saleId: string): Receipt | null => {
  const sale = sales.find(s => s.id === saleId);
  if (!sale) return null;

  return {
    saleId: sale.id,
    items: sale.items,
    subtotal: sale.subtotal,
    tax: sale.tax,
    discount: sale.discount,
    total: sale.total,
    amountPaid: sale.amountPaid,
    change: sale.change,
    saleDate: sale.saleDate,
    paymentMethod: sale.paymentMethod,
    receiptNumber: `RCP-${sale.id.substring(0, 8).toUpperCase()}`,
    cashier: sale.cashier,
  };
};

/**
 * Print receipt as formatted string
 */
export const formatReceipt = (receipt: Receipt): string => {
  const lines: string[] = [];
  const width = 40;

  lines.push('='.repeat(width));
  lines.push('POS RECEIPT'.padStart(width / 2 + 5));
  lines.push('='.repeat(width));
  lines.push('');

  lines.push(`Receipt #: ${receipt.receiptNumber}`);
  lines.push(`Date: ${receipt.saleDate.toLocaleString()}`);
  if (receipt.cashier) {
    lines.push(`Cashier: ${receipt.cashier}`);
  }
  lines.push('');

  lines.push('-'.repeat(width));
  lines.push(`${'Item'.padEnd(20)} ${'Qty'.padEnd(5)} ${'Price'.padEnd(8)}`);
  lines.push('-'.repeat(width));

  receipt.items.forEach(item => {
    lines.push(
      `${item.productName.substring(0, 20).padEnd(20)} ${item.quantity.toString().padEnd(5)} $${item.total.toFixed(2).padEnd(7)}`
    );
  });

  lines.push('-'.repeat(width));
  lines.push(`Subtotal: $${receipt.subtotal.toFixed(2).padStart(30)}`);
  lines.push(`Tax: $${receipt.tax.toFixed(2).padStart(35)}`);

  if (receipt.discount > 0) {
    lines.push(`Discount: -$${receipt.discount.toFixed(2).padStart(28)}`);
  }

  lines.push('='.repeat(width));
  lines.push(`Total: $${receipt.total.toFixed(2).padStart(33)}`);
  lines.push(`Paid: $${receipt.amountPaid.toFixed(2).padStart(33)}`);
  lines.push(`Change: $${receipt.change.toFixed(2).padStart(31)}`);
  lines.push('='.repeat(width));
  lines.push(`Payment: ${receipt.paymentMethod.toUpperCase()}`);
  lines.push('');
  lines.push('Thank you for your purchase!'.padStart(width / 2 + 14));

  return lines.join('\n');
};

// ============= SALES REPORTS =============

/**
 * Get daily sales report
 */
export const getDailyReport = (date: Date): DailyReport => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const daySales = sales.filter(
    s => s.saleDate >= startDate && s.saleDate <= endDate && s.status === 'completed'
  );

  let totalSales = 0;
  let totalTax = 0;
  const paymentBreakdown = { cash: 0, card: 0, check: 0, online: 0 };
  const productSales = new Map<string, { productId: string; productName: string; quantity: number }>();

  daySales.forEach(sale => {
    totalSales += sale.total;
    totalTax += sale.tax;
    paymentBreakdown[sale.paymentMethod] += sale.amountPaid;

    sale.items.forEach(item => {
      const key = item.productId;
      if (productSales.has(key)) {
        const existing = productSales.get(key)!;
        existing.quantity += item.quantity;
      } else {
        productSales.set(key, {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
        });
      }
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    date,
    totalSales,
    totalTransactions: daySales.length,
    totalItems: daySales.reduce((sum, s) => sum + s.items.reduce((itemSum, i) => itemSum + i.quantity, 0), 0),
    totalTax,
    paymentBreakdown,
    topProducts,
  };
};

/**
 * Get sales report for date range
 */
export const getSalesReport = (
  startDate: Date,
  endDate: Date
): {
  period: { start: Date; end: Date };
  totalSales: number;
  totalTransactions: number;
  totalItems: number;
  totalTax: number;
  averageTransaction: number;
  paymentBreakdown: { [key: string]: number };
} => {
  const periodSales = sales.filter(
    s => s.saleDate >= startDate && s.saleDate <= endDate && s.status === 'completed'
  );

  let totalSales = 0;
  let totalTax = 0;
  let totalItems = 0;
  const paymentBreakdown: { [key: string]: number } = { cash: 0, card: 0, check: 0, online: 0 };

  periodSales.forEach(sale => {
    totalSales += sale.total;
    totalTax += sale.tax;
    totalItems += sale.items.reduce((sum, i) => sum + i.quantity, 0);
    paymentBreakdown[sale.paymentMethod] = (paymentBreakdown[sale.paymentMethod] || 0) + sale.amountPaid;
  });

  return {
    period: { start: startDate, end: endDate },
    totalSales,
    totalTransactions: periodSales.length,
    totalItems,
    totalTax,
    averageTransaction: periodSales.length > 0 ? totalSales / periodSales.length : 0,
    paymentBreakdown,
  };
};

/**
 * Get hourly sales breakdown
 */
export const getHourlySalesBreakdown = (date: Date): Array<{
  hour: number;
  sales: number;
  transactions: number;
}> => {
  const hourlyData = new Map<number, { sales: number; transactions: number }>();

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  sales.forEach(sale => {
    if (sale.saleDate >= startDate && sale.saleDate <= endDate && sale.status === 'completed') {
      const hour = sale.saleDate.getHours();
      const existing = hourlyData.get(hour) || { sales: 0, transactions: 0 };

      existing.sales += sale.total;
      existing.transactions += 1;

      hourlyData.set(hour, existing);
    }
  });

  const result: Array<{ hour: number; sales: number; transactions: number }> = [];
  for (let i = 0; i < 24; i++) {
    result.push({
      hour: i,
      sales: hourlyData.get(i)?.sales || 0,
      transactions: hourlyData.get(i)?.transactions || 0,
    });
  }

  return result;
};

/**
 * Get payment method breakdown
 */
export const getPaymentMethodBreakdown = (
  startDate: Date,
  endDate: Date
): {
  method: string;
  count: number;
  total: number;
  percentage: number;
}[] => {
  const methods = { cash: 0, card: 0, check: 0, online: 0 };
  const methodTotals = { cash: 0, card: 0, check: 0, online: 0 };

  let grandTotal = 0;

  sales.forEach(sale => {
    if (sale.saleDate >= startDate && sale.saleDate <= endDate && sale.status === 'completed') {
      methods[sale.paymentMethod]++;
      methodTotals[sale.paymentMethod] += sale.total;
      grandTotal += sale.total;
    }
  });

  return Object.entries(methods).map(([method, count]) => ({
    method,
    count,
    total: methodTotals[method as keyof typeof methodTotals],
    percentage: grandTotal > 0 ? (methodTotals[method as keyof typeof methodTotals] / grandTotal) * 100 : 0,
  }));
};

/**
 * Get top selling products
 */
export const getTopSellingProducts = (
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Array<{
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}> => {
  const productMap = new Map<
    string,
    { productId: string; productName: string; quantity: number; revenue: number }
  >();

  sales.forEach(sale => {
    if (sale.saleDate >= startDate && sale.saleDate <= endDate && sale.status === 'completed') {
      sale.items.forEach(item => {
        const existing = productMap.get(item.productId) || {
          productId: item.productId,
          productName: item.productName,
          quantity: 0,
          revenue: 0,
        };

        existing.quantity += item.quantity;
        existing.revenue += item.total;

        productMap.set(item.productId, existing);
      });
    }
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

// ============= TAX & PRICING =============

/**
 * Set tax rate
 */
export const setTaxRate = (rate: number): void => {
  TAX_RATE = rate;
};

/**
 * Get tax rate
 */
export const getTaxRate = (): number => {
  return TAX_RATE;
};

/**
 * Calculate price with tax
 */
export const calculateWithTax = (amount: number): number => {
  return amount * (1 + TAX_RATE);
};

/**
 * Calculate tax amount
 */
export const calculateTaxAmount = (amount: number): number => {
  return amount * TAX_RATE;
};

// ============= UTILITY FUNCTIONS =============

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get total sales count
 */
export const getTotalSalesCount = (): number => {
  return sales.filter(s => s.status === 'completed').length;
};

/**
 * Get total revenue
 */
export const getTotalRevenue = (): number => {
  return sales
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.total, 0);
};

/**
 * Search sales by reference or notes
 */
export const searchSales = (query: string): Sale[] => {
  const lowerQuery = query.toLowerCase();
  return sales.filter(
    s =>
      s.reference?.toLowerCase().includes(lowerQuery) ||
      s.notes?.toLowerCase().includes(lowerQuery) ||
      s.cashier?.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get sales for a specific cashier
 */
export const getSalesByCashier = (cashier: string): Sale[] => {
  return sales.filter(s => s.cashier === cashier && s.status === 'completed');
};

/**
 * Export/Import functions for persistence
 */
export const exportSales = () => {
  return { sales, TAX_RATE };
};

export const importSales = (data: { sales: Sale[]; TAX_RATE: number }) => {
  sales = data.sales;
  TAX_RATE = data.TAX_RATE;
};

/**
 * Clear all sales (use carefully)
 */
export const clearAllSales = (): void => {
  sales = [];
};
