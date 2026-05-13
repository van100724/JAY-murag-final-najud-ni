// Product and Inventory types
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  quantity: number;
  reorderLevel: number;
  supplier: string;
  description?: string;
  image?: string;
  lastRestockDate?: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  date: Date;
  reason: string;
  reference?: string;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  type: 'low-stock' | 'overstock' | 'expired';
  message: string;
  createdAt: Date;
}

// In-memory storage (replace with database in production)
// In-memory storage (replace with database in production)
let products: Product[] = [
  // HAND TOOLS
  {
    id: '1',
    name: 'Industrial Claw Hammer 16oz',
    sku: 'HTL-HAM-001',
    category: 'Hand Tools',
    price: 450,
    costPrice: 280,
    quantity: 34,
    reorderLevel: 10,
    supplier: 'ABC Hardware Supplies',
    description: '16oz forged steel claw hammer with anti-vibration grip',
    image: 'https://images.unsplash.com/photo-1586864387917-f53bc264434a?w=600&h=600&fit=crop',
  },
  {
    id: '7',
    name: 'Precision Tape Measure 8m',
    sku: 'HTL-TPE-007',
    category: 'Hand Tools',
    price: 280,
    costPrice: 150,
    quantity: 45,
    reorderLevel: 15,
    supplier: 'ABC Hardware Supplies',
    description: 'High-visibility 8-meter retractable steel tape measure',
    image: 'https://images.unsplash.com/photo-1586864387789-628af9fea93f?w=600&h=600&fit=crop',
  },
  {
    id: '25',
    name: 'Adjustable Wrench 12"',
    sku: 'HTL-WRN-025',
    category: 'Hand Tools',
    price: 650,
    costPrice: 420,
    quantity: 18,
    reorderLevel: 5,
    supplier: 'ABC Hardware Supplies',
    description: 'Chrome vanadium steel adjustable wrench, 12-inch',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=600&fit=crop',
  },

  // POWER TOOLS
  {
    id: '4',
    name: 'Brushless Cordless Drill 18V',
    sku: 'PWR-DRL-004',
    category: 'Power Tools',
    price: 4850,
    costPrice: 3200,
    quantity: 12,
    reorderLevel: 5,
    supplier: 'PowerTools Depot',
    description: 'High-torque 18V brushless drill with 2x 4.0Ah batteries',
    image: 'https://images.unsplash.com/photo-1504148455328-4972fefebfee?w=600&h=600&fit=crop',
  },
  {
    id: '19',
    name: 'Professional Angle Grinder 4"',
    sku: 'PWR-GRN-019',
    category: 'Power Tools',
    price: 3200,
    costPrice: 2100,
    quantity: 15,
    reorderLevel: 4,
    supplier: 'PowerTools Depot',
    description: '900W professional angle grinder with safety guard',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop',
  },
  {
    id: '26',
    name: 'Circular Saw 1500W',
    sku: 'PWR-SAW-026',
    category: 'Power Tools',
    price: 5400,
    costPrice: 3800,
    quantity: 8,
    reorderLevel: 2,
    supplier: 'PowerTools Depot',
    description: 'Heavy duty circular saw with laser guide',
    image: 'https://images.unsplash.com/photo-1530124560676-41bc1275d4d4?w=600&h=600&fit=crop',
  },

  // CONSTRUCTION & BULK
  {
    id: '5',
    name: 'Premium Portland Cement 40kg',
    sku: 'CON-CMT-005',
    category: 'Construction',
    price: 285,
    costPrice: 240,
    quantity: 450,
    reorderLevel: 100,
    supplier: 'BuildPro Materials',
    description: 'Standard Type 1P Portland cement for general construction',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=600&fit=crop',
  },
  {
    id: '22',
    name: 'Steel Rebar 10mm x 6m',
    sku: 'CON-RBR-022',
    category: 'Construction',
    price: 245,
    costPrice: 190,
    quantity: 800,
    reorderLevel: 200,
    supplier: 'BuildPro Materials',
    description: 'Grade 33 structural steel rebar, 10mm diameter',
    image: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=600&h=600&fit=crop',
  },
  {
    id: '27',
    name: 'Hollow Block 4" Standard',
    sku: 'CON-BLK-027',
    category: 'Construction',
    price: 15,
    costPrice: 11,
    quantity: 2500,
    reorderLevel: 500,
    supplier: 'BuildPro Materials',
    description: 'Load-bearing concrete hollow block, 4-inch width',
    image: 'https://images.unsplash.com/photo-1517646281554-aa63e1672323?w=600&h=600&fit=crop',
  },

  // PLUMBING
  {
    id: '2',
    name: 'PVC Pipe 2" (Schedule 40)',
    sku: 'PLU-PVC-002',
    category: 'Plumbing',
    price: 480,
    costPrice: 350,
    quantity: 120,
    reorderLevel: 30,
    supplier: 'BuildPro Materials',
    description: 'Blue PVC pipe for water main lines, 10ft length',
    image: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=600&h=600&fit=crop',
  },
  {
    id: '21',
    name: 'Modern Kitchen Faucet',
    sku: 'PLU-FCT-021',
    category: 'Plumbing',
    price: 2450,
    costPrice: 1600,
    quantity: 14,
    reorderLevel: 5,
    supplier: 'BuildPro Materials',
    description: 'Brushed nickel single-handle pull-down kitchen faucet',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=600&fit=crop',
  },
  {
    id: '28',
    name: 'Teflon Tape 1/2"',
    sku: 'PLU-TFE-028',
    category: 'Plumbing',
    price: 25,
    costPrice: 12,
    quantity: 300,
    reorderLevel: 50,
    supplier: 'BuildPro Materials',
    description: 'Thread seal tape for plumbing joints',
    image: 'https://images.unsplash.com/photo-1595467795023-ec64c581297e?w=600&h=600&fit=crop',
  },

  // ELECTRICAL
  {
    id: '6',
    name: 'LED Bulb 12W (Daylight)',
    sku: 'ELE-LGT-006',
    category: 'Electrical',
    price: 185,
    costPrice: 110,
    quantity: 240,
    reorderLevel: 50,
    supplier: 'Lumina Tech',
    description: 'Energy-saving 12W LED bulb, 6500K cool daylight',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&h=600&fit=crop',
  },
  {
    id: '15',
    name: 'Heavy Duty Extension 10m',
    sku: 'ELE-EXT-015',
    category: 'Electrical',
    price: 850,
    costPrice: 520,
    quantity: 28,
    reorderLevel: 10,
    supplier: 'Lumina Tech',
    description: '10-meter extension cord with 3-way outlet and surge protection',
    image: 'https://images.unsplash.com/photo-1558538337-aab28236224d?w=600&h=600&fit=crop',
  },
  {
    id: '29',
    name: 'THHN Wire 2.0mm (150m)',
    sku: 'ELE-WRE-029',
    category: 'Electrical',
    price: 3400,
    costPrice: 2800,
    quantity: 15,
    reorderLevel: 3,
    supplier: 'Lumina Tech',
    description: 'Stranded copper electrical wire, 150-meter roll',
    image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&h=600&fit=crop',
  },

  // PAINTING
  {
    id: '3',
    name: 'Professional Roller Set',
    sku: 'PNT-RLR-003',
    category: 'Painting',
    price: 320,
    costPrice: 180,
    quantity: 42,
    reorderLevel: 12,
    supplier: 'ColorTech Supplies',
    description: '9-inch non-drip paint roller with metal tray',
    image: 'https://images.unsplash.com/photo-1589939705384-5185138a04b9?w=600&h=600&fit=crop',
  },
  {
    id: '8',
    name: 'Latex Paint White (4L)',
    sku: 'PNT-WHT-008',
    category: 'Painting',
    price: 680,
    costPrice: 510,
    quantity: 35,
    reorderLevel: 10,
    supplier: 'ColorTech Supplies',
    description: 'Premium flat white latex paint, 4-liter gallon',
    image: 'https://images.unsplash.com/photo-1562591176-3293399991cb?w=600&h=600&fit=crop',
  },
  {
    id: '20',
    name: 'Paint Thinner 1L',
    sku: 'PNT-THN-020',
    category: 'Painting',
    price: 180,
    costPrice: 110,
    quantity: 60,
    reorderLevel: 15,
    supplier: 'ColorTech Supplies',
    description: 'Grade A premium paint thinner for oil-based paints',
    image: 'https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=600&h=600&fit=crop',
  },

  // SAFETY
  {
    id: '9',
    name: 'Industrial Safety Helmet',
    sku: 'SAF-HLM-009',
    category: 'Safety',
    price: 350,
    costPrice: 210,
    quantity: 48,
    reorderLevel: 15,
    supplier: 'SafeBuild Inc',
    description: 'Reinforced yellow hard hat with adjustable suspension',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&h=600&fit=crop',
  },
  {
    id: '12',
    name: 'Auto-Darkening Welding Mask',
    sku: 'SAF-WLD-012',
    category: 'Safety',
    price: 2850,
    costPrice: 1950,
    quantity: 12,
    reorderLevel: 3,
    supplier: 'SafeBuild Inc',
    description: 'Solar-powered auto-darkening welding helmet, DIN 9-13',
    image: 'https://images.unsplash.com/photo-1530124560676-41bc1275d4d4?w=600&h=600&fit=crop',
  },
  {
    id: '30',
    name: 'N95 Respirator Mask (Box)',
    sku: 'SAF-MSK-030',
    category: 'Safety',
    price: 850,
    costPrice: 450,
    quantity: 40,
    reorderLevel: 10,
    supplier: 'SafeBuild Inc',
    description: 'Box of 20 industrial-grade N95 dust masks',
    image: 'https://images.unsplash.com/photo-1584622781564-1d9876a13301?w=600&h=600&fit=crop',
  },

  // FASTENERS
  {
    id: '11',
    name: 'Wood Screw #8 x 1" (Box)',
    sku: 'FAS-SCR-011',
    category: 'Fasteners',
    price: 180,
    costPrice: 95,
    quantity: 150,
    reorderLevel: 25,
    supplier: 'ABC Hardware Supplies',
    description: 'Box of 100 zinc-plated wood screws',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&h=600&fit=crop',
  },
  {
    id: '14',
    name: 'Common Nail 3" (kg)',
    sku: 'FAS-NAL-014',
    category: 'Fasteners',
    price: 95,
    costPrice: 65,
    quantity: 300,
    reorderLevel: 50,
    supplier: 'ABC Hardware Supplies',
    description: 'Polished steel common nails, sold per kilogram',
    image: 'https://images.unsplash.com/photo-1533062604082-799026992d9f?w=600&h=600&fit=crop',
  },
  {
    id: '31',
    name: 'Expansion Bolt 3/8"',
    sku: 'FAS-BLT-031',
    category: 'Fasteners',
    price: 45,
    costPrice: 28,
    quantity: 500,
    reorderLevel: 100,
    supplier: 'ABC Hardware Supplies',
    description: 'Heavy duty steel expansion sleeve bolt for concrete',
    image: 'https://images.unsplash.com/photo-1584982251278-dfad634711f9?w=600&h=600&fit=crop',
  },

  // GARDEN & OUTDOOR
  {
    id: '18',
    name: 'Garden Hose 30m Heavy',
    sku: 'GAR-HSE-018',
    category: 'Garden',
    price: 1250,
    costPrice: 850,
    quantity: 22,
    reorderLevel: 5,
    supplier: 'SafeBuild Inc',
    description: 'Anti-kink reinforced garden hose, 30-meter length',
    image: 'https://images.unsplash.com/photo-1592178036041-073b379308be?w=600&h=600&fit=crop',
  },
  {
    id: '17',
    name: 'Industrial Wheelbarrow',
    sku: 'GAR-WHL-017',
    category: 'Garden',
    price: 3800,
    costPrice: 2900,
    quantity: 8,
    reorderLevel: 2,
    supplier: 'PowerTools Depot',
    description: 'Deep-dish steel wheelbarrow with pneumatic tire',
    image: 'https://images.unsplash.com/photo-1591955506264-3f5a6834570a?w=600&h=600&fit=crop',
  },
];
let stockMovements: StockMovement[] = [];
let alerts: InventoryAlert[] = [];

