// Supplier and Purchase Order types
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  contactPerson: string;
  paymentTerms: 'COD' | 'Net30' | 'Net60' | 'Net90';
  status: 'active' | 'inactive' | 'blocked';
  rating: number; // 1-5
  totalOrders: number;
  totalSpent: number;
  averageDeliveryTime: number; // days
  products: string[]; // product IDs they supply
  category: string; // added for UI categories
  createdAt: Date;
  lastOrderDate?: Date;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  reference?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  purchaseOrderId?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'check' | 'bank_transfer' | 'cash' | 'credit_card';
  reference?: string;
  notes?: string;
}

export interface SupplierRating {
  id: string;
  supplierId: string;
  rating: number; // 1-5
  quality: number; // 1-5
  delivery: number; // 1-5
  communication: number; // 1-5
  price: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  totalSpent: number;
  onTimeDeliveryRate: number; // percentage
  averageRating: number;
  qualityScore: number;
  deliveryScore: number;
  communicationScore: number;
  priceScore: number;
}

// In-memory storage
// In-memory storage
let suppliers: Supplier[] = [
  {
    id: '1',
    name: 'Industrial Steel Corp',
    email: 'procurement@industrialsteel.com',
    phone: '+63 2 8123 4567',
    address: '88 Steel Road, Valenzuela Industrial Park',
    city: 'Valenzuela',
    state: 'Metro Manila',
    zipCode: '1440',
    country: 'Philippines',
    contactPerson: 'David Chen',
    paymentTerms: 'Net30',
    status: 'active',
    rating: 4.8,
    totalOrders: 45,
    totalSpent: 850000,
    averageDeliveryTime: 3,
    products: ['22', '11', '14', '31'],
    category: 'Steel, Fasteners',
    createdAt: new Date('2024-01-10'),
    lastOrderDate: new Date('2024-12-05'),
  },
  {
    id: '2',
    name: 'Cement & Aggregates Co.',
    email: 'sales@cementagg.ph',
    phone: '+63 2 8555 1234',
    address: 'Concrete Way, Batangas Port Area',
    city: 'Batangas City',
    state: 'Batangas',
    zipCode: '4200',
    country: 'Philippines',
    contactPerson: 'Elena Mercado',
    paymentTerms: 'Net60',
    status: 'active',
    rating: 4.5,
    totalOrders: 32,
    totalSpent: 1200000,
    averageDeliveryTime: 5,
    products: ['5', '27'],
    category: 'Construction, Bulk',
    createdAt: new Date('2024-02-15'),
    lastOrderDate: new Date('2024-12-01'),
  },
  {
    id: '3',
    name: 'WaterLine Plumbing',
    email: 'orders@waterline.ph',
    phone: '+63 2 8333 9988',
    address: 'Plumbing Hub, Parañaque City',
    city: 'Parañaque',
    state: 'Metro Manila',
    zipCode: '1700',
    country: 'Philippines',
    contactPerson: 'Mark Rivera',
    paymentTerms: 'COD',
    status: 'active',
    rating: 4.3,
    totalOrders: 18,
    totalSpent: 450000,
    averageDeliveryTime: 2,
    products: ['2', '21', '28'],
    category: 'Plumbing, Fixtures',
    createdAt: new Date('2024-03-05'),
    lastOrderDate: new Date('2024-11-20'),
  },
  {
    id: '4',
    name: 'VoltGuard Electricals',
    email: 'support@voltguard.com',
    phone: '+63 2 8777 4455',
    address: 'Wattage Ave, Pasig City',
    city: 'Pasig',
    state: 'Metro Manila',
    zipCode: '1600',
    country: 'Philippines',
    contactPerson: 'Sarah Cruz',
    paymentTerms: 'Net30',
    status: 'active',
    rating: 4.9,
    totalOrders: 25,
    totalSpent: 620000,
    averageDeliveryTime: 3,
    products: ['6', '15', '29'],
    category: 'Electrical, Power',
    createdAt: new Date('2024-01-20'),
    lastOrderDate: new Date('2024-12-04'),
  },
  {
    id: '5',
    name: 'Titan Power Tools',
    email: 'info@titanpowertools.ph',
    phone: '+63 2 8222 6677',
    address: 'Heavy Duty Blvd, Taguig City',
    city: 'Taguig',
    state: 'Metro Manila',
    zipCode: '1634',
    country: 'Philippines',
    contactPerson: 'Kenji Sato',
    paymentTerms: 'Net30',
    status: 'active',
    rating: 4.7,
    totalOrders: 14,
    totalSpent: 1850000,
    averageDeliveryTime: 4,
    products: ['4', '19', '26', '17'],
    category: 'Power Tools, Machinery',
    createdAt: new Date('2024-01-05'),
    lastOrderDate: new Date('2024-12-03'),
  },
];
let purchaseOrders: PurchaseOrder[] = [];
let payments: SupplierPayment[] = [];
let ratings: SupplierRating[] = [];

// ============= SUPPLIER MANAGEMENT =============

/**
 * Add a new supplier
 */
export const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'averageDeliveryTime'>): Supplier => {
  const newSupplier: Supplier = {
    ...supplier,
    id: generateId(),
    createdAt: new Date(),
    totalOrders: 0,
    totalSpent: 0,
    averageDeliveryTime: 0,
  };
  suppliers.push(newSupplier);
  return newSupplier;
};

/**
 * Get supplier by ID
 */
export const getSupplier = (supplierId: string): Supplier | undefined => {
  return suppliers.find(s => s.id === supplierId);
};

/**
 * Get all suppliers
 */
export const getAllSuppliers = (): Supplier[] => {
  return [...suppliers];
};

/**
 * Update supplier information
 */
export const updateSupplier = (supplierId: string, updates: Partial<Supplier>): Supplier | null => {
  const supplier = suppliers.find(s => s.id === supplierId);
  if (!supplier) return null;

  Object.assign(supplier, updates);
  return supplier;
};

/**
 * Deactivate supplier
 */
export const deactivateSupplier = (supplierId: string): Supplier | null => {
  return updateSupplier(supplierId, { status: 'inactive' });
};

/**
 * Activate supplier
 */
export const activateSupplier = (supplierId: string): Supplier | null => {
  return updateSupplier(supplierId, { status: 'active' });
};

/**
 * Block supplier
 */
export const blockSupplier = (supplierId: string): Supplier | null => {
  return updateSupplier(supplierId, { status: 'blocked' });
};

/**
 * Delete supplier
 */
export const deleteSupplier = (supplierId: string): boolean => {
  const index = suppliers.findIndex(s => s.id === supplierId);
  if (index === -1) return false;

  suppliers.splice(index, 1);
  return true;
};

/**
 * Search suppliers by name or contact
 */