// ============= PRODUCT MANAGEMENT =============

/**
 * Add a new product to inventory
 */
export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const newProduct: Product = {
    ...product,
    id: generateId(),
  };
  products.push(newProduct);
  return newProduct;
};

/**
 * Get product by ID
 */
export const getProduct = (productId: string): Product | undefined => {
  return products.find(p => p.id === productId);
};

/**
 * Get all products
 */
export const getAllProducts = (): Product[] => {
  return [...products];
};

/**
 * Update product details
 */
export const updateProduct = (productId: string, updates: Partial<Product>): Product | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;

  Object.assign(product, updates);
  return product;
};

/**
 * Delete product from inventory
 */
export const deleteProduct = (productId: string): boolean => {
  const index = products.findIndex(p => p.id === productId);
  if (index === -1) return false;

  products.splice(index, 1);
  return true;
};

/**
 * Search products by name or SKU
 */
export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.sku.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Filter products by category
 */
export const filterByCategory = (category: string): Product[] => {
  return products.filter(p => p.category === category);
};

/**
 * Get unique categories
 */
export const getCategories = (): string[] => {
  return [...new Set(products.map(p => p.category))];
};

// ============= STOCK MANAGEMENT =============

/**
 * Add stock to a product
 */
export const addStock = (
  productId: string,
  quantity: number,
  reason: string = 'Restock',
  reference?: string
): StockMovement | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;

  product.quantity += quantity;
  product.lastRestockDate = new Date();

  const movement: StockMovement = {
    id: generateId(),
    productId,
    type: 'in',
    quantity,
    date: new Date(),
    reason,
    reference,
  };

  stockMovements.push(movement);
  checkInventoryAlerts(productId);

  return movement;
};

/**
 * Remove stock from a product (for sales)
 */
export const removeStock = (
  productId: string,
  quantity: number,
  reason: string = 'Sale',
  reference?: string
): StockMovement | null => {
  const product = products.find(p => p.id === productId);
  if (!product || product.quantity < quantity) return null;

  product.quantity -= quantity;

  const movement: StockMovement = {
    id: generateId(),
    productId,
    type: 'out',
    quantity,
    date: new Date(),
    reason,
    reference,
  };

  stockMovements.push(movement);
  checkInventoryAlerts(productId);

  return movement;
};

/**
 * Get current stock level
 */
export const getStockLevel = (productId: string): number | null => {
  const product = products.find(p => p.id === productId);
  return product ? product.quantity : null;
};

/**
 * Adjust stock (manual adjustment for discrepancies)
 */
export const adjustStock = (
  productId: string,
  adjustment: number,
  reason: string
): StockMovement | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;

  if (product.quantity + adjustment < 0) return null;

  const movement: StockMovement = {
    id: generateId(),
    productId,
    type: adjustment > 0 ? 'in' : 'out',
    quantity: Math.abs(adjustment),
    date: new Date(),
    reason,
  };

  product.quantity += adjustment;
  stockMovements.push(movement);
  checkInventoryAlerts(productId);

  return movement;
};