export const searchSuppliers = (query: string): Supplier[] => {
  const lowerQuery = query.toLowerCase();
  return suppliers.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.email.toLowerCase().includes(lowerQuery) ||
    s.phone.includes(lowerQuery) ||
    s.contactPerson.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get suppliers by status
 */
export const getSuppliersByStatus = (status: 'active' | 'inactive' | 'blocked'): Supplier[] => {
  return suppliers.filter(s => s.status === status);
};

/**
 * Get top suppliers by spending
 */
export const getTopSuppliers = (limit: number = 10): Supplier[] => {
  return [...suppliers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
};

// ============= PURCHASE ORDERS =============

/**
 * Create purchase order
 */
export const createPurchaseOrder = (
  supplierId: string,
  items: PurchaseOrderItem[],
  shippingCost: number = 0,
  discount: number = 0,
  notes?: string
): PurchaseOrder | null => {
  const supplier = suppliers.find(s => s.id === supplierId);
  if (!supplier || items.length === 0) return null;

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax + shippingCost - discount;

  const expectedDelivery = new Date();
  expectedDelivery.setDate(expectedDelivery.getDate() + 7); // Default 7 days

  const purchaseOrder: PurchaseOrder = {
    id: generateId(),
    supplierId,
    supplierName: supplier.name,
    items,
    subtotal,
    tax,
    shippingCost,
    discount,
    total,
    status: 'pending',
    orderDate: new Date(),
    expectedDelivery,
    paymentStatus: 'unpaid',
    notes,
  };

  purchaseOrders.push(purchaseOrder);

  // Update supplier stats
  supplier.totalOrders++;
  supplier.totalSpent += total;
  supplier.lastOrderDate = new Date();

  return purchaseOrder;
};

/**
 * Get purchase order by ID
 */
export const getPurchaseOrder = (orderId: string): PurchaseOrder | undefined => {
  return purchaseOrders.find(po => po.id === orderId);
};

/**
 * Get all purchase orders
 */
export const getAllPurchaseOrders = (): PurchaseOrder[] => {
  return [...purchaseOrders];
};

/**
 * Get purchase orders by supplier
 */
export const getPurchaseOrdersBySupplier = (supplierId: string): PurchaseOrder[] => {
  return purchaseOrders.filter(po => po.supplierId === supplierId);
};

/**
 * Get purchase orders by status
 */
export const getPurchaseOrdersByStatus = (status: PurchaseOrder['status']): PurchaseOrder[] => {
  return purchaseOrders.filter(po => po.status === status);
};

/**
 * Confirm purchase order
 */
export const confirmPurchaseOrder = (orderId: string): PurchaseOrder | null => {
  const po = purchaseOrders.find(p => p.id === orderId);
  if (!po) return null;

  po.status = 'confirmed';
  return po;
};

/**
 * Mark purchase order as shipped
 */
export const markAsShipped = (orderId: string): PurchaseOrder | null => {
  const po = purchaseOrders.find(p => p.id === orderId);
  if (!po) return null;

  po.status = 'shipped';
  return po;
};

/**
 * Mark purchase order as delivered
 */
export const markAsDelivered = (orderId: string): PurchaseOrder | null => {
  const po = purchaseOrders.find(p => p.id === orderId);
  if (!po) return null;

  po.status = 'delivered';
  po.actualDelivery = new Date();

  // Update supplier average delivery time
  const supplier = suppliers.find(s => s.id === po.supplierId);
  if (supplier && po.expectedDelivery) {
    const deliveryDays = Math.ceil(
      (po.actualDelivery.getTime() - po.orderDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    supplier.averageDeliveryTime = Math.ceil(
      (supplier.averageDeliveryTime * (supplier.totalOrders - 1) + deliveryDays) / supplier.totalOrders
    );
  }

  return po;
};

/**
 * Cancel purchase order
 */
export const cancelPurchaseOrder = (orderId: string): PurchaseOrder | null => {
  const po = purchaseOrders.find(p => p.id === orderId);
  if (!po) return null;

  po.status = 'cancelled';
  return po;
};

/**
 * Update payment status
 */
export const updatePaymentStatus = (orderId: string, status: 'unpaid' | 'partial' | 'paid'): PurchaseOrder | null => {
  const po = purchaseOrders.find(p => p.id === orderId);
  if (!po) return null;

  po.paymentStatus = status;
  return po;
};

// ============= PAYMENTS =============

/**
 * Record supplier payment
 */
export const recordPayment = (
  supplierId: string,
  amount: number,
  paymentMethod: 'check' | 'bank_transfer' | 'cash' | 'credit_card',
  purchaseOrderId?: string,
  reference?: string,
  notes?: string
): SupplierPayment | null => {
  const supplier = suppliers.find(s => s.id === supplierId);
  if (!supplier) return null;

  const payment: SupplierPayment = {
    id: generateId(),
    supplierId,
    purchaseOrderId,
    amount,
    paymentDate: new Date(),
    paymentMethod,
    reference,
    notes,
  };

  payments.push(payment);

  // Update PO payment status if linked
  if (purchaseOrderId) {
    const po = purchaseOrders.find(p => p.id === purchaseOrderId);
    if (po) {
      const totalPaid = payments
        .filter(p => p.purchaseOrderId === purchaseOrderId)
        .reduce((sum, p) => sum + p.amount, 0);

      if (totalPaid >= po.total) {
        po.paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        po.paymentStatus = 'partial';
      }
    }
  }

  return payment;
};

/**
 * Get payments by supplier
 */
export const getPaymentsBySupplier = (supplierId: string): SupplierPayment[] => {
  return payments.filter(p => p.supplierId === supplierId);
};

/**
 * Get payments by purchase order
 */
export const getPaymentsByPurchaseOrder = (purchaseOrderId: string): SupplierPayment[] => {
  return payments.filter(p => p.purchaseOrderId === purchaseOrderId);
};

/**
 * Get total paid for purchase order
 */
export const getTotalPaid = (purchaseOrderId: string): number => {
  return payments
    .filter(p => p.purchaseOrderId === purchaseOrderId)
    .reduce((sum, p) => sum + p.amount, 0);
};

/**
 * Get outstanding balance for purchase order
 */
export const getOutstandingBalance = (purchaseOrderId: string): number => {
  const po = purchaseOrders.find(p => p.id === purchaseOrderId);
  if (!po) return 0;

  const totalPaid = getTotalPaid(purchaseOrderId);
  return Math.max(0, po.total - totalPaid);
};

// ============= RATINGS & REVIEWS =============

/**
 * Add supplier rating
 */
export const addSupplierRating = (
  supplierId: string,
  rating: number,
  quality: number,
  delivery: number,
  communication: number,
  price: number,
  comment?: string
): SupplierRating | null => {
  const supplier = suppliers.find(s => s.id === supplierId);
  if (!supplier) return null;

  const supplierRating: SupplierRating = {
    id: generateId(),
    supplierId,
    rating,
    quality,
    delivery,
    communication,
    price,
    comment,
    createdAt: new Date(),
  };

  ratings.push(supplierRating);

  // Update supplier overall rating
  const allRatings = ratings.filter(r => r.supplierId === supplierId);
  supplier.rating =
    allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

  return supplierRating;
};

/**
 * Get ratings for supplier
 */
export const getSupplierRatings = (supplierId: string): SupplierRating[] => {
  return ratings.filter(r => r.supplierId === supplierId);
};

/**
 * Get average rating for supplier
 */
export const getAverageRating = (supplierId: string): number => {
  const supplierRatings = ratings.filter(r => r.supplierId === supplierId);
  if (supplierRatings.length === 0) return 0;

  return supplierRatings.reduce((sum, r) => sum + r.rating, 0) / supplierRatings.length;
};

// ============= SUPPLIER PERFORMANCE =============

/**
 * Get supplier performance metrics
 */
export const getSupplierPerformance = (supplierId: string): SupplierPerformance | null => {
  const supplier = suppliers.find(s => s.id === supplierId);
  if (!supplier) return null;

  const supplierOrders = purchaseOrders.filter(po => po.supplierId === supplierId && po.status === 'delivered');
  const supplierRatings = ratings.filter(r => r.supplierId === supplierId);

  let onTimeDeliveries = 0;
  supplierOrders.forEach(po => {
    if (po.actualDelivery && po.expectedDelivery && po.actualDelivery <= po.expectedDelivery) {
      onTimeDeliveries++;
    }
  });

  const onTimeRate = supplierOrders.length > 0 ? (onTimeDeliveries / supplierOrders.length) * 100 : 0;

  let avgQuality = 0;
  let avgDelivery = 0;
  let avgCommunication = 0;
  let avgPrice = 0;

  if (supplierRatings.length > 0) {
    avgQuality = supplierRatings.reduce((sum, r) => sum + r.quality, 0) / supplierRatings.length;
    avgDelivery = supplierRatings.reduce((sum, r) => sum + r.delivery, 0) / supplierRatings.length;
    avgCommunication = supplierRatings.reduce((sum, r) => sum + r.communication, 0) / supplierRatings.length;
    avgPrice = supplierRatings.reduce((sum, r) => sum + r.price, 0) / supplierRatings.length;
  }

  return {
    supplierId,
    supplierName: supplier.name,
    totalOrders: supplier.totalOrders,
    totalSpent: supplier.totalSpent,
    onTimeDeliveryRate: onTimeRate,
    averageRating: getAverageRating(supplierId),
    qualityScore: avgQuality,
    deliveryScore: avgDelivery,
    communicationScore: avgCommunication,
    priceScore: avgPrice,
  };
};

/**
 * Get all supplier performance rankings
 */
export const getSupplierRankings = (): SupplierPerformance[] => {
  const rankings = suppliers
    .map(s => getSupplierPerformance(s.id))
    .filter((perf): perf is SupplierPerformance => perf !== null)
    .sort((a, b) => b.averageRating - a.averageRating);

  return rankings;
};

// ============= SUPPLIER REPORTS =============

/**
 * Get supplier spending report
 */
export const getSupplierSpendingReport = (): Array<{
  supplierId: string;
  supplierName: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
}> => {
  return suppliers
    .map(s => ({
      supplierId: s.id,
      supplierName: s.name,
      totalSpent: s.totalSpent,
      orderCount: s.totalOrders,
      averageOrderValue: s.totalOrders > 0 ? s.totalSpent / s.totalOrders : 0,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);
};

/**
 * Get outstanding payments report
 */
export const getOutstandingPaymentsReport = (): Array<{
  purchaseOrderId: string;
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  daysOverdue: number;
}> => {
  return purchaseOrders
    .filter(po => po.paymentStatus !== 'paid' && po.status !== 'cancelled')
    .map(po => {
      const supplier = suppliers.find(s => s.id === po.supplierId);
      const totalPaid = getTotalPaid(po.id);
      const outstanding = po.total - totalPaid;
      const daysOverdue = Math.max(0, Math.ceil(
        (new Date().getTime() - po.orderDate.getTime()) / (1000 * 60 * 60 * 24)
      ) - 7);

      return {
        purchaseOrderId: po.id,
        supplierId: po.supplierId,
        supplierName: supplier?.name || 'Unknown',
        totalAmount: po.total,
        amountPaid: totalPaid,
        outstandingBalance: outstanding,
        daysOverdue,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
};

/**
 * Get delivery performance report
 */
export const getDeliveryPerformanceReport = (): Array<{
  supplierId: string;
  supplierName: string;
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimePercentage: number;
  averageDeliveryDays: number;
}> => {
  return suppliers
    .filter(s => s.totalOrders > 0)
    .map(s => {
      const deliveredOrders = purchaseOrders.filter(
        po => po.supplierId === s.id && po.status === 'delivered'
      );

      let onTimeCount = 0;
      let totalDeliveryDays = 0;

      deliveredOrders.forEach(po => {
        const deliveryDays = po.actualDelivery && po.orderDate
          ? Math.ceil((po.actualDelivery.getTime() - po.orderDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        totalDeliveryDays += deliveryDays;

        if (po.actualDelivery && po.expectedDelivery && po.actualDelivery <= po.expectedDelivery) {
          onTimeCount++;
        }
      });

      const totalDeliveries = deliveredOrders.length;

      return {
        supplierId: s.id,
        supplierName: s.name,
        totalDeliveries,
        onTimeDeliveries: onTimeCount,
        lateDeliveries: totalDeliveries - onTimeCount,
        onTimePercentage: totalDeliveries > 0 ? (onTimeCount / totalDeliveries) * 100 : 0,
        averageDeliveryDays: totalDeliveries > 0 ? Math.ceil(totalDeliveryDays / totalDeliveries) : 0,
      };
    })
    .sort((a, b) => b.onTimePercentage - a.onTimePercentage);
};

// ============= UTILITY FUNCTIONS =============

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get pending orders count
 */
export const getPendingOrdersCount = (): number => {
  return purchaseOrders.filter(po => po.status === 'pending').length;
};

/**
 * Get total outstanding balance
 */
export const getTotalOutstandingBalance = (): number => {
  return purchaseOrders
    .filter(po => po.paymentStatus !== 'paid' && po.status !== 'cancelled')
    .reduce((sum, po) => sum + getOutstandingBalance(po.id), 0);
};

/**
 * Export/Import functions for persistence
 */
export const exportSuppliers = () => {
  return { suppliers, purchaseOrders, payments, ratings };
};

export const importSuppliers = (data: {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  payments: SupplierPayment[];
  ratings: SupplierRating[];
}) => {
  suppliers = data.suppliers;
  purchaseOrders = data.purchaseOrders;
  payments = data.payments;
  ratings = data.ratings;
};

/**
 * Clear all data (use carefully)
 */
export const clearAllSupplierData = (): void => {
  suppliers = [];
  purchaseOrders = [];
  payments = [];
  ratings = [];
};