// ============= INVENTORY ALERTS =============

/**
 * Check and create inventory alerts
 */
const checkInventoryAlerts = (productId: string): void => {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // Remove existing alerts for this product
  alerts = alerts.filter(a => a.productId !== productId);

  // Check low stock
  if (product.quantity <= product.reorderLevel) {
    alerts.push({
      id: generateId(),
      productId,
      type: 'low-stock',
      message: `${product.name} is running low on stock (${product.quantity} units)`,
      createdAt: new Date(),
    });
  }
};

/**
 * Get all active alerts
 */
export const getAlerts = (): InventoryAlert[] => {
  return [...alerts];
};

/**
 * Get low stock products
 */
export const getLowStockProducts = (): Product[] => {
  return products.filter(p => p.quantity <= p.reorderLevel);
};



// ============= STOCK MOVEMENTS & HISTORY =============

/**
 * Get stock movements for a product
 */
export const getStockHistory = (productId: string, days: number = 30): StockMovement[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return stockMovements.filter(
    m => m.productId === productId && m.date >= cutoffDate
  );
};

/**
 * Get all stock movements
 */
export const getAllStockMovements = (): StockMovement[] => {
  return [...stockMovements];
};

// ============= INVENTORY REPORTS =============

/**
 * Get inventory value report
 */
export const getInventoryValueReport = (): {
  totalItems: number;
  totalValue: number;
  products: Array<{ id: string; name: string; quantity: number; value: number }>;
} => {
  let totalItems = 0;
  let totalValue = 0;

  const productValues = products.map(p => {
    const value = p.quantity * p.costPrice;
    totalItems += p.quantity;
    totalValue += value;

    return {
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      value,
    };
  });

  return {
    totalItems,
    totalValue,
    products: productValues.sort((a, b) => b.value - a.value),
  };
};

/**
 * Get sales summary by category
 */
export const getSalesByCategoryReport = (): Array<{
  category: string;
  totalSold: number;
  totalRevenue: number;
}> => {
  const categoryMap = new Map<
    string,
    { totalSold: number; totalRevenue: number }
  >();

  stockMovements.forEach(movement => {
    if (movement.type === 'out') {
      const product = products.find(p => p.id === movement.productId);
      if (product) {
        const existing = categoryMap.get(product.category) || {
          totalSold: 0,
          totalRevenue: 0,
        };

        existing.totalSold += movement.quantity;
        existing.totalRevenue += movement.quantity * product.price;

        categoryMap.set(product.category, existing);
      }
    }
  });

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    ...data,
  }));
};

/**
 * Get products below reorder level
 */
export const getReorderReport = (): Product[] => {
  return products
    .filter(p => p.quantity <= p.reorderLevel)
    .sort((a, b) => a.quantity - b.quantity);
};

/**
 * Get fast-moving products
 */
export const getFastMovingProducts = (days: number = 30, topN: number = 10): Array<{
  product: Product;
  unitsSold: number;
}> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const salesMap = new Map<string, number>();

  stockMovements.forEach(movement => {
    if (movement.type === 'out' && movement.date >= cutoffDate) {
      const current = salesMap.get(movement.productId) || 0;
      salesMap.set(movement.productId, current + movement.quantity);
    }
  });

  return Array.from(salesMap.entries())
    .map(([productId, unitsSold]) => ({
      product: products.find(p => p.id === productId)!,
      unitsSold,
    }))
    .filter(item => item.product)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, topN);
};

// ============= UTILITY FUNCTIONS =============

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Export/Import functions for persistence
 */
export const exportInventory = () => {
  return {
    products,
    stockMovements,
    alerts,
  };
};

export const importInventory = (data: {
  products: Product[];
  stockMovements: StockMovement[];
  alerts: InventoryAlert[];
}) => {
  products = data.products;
  stockMovements = data.stockMovements;
  alerts = data.alerts;
};

export const clearAlert = (alertId: string) => {
  alerts = alerts.filter(a => a.id !== alertId);
};

export const clearAllAlerts = () => {
  alerts = [];
};

/**
 * Clear all data (use carefully)
 */
export const clearAllData = (): void => {
  products = [];
  stockMovements = [];
  alerts = [];
};
