import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { ToastContainer, type ToastItem } from '../components/ui/Toast';
import {
  getAllProducts,
  searchProducts,
  filterByCategory,
  getCategories,
  addStock,
  removeStock,
  importInventory,
} from '../data/inventory';
import { api } from '../services/api';
import type { Product } from '../data/inventory';
import { 
  importSales, 
  getDailyReport, 
  getSalesReport, 
  getTopSellingProducts,
} from '../data/sales';
import type { Sale } from '../data/sales';
import { 
  importSuppliers,
  searchSuppliers
} from '../data/supplier';
import type { Supplier } from '../data/supplier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface AuditLogStockItem {
  productId: string;
  productName: string;
  sku?: string;
  quantityDelta: number; // positive when restored/restocked, negative when sold/deducted
  previousStock: number;
  newStock: number;
  unitPrice?: number;
}

export type AuditActionType =
  | 'ORDER_VOIDED'
  | 'SALE_COMPLETED'
  | 'PRODUCT_ADDED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'STOCK_RESTOCKED'
  | 'STOCK_ADJUSTED'
  | 'SUPPLIER_ADDED'
  | 'SUPPLIER_UPDATED'
  | 'SUPPLIER_DELETED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'ALERTS_CLEARED'
  | 'SYSTEM_EVENT';

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: AuditActionType;
  category: 'sales' | 'inventory' | 'supplier' | 'auth' | 'system';
  severity: 'info' | 'success' | 'warning' | 'critical';
  actorName: string;
  actorRole: 'admin' | 'cashier' | 'system';
  entityId?: string;
  entityName?: string;
  description: string;
  metadata?: {
    stockChanges?: AuditLogStockItem[];
    orderTotal?: number;
    customerName?: string;
    paymentMethod?: string;
    originalCashier?: string;
    fieldChanges?: Array<{ field: string; from: any; to: any }>;
    [key: string]: any;
  };
}

interface AppContextType {
  // Inventory
  products: Product[];
  addNewProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateExistingProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteExistingProduct: (id: string) => Promise<void>;
  searchProduct: (query: string) => Product[];
  filterProductsByCategory: (category: string) => Product[];
  getProductCategories: () => string[];
  addProductStock: (productId: string, quantity: number, reason?: string) => void;
  removeProductStock: (productId: string, quantity: number, reason?: string) => void;
  getLowStock: () => Product[];
  getInventoryAlerts: () => any[];
  clearInventoryAlert: (alertId: string) => void;
  clearAllInventoryAlerts: () => void;

  // Sales
  sales: Sale[];
  createNewSale: (
    items: any[], 
    paymentMethod: 'cash' | 'card' | 'check' | 'online', 
    amountPaid: number, 
    discount?: number,
    cashier?: string,
    notes?: string,
    tax?: number,
    total?: number,
    change?: number
  ) => Promise<any>;
  cancelExistingSale: (saleId: string, reason?: string) => Promise<void>;
  getSalesData: () => Sale[];
  getDailySalesReport: (date: Date) => any;
  getSalesReportData: (startDate: Date, endDate: Date) => any;
  getTopSellingProducts: (startDate: Date, endDate: Date, limit?: number) => any[];

  // Suppliers
  suppliers: Supplier[];
  addNewSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateExistingSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteExistingSupplier: (id: string) => void;
  searchSupplier: (query: string) => Supplier[];

  // Audit Logs
  auditLogs: AuditLog[];
  recordAuditLog: (entry: Omit<AuditLog, 'id' | 'timestamp'> & { timestamp?: Date }) => Promise<void>;
  clearAuditLogs: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Feedback
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

  // Auth
  user: User | null;
  isInitialized: boolean;
  login: (email: string, role: 'admin' | 'cashier') => void;
  logout: () => void;
  seedDemoDatabase: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

// Helper to build initial baseline audit logs from existing sales & inventory when none exist yet
function buildInitialAuditLogs(salesList: any[], productsList: Product[]): AuditLog[] {
  const logs: AuditLog[] = [];
  const recentSales = [...salesList]
    .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
    .slice(0, 18);

  recentSales.forEach((sale, idx) => {
    const saleItems = Array.isArray(sale.items) ? sale.items : [];
    const totalUnits = saleItems.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 0), 0);
    const stockChanges: AuditLogStockItem[] = saleItems.map((item: any) => {
      const prod = productsList.find(
        (p) =>
          String(p.id) === String(item.productId || item.product_id) ||
          p.name.toLowerCase() === String(item.productName || item.product_name || '').toLowerCase()
      );
      const currentQty = prod ? Number(prod.quantity) || 0 : 25;
      const qty = Number(item.quantity) || 1;
      if (sale.status === 'cancelled') {
        return {
          productId: String(item.productId || prod?.id || ''),
          productName: item.productName || prod?.name || 'Hardware Item',
          sku: prod?.sku,
          quantityDelta: qty,
          previousStock: Math.max(0, currentQty - qty),
          newStock: currentQty,
          unitPrice: Number(item.unitPrice || item.price || 0),
        };
      }
      return {
        productId: String(item.productId || prod?.id || ''),
        productName: item.productName || prod?.name || 'Hardware Item',
        sku: prod?.sku,
        quantityDelta: -qty,
        previousStock: currentQty + qty,
        newStock: currentQty,
        unitPrice: Number(item.unitPrice || item.price || 0),
      };
    });

    if (sale.status === 'cancelled') {
      logs.push({
        id: `AUD-INIT-VOID-${idx}-${sale.id}`,
        timestamp: new Date(new Date(sale.saleDate).getTime() + 15 * 60 * 1000),
        action: 'ORDER_VOIDED',
        category: 'sales',
        severity: 'critical',
        actorName: 'Admin User',
        actorRole: 'admin',
        entityId: sale.id,
        entityName: `Order #${sale.id}`,
        description: `Voided Order #${sale.id} (₱${Number(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}) and restored ${totalUnits} unit(s) across ${saleItems.length} item(s) back to inventory stock.`,
        metadata: {
          stockChanges,
          orderTotal: Number(sale.total),
          customerName: sale.customerName || 'Walk-in',
          paymentMethod: sale.paymentMethod,
          originalCashier: sale.cashier || 'Cashier',
        },
      });
    } else {
      logs.push({
        id: `AUD-INIT-SALE-${idx}-${sale.id}`,
        timestamp: new Date(sale.saleDate),
        action: 'SALE_COMPLETED',
        category: 'sales',
        severity: 'success',
        actorName: sale.cashier || 'Cashier User',
        actorRole: 'cashier',
        entityId: sale.id,
        entityName: `Order #${sale.id}`,
        description: `Completed POS sale #${sale.id} for ${sale.customerName || 'Walk-in'} totaling ₱${Number(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })} (${totalUnits} unit(s) deducted from stock).`,
        metadata: {
          stockChanges,
          orderTotal: Number(sale.total),
          customerName: sale.customerName || 'Walk-in',
          paymentMethod: sale.paymentMethod,
          originalCashier: sale.cashier || 'Cashier',
        },
      });
    }
  });

  // Add a few sample inventory & security audit events
  if (productsList.length > 0) {
    const sampleProd = productsList[0];
    logs.push({
      id: `AUD-INIT-INV-1`,
      timestamp: new Date(Date.now() - 2 * 3600 * 1000),
      action: 'STOCK_RESTOCKED',
      category: 'inventory',
      severity: 'info',
      actorName: 'Admin User',
      actorRole: 'admin',
      entityId: sampleProd.sku || sampleProd.id,
      entityName: sampleProd.name,
      description: `Restocked "${sampleProd.name}" (${sampleProd.sku}): added +20 units to warehouse inventory.`,
      metadata: {
        stockChanges: [
          {
            productId: sampleProd.id,
            productName: sampleProd.name,
            sku: sampleProd.sku,
            quantityDelta: 20,
            previousStock: Math.max(0, Number(sampleProd.quantity) - 20),
            newStock: Number(sampleProd.quantity),
            unitPrice: Number(sampleProd.price),
          },
        ],
      },
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper to record an audit log both locally and in the backend
  const recordAuditLog = useCallback(
    async (entry: Omit<AuditLog, 'id' | 'timestamp'> & { timestamp?: Date }) => {
      const newLog: AuditLog = {
        ...entry,
        id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        timestamp: entry.timestamp || new Date(),
      };

      setAuditLogs((prev) => {
        const updated = [newLog, ...prev].slice(0, 1000);
        try {
          localStorage.setItem('pos_audit_logs', JSON.stringify(updated));
        } catch (e) {
          // ignore storage quota errors
        }
        return updated;
      });

      try {
        await api.addAuditLog({
          ...newLog,
          timestamp: newLog.timestamp.toISOString(),
        });
      } catch (err) {
        // Offline mode: already saved in state & localStorage
      }
    },
    []
  );

  const clearAuditLogs = useCallback(async () => {
    setAuditLogs([]);
    localStorage.setItem('pos_audit_logs', JSON.stringify([]));
    try {
      await api.clearAllAuditLogs();
    } catch (err) {
      // Offline fallback handled
    }
    showToast('Audit log history cleared.', 'info');
  }, [showToast]);

  // Central function to fetch all data from XAMPP Backend
  const refreshAllData = async () => {
    try {
      const [p, s, sup, a] = await Promise.all([
        api.getProducts(),
        api.getSales(),
        api.getSuppliers(),
        api.getAlerts()
      ]);
      
      if (Array.isArray(p) && p.length > 0) {
        // Ensure all dates fetched from MariaDB are real Date objects for reports/charts
        const parsedSales = s.map((sale: any) => ({
          ...sale,
          saleDate: new Date(sale.saleDate)
        }));
        
        const parsedProducts = p.map((prod: any) => ({
          ...prod,
          price: Number(prod.price ?? 0),
          quantity: Number(prod.quantity ?? 0),
          costPrice: prod.costPrice !== undefined ? Number(prod.costPrice) : Number(prod.cost_price ?? 0),
          reorderLevel: prod.reorderLevel !== undefined ? Number(prod.reorderLevel) : Number(prod.reorder_level ?? 0),
        }));

        setProducts(parsedProducts);
        setSales(parsedSales);
        setSuppliers(sup);
        setAlerts(a);
        
        // Sync the local data layer
        importInventory({ products: parsedProducts, stockMovements: [], alerts: a });
        importSales({ sales: parsedSales, TAX_RATE: 0.12 });
      }

      // Also fetch backend audit logs if available
      try {
        const backendLogs = await api.getAuditLogs();
        if (Array.isArray(backendLogs) && backendLogs.length > 0) {
          const parsedLogs: AuditLog[] = backendLogs.map((l: any) => ({
            ...l,
            timestamp: new Date(l.timestamp),
          }));
          setAuditLogs((prev) => {
            // Merge unique logs by id so local logs aren't lost
            const map = new Map<string, AuditLog>();
            parsedLogs.forEach((item) => map.set(item.id, item));
            prev.forEach((item) => {
              if (!map.has(item.id)) map.set(item.id, item);
            });
            return Array.from(map.values()).sort(
              (x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime()
            );
          });
        }
      } catch (logErr) {
        // Keep local auditLogs
      }
    } catch (err) {
      // Backend polling failed or offline - keep local state intact
    }
  };

  // Initialize and implement Polling
  useEffect(() => {
    const init = async () => {
      let hasData = false;
      let loadedProducts: Product[] = [];
      let loadedSales: any[] = [];

      try {
        const [p, s, sup, a] = await Promise.all([
          api.getProducts(),
          api.getSales(),
          api.getSuppliers(),
          api.getAlerts()
        ]);
        
        if (Array.isArray(p) && p.length > 0) {
          const parsedSales = s.map((sale: any) => ({
            ...sale,
            saleDate: new Date(sale.saleDate)
          }));
          
          const parsedProducts = p.map((prod: any) => ({
            ...prod,
            price: Number(prod.price ?? 0),
            quantity: Number(prod.quantity ?? 0),
            costPrice: prod.costPrice !== undefined ? Number(prod.costPrice) : Number(prod.cost_price ?? 0),
            reorderLevel: prod.reorderLevel !== undefined ? Number(prod.reorderLevel) : Number(prod.reorder_level ?? 0),
          }));

          setProducts(parsedProducts);
          setSales(parsedSales);
          setSuppliers(sup);
          setAlerts(a);
          
          importInventory({ products: parsedProducts, stockMovements: [], alerts: a });
          importSales({ sales: parsedSales, TAX_RATE: 0.12 });
          loadedProducts = parsedProducts;
          loadedSales = parsedSales;
          hasData = true;
        }
      } catch (err) {
        console.warn('Backend unavailable, checking local storage cache...', err);
      }

      if (!hasData) {
        // Check localStorage cache
        const cachedProducts = localStorage.getItem('pos_products');
        const cachedSales = localStorage.getItem('pos_sales');
        const cachedSuppliers = localStorage.getItem('pos_suppliers');
        const cachedAlerts = localStorage.getItem('pos_alerts');

        if (cachedProducts) {
          try {
            const p = JSON.parse(cachedProducts).map((prod: any) => ({
              ...prod,
              price: Number(prod.price ?? 0),
              quantity: Number(prod.quantity ?? 0),
              costPrice: prod.costPrice !== undefined ? Number(prod.costPrice) : Number(prod.cost_price ?? 0),
              reorderLevel: prod.reorderLevel !== undefined ? Number(prod.reorderLevel) : Number(prod.reorder_level ?? 0),
            }));
            if (Array.isArray(p) && p.length > 0) {
              setProducts(p);
              loadedProducts = p;
              let s: any[] = [];
              if (cachedSales) {
                s = JSON.parse(cachedSales).map((sale: any) => ({
                  ...sale,
                  saleDate: new Date(sale.saleDate)
                }));
                setSales(s);
                loadedSales = s;
              }
              const parsedAlerts = cachedAlerts ? JSON.parse(cachedAlerts) : [];
              if (cachedSuppliers) setSuppliers(JSON.parse(cachedSuppliers));
              setAlerts(parsedAlerts);
              importInventory({ products: p, stockMovements: [], alerts: parsedAlerts });
              importSales({ sales: s, TAX_RATE: 0.12 });
              hasData = true;
            }
          } catch (e) {
            console.error('Failed to parse cached data:', e);
          }
        }
      }

      // If no data exists yet, automatically seed sample data for Cashier & Admin!
      if (!hasData) {
        console.log('No existing inventory detected. Auto-seeding sample data for cashier and admin...');
        await seedDemoDatabase();
      }

      // Load Audit Logs from backend or localStorage, or build initial logs
      let loadedAuditLogs: AuditLog[] = [];
      try {
        const backendLogs = await api.getAuditLogs();
        if (Array.isArray(backendLogs) && backendLogs.length > 0) {
          loadedAuditLogs = backendLogs.map((l: any) => ({
            ...l,
            timestamp: new Date(l.timestamp),
          }));
        }
      } catch (e) {
        // Backend audit_logs unavailable
      }

      if (loadedAuditLogs.length === 0) {
        const cachedLogs = localStorage.getItem('pos_audit_logs');
        if (cachedLogs) {
          try {
            const parsed = JSON.parse(cachedLogs);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedAuditLogs = parsed.map((l: any) => ({
                ...l,
                timestamp: new Date(l.timestamp),
              }));
            }
          } catch (e) {
            console.error('Failed to parse cached audit logs:', e);
          }
        }
      }

      if (loadedAuditLogs.length === 0 && (loadedSales.length > 0 || loadedProducts.length > 0)) {
        loadedAuditLogs = buildInitialAuditLogs(loadedSales, loadedProducts);
        localStorage.setItem('pos_audit_logs', JSON.stringify(loadedAuditLogs));
      }

      if (loadedAuditLogs.length > 0) {
        setAuditLogs(loadedAuditLogs);
      }
      
      // Handle User and Cart separately as they are purely auth-based
      const savedUser = localStorage.getItem('pos_user');
      if (savedUser) setUser(JSON.parse(savedUser));
      
      const savedCart = localStorage.getItem('pos_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      
      setIsInitialized(true);
    };

    init();

    // Accuracy: Background polling ensures Admin sees Cashier sales in real-time
    const interval = setInterval(() => {
      refreshAllData();
    }, 15000); // 15 seconds for more "real-time" feel

    return () => clearInterval(interval);
  }, []);

  // Persist data when changes occur
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('pos_products', JSON.stringify(products));
    localStorage.setItem('pos_sales', JSON.stringify(sales));
    localStorage.setItem('pos_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('pos_alerts', JSON.stringify(alerts));
    localStorage.setItem('pos_audit_logs', JSON.stringify(auditLogs));
    localStorage.setItem('pos_cart', JSON.stringify(cart));
    if (user) {
      localStorage.setItem('pos_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pos_user');
    }
  }, [products, sales, suppliers, alerts, auditLogs, cart, user, isInitialized]);

  // Inventory functions
  const addNewProduct = async (productData: Omit<Product, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const normalizedNewProduct: Product = {
      ...productData,
      id,
      price: Number(productData.price) || 0,
      costPrice: Number(productData.costPrice ?? (productData as any).cost_price ?? 0),
      quantity: Number(productData.quantity) || 0,
      reorderLevel: Number(productData.reorderLevel ?? (productData as any).reorder_level ?? 10),
    };

    try {
      await api.addProduct({
        ...normalizedNewProduct,
        cost_price: normalizedNewProduct.costPrice,
        reorder_level: normalizedNewProduct.reorderLevel,
      });
      const updatedProducts = await api.getProducts();
      const parsedProducts = updatedProducts.map((prod: any) => ({
        ...prod,
        price: Number(prod.price ?? 0),
        quantity: Number(prod.quantity ?? 0),
        costPrice: prod.costPrice !== undefined ? Number(prod.costPrice) : Number(prod.cost_price ?? 0),
        reorderLevel: prod.reorderLevel !== undefined ? Number(prod.reorderLevel) : Number(prod.reorder_level ?? 0),
      }));
      setProducts(parsedProducts);
      importInventory({ products: parsedProducts, stockMovements: [], alerts });
    } catch (err) {
      console.warn('Backend addProduct failed, using local state fallback:', err);
      setProducts((prev) => {
        const next = [normalizedNewProduct, ...prev];
        importInventory({ products: next, stockMovements: [], alerts });
        return next;
      });
    }

    await recordAuditLog({
      action: 'PRODUCT_ADDED',
      category: 'inventory',
      severity: 'success',
      actorName: user?.name || 'Admin User',
      actorRole: user?.role || 'admin',
      entityId: normalizedNewProduct.sku || normalizedNewProduct.id,
      entityName: normalizedNewProduct.name,
      description: `Added new product "${normalizedNewProduct.name}" (SKU: ${normalizedNewProduct.sku}) with initial stock of ${normalizedNewProduct.quantity} units at ₱${normalizedNewProduct.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
      metadata: {
        stockChanges: [
          {
            productId: normalizedNewProduct.id,
            productName: normalizedNewProduct.name,
            sku: normalizedNewProduct.sku,
            quantityDelta: normalizedNewProduct.quantity,
            previousStock: 0,
            newStock: normalizedNewProduct.quantity,
            unitPrice: normalizedNewProduct.price,
          },
        ],
      },
    });

    showToast(`Product "${productData.name}" added successfully.`, 'success');
  };

  const updateExistingProduct = async (id: string, updates: Partial<Product>) => {
    const existingProduct = products.find((p) => String(p.id) === String(id));
    const prevQty = existingProduct ? Number(existingProduct.quantity) || 0 : 0;
    const nextQty = updates.quantity !== undefined ? Number(updates.quantity) : prevQty;
    const qtyDelta = nextQty - prevQty;

    try {
      await api.updateProduct(id, updates);
      const updatedProducts = await api.getProducts();
      const parsedProducts = updatedProducts.map((prod: any) => ({
        ...prod,
        price: Number(prod.price ?? 0),
        quantity: Number(prod.quantity ?? 0),
        costPrice: prod.costPrice !== undefined ? Number(prod.costPrice) : Number(prod.cost_price ?? 0),
        reorderLevel: prod.reorderLevel !== undefined ? Number(prod.reorderLevel) : Number(prod.reorder_level ?? 0),
      }));
      setProducts(parsedProducts);
      importInventory({ products: parsedProducts, stockMovements: [], alerts });
    } catch (err) {
      console.warn('Backend updateProduct failed, applying update locally:', err);
      setProducts((prev) => {
        const next = prev.map((prod) =>
          String(prod.id) === String(id)
            ? {
                ...prod,
                ...updates,
                price: updates.price !== undefined ? Number(updates.price) : prod.price,
                quantity: updates.quantity !== undefined ? Number(updates.quantity) : prod.quantity,
              }
            : prod
        );
        importInventory({ products: next, stockMovements: [], alerts });
        return next;
      });
    }

    // Remove low-stock alert if stock is now above reorderLevel
    if (existingProduct && nextQty > (Number(existingProduct.reorderLevel) || 10)) {
      setAlerts((prev) => prev.filter((a) => String(a.productId || a.product_id) !== String(id)));
    }

    if (existingProduct) {
      const fieldChanges: Array<{ field: string; from: any; to: any }> = [];
      if (updates.name !== undefined && updates.name !== existingProduct.name) {
        fieldChanges.push({ field: 'Name', from: existingProduct.name, to: updates.name });
      }
      if (updates.price !== undefined && Number(updates.price) !== Number(existingProduct.price)) {
        fieldChanges.push({
          field: 'Retail Price',
          from: `₱${Number(existingProduct.price).toFixed(2)}`,
          to: `₱${Number(updates.price).toFixed(2)}`,
        });
      }
      if (updates.category !== undefined && updates.category !== existingProduct.category) {
        fieldChanges.push({ field: 'Category', from: existingProduct.category, to: updates.category });
      }
      if (updates.quantity !== undefined && nextQty !== prevQty) {
        fieldChanges.push({ field: 'Stock Quantity', from: `${prevQty} units`, to: `${nextQty} units` });
      }

      const isPureRestock = qtyDelta > 0 && Object.keys(updates).length === 1 && updates.quantity !== undefined;
      const actionType: AuditActionType = isPureRestock
        ? 'STOCK_RESTOCKED'
        : qtyDelta !== 0
        ? 'STOCK_ADJUSTED'
        : 'PRODUCT_UPDATED';

      const prodName = updates.name || existingProduct.name;
      const prodSku = updates.sku || existingProduct.sku;

      let description = `Updated product "${prodName}" (${prodSku}).`;
      if (isPureRestock) {
        description = `Restocked "${prodName}" (${prodSku}): added +${qtyDelta} units (${prevQty} → ${nextQty} units).`;
      } else if (qtyDelta !== 0) {
        const sign = qtyDelta > 0 ? `+${qtyDelta}` : `${qtyDelta}`;
        description = `Adjusted stock & details for "${prodName}" (${prodSku}): stock ${prevQty} → ${nextQty} (${sign} units).`;
      }

      await recordAuditLog({
        action: actionType,
        category: 'inventory',
        severity: qtyDelta < 0 ? 'warning' : 'info',
        actorName: user?.name || 'Admin User',
        actorRole: user?.role || 'admin',
        entityId: prodSku || existingProduct.id,
        entityName: prodName,
        description,
        metadata: {
          stockChanges:
            qtyDelta !== 0
              ? [
                  {
                    productId: existingProduct.id,
                    productName: prodName,
                    sku: prodSku,
                    quantityDelta: qtyDelta,
                    previousStock: prevQty,
                    newStock: nextQty,
                    unitPrice: Number(updates.price ?? existingProduct.price),
                  },
                ]
              : undefined,
          fieldChanges: fieldChanges.length > 0 ? fieldChanges : undefined,
        },
      });
    }

    showToast('Product updated successfully.', 'success');
  };

  const deleteExistingProduct = async (id: string) => {
    const targetProduct = products.find((p) => String(p.id) === String(id));
    try {
      await api.deleteProduct(id);
      const updatedProducts = await api.getProducts();
      const parsedProducts = updatedProducts.map((prod: any) => ({
        ...prod,
        price: Number(prod.price ?? 0),
        quantity: Number(prod.quantity ?? 0),
        costPrice: prod.costPrice !== undefined ? Number(prod.costPrice) : Number(prod.cost_price ?? 0),
        reorderLevel: prod.reorderLevel !== undefined ? Number(prod.reorderLevel) : Number(prod.reorder_level ?? 0),
      }));
      setProducts(parsedProducts);
      importInventory({ products: parsedProducts, stockMovements: [], alerts });
    } catch (err) {
      console.warn('Backend deleteProduct failed, removing locally:', err);
      setProducts((prev) => {
        const next = prev.filter((p) => String(p.id) !== String(id));
        importInventory({ products: next, stockMovements: [], alerts });
        return next;
      });
    }

    if (targetProduct) {
      await recordAuditLog({
        action: 'PRODUCT_DELETED',
        category: 'inventory',
        severity: 'warning',
        actorName: user?.name || 'Admin User',
        actorRole: user?.role || 'admin',
        entityId: targetProduct.sku || targetProduct.id,
        entityName: targetProduct.name,
        description: `Removed product "${targetProduct.name}" (SKU: ${targetProduct.sku}) from inventory catalog (had ${targetProduct.quantity} units in stock).`,
        metadata: {
          stockChanges: [
            {
              productId: targetProduct.id,
              productName: targetProduct.name,
              sku: targetProduct.sku,
              quantityDelta: -Number(targetProduct.quantity || 0),
              previousStock: Number(targetProduct.quantity || 0),
              newStock: 0,
              unitPrice: Number(targetProduct.price || 0),
            },
          ],
        },
      });
    }

    showToast('Product removed from catalog.', 'info');
  };

  const searchProduct = (query: string) => searchProducts(query);

  const filterProductsByCategory = (category: string) => filterByCategory(category);

  const getProductCategories = () => getCategories();

  const addProductStock = (productId: string, quantity: number, reason?: string) => {
    addStock(productId, quantity, reason);
    setProducts(getAllProducts());
  };

  const removeProductStock = (productId: string, quantity: number, reason?: string) => {
    removeStock(productId, quantity, reason);
    setProducts(getAllProducts());
  };

  const getLowStock = () => products.filter(p => Number(p.quantity) <= Number(p.reorderLevel));

  const getInventoryAlerts = () => alerts;

  const clearInventoryAlert = async (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    try {
      await api.deleteAlert(alertId);
      const updatedAlerts = await api.getAlerts();
      if (Array.isArray(updatedAlerts)) setAlerts(updatedAlerts);
    } catch (err) {
      // Offline fallback handled
    }
    showToast('Notification alert cleared.', 'info');
  };

  const clearAllInventoryAlerts = async () => {
    const count = alerts.length;
    setAlerts([]);
    try {
      await api.clearAllAlerts();
    } catch (err) {
      // Offline fallback handled
    }
    await recordAuditLog({
      action: 'ALERTS_CLEARED',
      category: 'system',
      severity: 'info',
      actorName: user?.name || 'Admin User',
      actorRole: user?.role || 'admin',
      entityId: 'ALERTS-ALL',
      entityName: 'System Notifications',
      description: `Cleared ${count} operational notification alert(s) from the Alert Center.`,
    });
    showToast('All notifications cleared.', 'info');
  };

  // Sales functions
  const createNewSale = async (
    items: any[], 
    paymentMethod: 'cash' | 'card' | 'check' | 'online', 
    amountPaid: number, 
    discount?: number,
    cashier?: string,
    notes?: string,
    tax?: number,
    total?: number,
    change?: number
  ) => {
    const id = `SALE-${Date.now()}`;
    const calculatedSubtotal = items.reduce(
      (sum, item) => sum + (Number(item.price || item.unitPrice || 0) * Number(item.quantity || 1)),
      0
    );
    const calculatedTotal = total ?? (calculatedSubtotal - (discount || 0));
    const calculatedTax = tax ?? (calculatedTotal * 0.12);
    const customerName = notes && notes.startsWith('Customer: ')
      ? notes.replace('Customer: ', '')
      : (notes || 'Walk-in');
    const actingCashier = cashier || user?.name || 'Cashier User';

    // Compute exact stock deductions per item
    const stockChanges: AuditLogStockItem[] = [];
    const updatedProducts = products.map((prod) => {
      const matchingItem = items.find(
        (i) =>
          String(i.productId || i.product_id) === String(prod.id) ||
          String(i.productName || i.product_name || '').toLowerCase() === prod.name.toLowerCase()
      );
      if (!matchingItem) return prod;

      const qtySold = Math.max(0, Number(matchingItem.quantity) || 0);
      const prevStock = Number(prod.quantity) || 0;
      const newStock = Math.max(0, prevStock - qtySold);

      stockChanges.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantityDelta: -qtySold,
        previousStock: prevStock,
        newStock,
        unitPrice: Number(matchingItem.price || matchingItem.unitPrice || prod.price || 0),
      });

      return {
        ...prod,
        quantity: newStock,
      };
    });

    const saleData = {
      id,
      customer_name: customerName,
      customerName,
      subtotal: calculatedSubtotal,
      total: calculatedTotal,
      tax: calculatedTax,
      discount: discount || 0,
      payment_method: paymentMethod,
      paymentMethod,
      amount_paid: amountPaid,
      amountPaid,
      change_amount: change ?? (amountPaid - calculatedTotal),
      change: change ?? (amountPaid - calculatedTotal),
      cashier: actingCashier,
      notes: notes || '',
      status: 'completed' as const,
      saleDate: new Date(),
      items: items.map((item) => ({
        ...item,
        productId: item.productId || item.product_id,
        productName: item.productName || item.product_name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.price || item.unitPrice || 0),
        price: Number(item.price || item.unitPrice || 0),
        total: Number(item.total || Number(item.quantity) * Number(item.price || item.unitPrice || 0)),
      })),
    };

    // Apply stock deduction & sale addition locally right away
    setProducts(updatedProducts);
    setSales((prev) => {
      const nextSales = [saleData as unknown as Sale, ...prev];
      importSales({ sales: nextSales, TAX_RATE: 0.12 });
      return nextSales;
    });
    importInventory({ products: updatedProducts, stockMovements: [], alerts });

    try {
      await api.createSale(saleData);
      await refreshAllData();
    } catch (err) {
      console.warn('Backend createSale unavailable, recorded sale and deducted stock locally:', err);
    }

    const totalUnitsSold = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    await recordAuditLog({
      action: 'SALE_COMPLETED',
      category: 'sales',
      severity: 'success',
      actorName: actingCashier,
      actorRole: user?.role || 'cashier',
      entityId: id,
      entityName: `Order #${id}`,
      description: `Completed POS sale #${id} for ${customerName} totaling ₱${Number(calculatedTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })} (${totalUnitsSold} unit(s) deducted from inventory).`,
      metadata: {
        stockChanges,
        orderTotal: Number(calculatedTotal),
        customerName,
        paymentMethod,
        originalCashier: actingCashier,
      },
    });

    showToast(`Sale recorded successfully! Order #${id}`, 'success');
    return saleData;
  };

  const cancelExistingSale = async (saleId: string, reason?: string) => {
    const targetSale = sales.find((s) => s.id === saleId);
    if (!targetSale) {
      showToast('Order not found.', 'error');
      return;
    }
    if (targetSale.status === 'cancelled') {
      showToast('This order has already been voided.', 'warning');
      return;
    }

    const saleItems = Array.isArray(targetSale.items) ? targetSale.items : [];

    // Aggregate quantities to restore per product (handles multiple lines of the same product in one order)
    const restoreMap = new Map<string, { qty: number; name: string; unitPrice: number }>();
    saleItems.forEach((item: any) => {
      const pId = String(item.productId || item.product_id || '');
      const pName = String(item.productName || item.product_name || '');
      const key = pId || pName.toLowerCase();
      const qty = Math.max(0, Number(item.quantity) || 0);
      const uPrice = Number(item.unitPrice || item.price || 0);
      const existing = restoreMap.get(key);
      if (existing) {
        existing.qty += qty;
      } else {
        restoreMap.set(key, { qty, name: pName, unitPrice: uPrice });
      }
    });

    const stockChanges: AuditLogStockItem[] = [];

    // Restore quantities back to inventory products
    const updatedProducts = products.map((prod) => {
      const byId = restoreMap.get(String(prod.id));
      const byName = !byId
        ? Array.from(restoreMap.values()).find(
            (entry) => entry.name.toLowerCase() === prod.name.toLowerCase()
          )
        : undefined;
      const match = byId || byName;
      if (!match || match.qty <= 0) return prod;

      const prevStock = Number(prod.quantity) || 0;
      const restoredQty = match.qty;
      const newStock = prevStock + restoredQty;

      stockChanges.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantityDelta: restoredQty,
        previousStock: prevStock,
        newStock,
        unitPrice: match.unitPrice || Number(prod.price) || 0,
      });

      return {
        ...prod,
        quantity: newStock,
      };
    });

    // If any sale item wasn't matched in current products array, still record it in stockChanges for audit visibility
    saleItems.forEach((item: any) => {
      const pId = String(item.productId || item.product_id || '');
      const pName = String(item.productName || item.product_name || '');
      const alreadyTracked = stockChanges.some(
        (sc) =>
          String(sc.productId) === pId ||
          sc.productName.toLowerCase() === pName.toLowerCase()
      );
      if (!alreadyTracked) {
        const qty = Math.max(0, Number(item.quantity) || 0);
        stockChanges.push({
          productId: pId || 'UNKNOWN',
          productName: pName || 'Unknown Product',
          quantityDelta: qty,
          previousStock: 0,
          newStock: qty,
          unitPrice: Number(item.unitPrice || item.price || 0),
        });
      }
    });

    // Update alerts: remove low-stock alerts for any products whose restored stock is now above reorderLevel
    const updatedAlerts = alerts.filter((alert) => {
      const alertProdId = String(alert.productId || alert.product_id || '');
      const restoredProd = updatedProducts.find((p) => String(p.id) === alertProdId);
      if (restoredProd && alert.type === 'low-stock') {
        return Number(restoredProd.quantity) <= Number(restoredProd.reorderLevel || 10);
      }
      return true;
    });

    // Mark sale as cancelled in state
    const updatedSales = sales.map((sale) =>
      sale.id === saleId ? { ...sale, status: 'cancelled' as const } : sale
    );

    // Commit immediately to React state, in-memory data modules, and localStorage
    setProducts(updatedProducts);
    setSales(updatedSales);
    setAlerts(updatedAlerts);
    importInventory({ products: updatedProducts, stockMovements: [], alerts: updatedAlerts });
    importSales({ sales: updatedSales, TAX_RATE: 0.12 });

    localStorage.setItem('pos_products', JSON.stringify(updatedProducts));
    localStorage.setItem('pos_sales', JSON.stringify(updatedSales));
    localStorage.setItem('pos_alerts', JSON.stringify(updatedAlerts));

    // Sync with backend database
    try {
      await api.cancelSale(saleId);
      await refreshAllData();
    } catch (err) {
      console.warn('Backend cancelSale failed or offline; syncing restored product stock individually:', err);
      // Even if the sale record wasn't in MySQL (e.g., seeded in localStorage), try updating the products in MySQL
      await Promise.allSettled(
        stockChanges.map((sc) =>
          api.updateProduct(sc.productId, { quantity: sc.newStock })
        )
      );
    }

    const totalUnitsRestored = stockChanges.reduce((sum, sc) => sum + sc.quantityDelta, 0);
    const itemsSummary = stockChanges
      .map((sc) => `+${sc.quantityDelta} ${sc.productName} (${sc.previousStock}→${sc.newStock})`)
      .join(', ');

    await recordAuditLog({
      action: 'ORDER_VOIDED',
      category: 'sales',
      severity: 'critical',
      actorName: user?.name || 'Admin User',
      actorRole: user?.role || 'admin',
      entityId: saleId,
      entityName: `Order #${saleId}`,
      description: `Voided Order #${saleId} (₱${Number(targetSale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}) and restored ${totalUnitsRestored} unit(s) back to inventory stock [${itemsSummary}]${reason ? ` — Reason: ${reason}` : ''}.`,
      metadata: {
        stockChanges,
        orderTotal: Number(targetSale.total),
        customerName: targetSale.customerName || 'Walk-in',
        paymentMethod: targetSale.paymentMethod,
        originalCashier: targetSale.cashier || 'Cashier',
        voidReason: reason || 'Transaction reversal & inventory stock restoration',
      },
    });

    showToast(
      `Order #${saleId} voided! Restored +${totalUnitsRestored} unit(s) back to inventory stock.`,
      'info'
    );
  };

  const getSalesData = () => sales;

  const getDailySalesReport = (date: Date) => getDailyReport(date);

  const getSalesReportData = (startDate: Date, endDate: Date) => getSalesReport(startDate, endDate);

  const getTopSellingProductsData = (startDate: Date, endDate: Date, limit?: number) => getTopSellingProducts(startDate, endDate, limit);

  // Supplier functions
  const addNewSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const id = `SUP-${Date.now()}`;
    const newSupplier = {
      ...supplierData,
      id,
      createdAt: new Date(),
      products: [],
    };
    try {
      await api.addSupplier(newSupplier);
      const updatedSuppliers = await api.getSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (err) {
      console.warn('Failed to add supplier to database, using offline fallback:', err);
      setSuppliers(prev => [...prev, newSupplier]);
    }

    await recordAuditLog({
      action: 'SUPPLIER_ADDED',
      category: 'supplier',
      severity: 'success',
      actorName: user?.name || 'Admin User',
      actorRole: user?.role || 'admin',
      entityId: id,
      entityName: supplierData.name,
      description: `Registered new supplier "${supplierData.name}" (Contact: ${supplierData.contactPerson}, Terms: ${supplierData.paymentTerms}).`,
    });

    showToast(`Supplier "${supplierData.name}" registered.`, 'success');
  };

  const updateExistingSupplier = async (id: string, updates: Partial<Supplier>) => {
    const existing = suppliers.find((s) => s.id === id);
    try {
      await api.updateSupplier(id, updates);
      const updatedSuppliers = await api.getSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (err) {
      console.warn('Failed to update supplier in database, using offline fallback:', err);
      setSuppliers(prev => prev.map(sup => sup.id === id ? { ...sup, ...updates } : sup));
    }

    await recordAuditLog({
      action: 'SUPPLIER_UPDATED',
      category: 'supplier',
      severity: 'info',
      actorName: user?.name || 'Admin User',
      actorRole: user?.role || 'admin',
      entityId: id,
      entityName: updates.name || existing?.name || id,
      description: `Updated supplier profile for "${updates.name || existing?.name || id}".`,
    });

    showToast('Supplier updated successfully.', 'success');
  };

  const deleteExistingSupplier = async (id: string) => {
    const existing = suppliers.find((s) => s.id === id);
    try {
      await api.deleteSupplier(id);
      const updatedSuppliers = await api.getSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (err) {
      console.warn('Failed to delete supplier from database, using offline fallback:', err);
      setSuppliers(prev => prev.filter(sup => sup.id !== id));
    }

    await recordAuditLog({
      action: 'SUPPLIER_DELETED',
      category: 'supplier',
      severity: 'warning',
      actorName: user?.name || 'Admin User',
      actorRole: user?.role || 'admin',
      entityId: id,
      entityName: existing?.name || id,
      description: `Removed supplier "${existing?.name || id}" from vendor directory.`,
    });

    showToast('Supplier removed.', 'info');
  };

  const searchSupplier = (query: string) => searchSuppliers(query);

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }];
    });
    showToast(`Added ${product.name} to cart.`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    showToast('Current order cart cleared.', 'info');
  };

  // Auth functions
  const login = (email: string, role: 'admin' | 'cashier') => {
    const actorName = role === 'admin' ? 'Admin User' : 'Cashier User';
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name: actorName,
      email,
      role
    });
    recordAuditLog({
      action: 'USER_LOGIN',
      category: 'auth',
      severity: 'info',
      actorName,
      actorRole: role,
      entityId: email,
      entityName: `${actorName} (${role.toUpperCase()})`,
      description: `Operator "${actorName}" (${email}) signed in to the ${role === 'admin' ? 'Admin Back-Office Portal' : 'POS Cashier Terminal'}.`,
    });
  };

  const logout = () => {
    if (user) {
      recordAuditLog({
        action: 'USER_LOGOUT',
        category: 'auth',
        severity: 'info',
        actorName: user.name,
        actorRole: user.role,
        entityId: user.email,
        entityName: `${user.name} (${user.role.toUpperCase()})`,
        description: `Operator "${user.name}" signed out of the session.`,
      });
    }
    setUser(null);
  };

  const seedDemoDatabase = async (): Promise<boolean> => {
    try {
      // 1. Try to seed database on the backend
      const result = await api.seedDemoData();
      if (result && result.success) {
        // Refresh all state from the database
        await refreshAllData();
        return true;
      }
      throw new Error(result?.error || 'Unknown backend error');
    } catch (err) {
      console.warn('Backend seeder failed or XAMPP not running. Falling back to offline mock data seeding in localStorage...', err);
      
      // Fallback: Seed offline data (products, sales, suppliers, alerts)
      const mockProducts = [
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
          image: '/IMG/CONS/Masonry Hammer.jpg',
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
          image: '/IMG/CONS/Measuring Tape.jpg',
        },
        {
          id: '25',
          name: 'Adjustable Wrench 12"',
          sku: 'HTL-WRN-025',
          category: 'Hand Tools',
          price: 650,
          costPrice: 420,
          quantity: 8,
          reorderLevel: 10,
          supplier: 'ABC Hardware Supplies',
          description: 'Chrome vanadium steel adjustable wrench, 12-inch',
          image: '/IMG/PLU/Pipe Wrench.jpg',
        },
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
          image: '/IMG/PWR/Cordless Drill.jpg',
        },
        {
          id: '19',
          name: 'Professional Angle Grinder 4"',
          sku: 'PWR-GRN-019',
          category: 'Power Tools',
          price: 3200,
          costPrice: 2100,
          quantity: 15,
          reorderLevel: 5,
          supplier: 'PowerTools Depot',
          description: '900W professional angle grinder with safety guard',
          image: '/IMG/PWR/Angle Grinder.jpg',
        },
        {
          id: '26',
          name: 'Circular Saw 1500W',
          sku: 'PWR-SAW-026',
          category: 'Power Tools',
          price: 5400,
          costPrice: 3800,
          quantity: 3,
          reorderLevel: 4,
          supplier: 'PowerTools Depot',
          description: 'Heavy duty circular saw with laser guide',
          image: '/IMG/PWR/Circular Saw.jpg',
        },
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
          image: '/IMG/CONS/Cement.jpg',
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
          image: '/IMG/CONS/Steel Bar.jpg',
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
          image: '/IMG/CONS/Hollow Blocks.jpg',
        },
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
          image: '/IMG/PLU/PVC Pipe.jpg',
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
          image: '/IMG/PLU/Faucet.jpg',
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
          image: '/IMG/PLU/Teflon Tape.jpg',
        },
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
          image: '/IMG/ELE/LED Bulb.jpg',
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
          image: '/IMG/ELE/Extension Cord.jpg',
        },
        {
          id: '29',
          name: 'THHN Wire 2.0mm (150m)',
          sku: 'ELE-WRE-029',
          category: 'Electrical',
          price: 3400,
          costPrice: 2800,
          quantity: 15,
          reorderLevel: 5,
          supplier: 'Lumina Tech',
          description: 'Stranded copper electrical wire, 150-meter roll',
          image: '/IMG/ELE/Electrical Wire.jpg',
        },
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
          image: '/IMG/CONS/Concrete Mixer.jpg',
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
          image: '/IMG/CONS/Cement.jpg',
        },
        {
          id: '20',
          name: 'Paint Thinner 1L',
          sku: 'PNT-THN-020',
          category: 'Painting',
          price: 180,
          costPrice: 110,
          quantity: 3,
          reorderLevel: 15,
          supplier: 'ColorTech Supplies',
          description: 'Grade A premium paint thinner for oil-based paints',
          image: '/IMG/CONS/Tile Adhesive.jpg',
        },
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
          image: '/IMG/CONS/Safety Helmet.jpg',
        },
        {
          id: '12',
          name: 'Auto-Darkening Welding Mask',
          sku: 'SAF-WLD-012',
          category: 'Safety',
          price: 2850,
          costPrice: 1950,
          quantity: 2,
          reorderLevel: 3,
          supplier: 'SafeBuild Inc',
          description: 'Solar-powered auto-darkening welding helmet, DIN 9-13',
          image: '/IMG/CONS/Safety Helmet.jpg',
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
          image: '/IMG/CONS/Safety Helmet.jpg',
        },
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
          image: '/IMG/FAS/Wood Screw.jpg',
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
          image: '/IMG/FAS/Brad Nail.jpg',
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
          image: '/IMG/FAS/Expansion Bolt.jpg',
        },
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
          image: '/IMG/PLU/Water Hose.jpg',
        },
        {
          id: '17',
          name: 'Industrial Wheelbarrow',
          sku: 'GAR-WHL-017',
          category: 'Garden',
          price: 3800,
          costPrice: 2900,
          quantity: 8,
          reorderLevel: 3,
          supplier: 'PowerTools Depot',
          description: 'Deep-dish steel wheelbarrow with pneumatic tire',
          image: '/IMG/CONS/Wheelbarrow.jpg',
        }
      ];

      const mockSuppliers = [
        {
          id: '1',
          name: 'ABC Hardware Supplies',
          email: 'procurement@abchardware.ph',
          phone: '+63 917 123 4567',
          address: '123 Rizal Ave',
          city: 'Manila',
          state: 'NCR',
          zipCode: '1000',
          country: 'Philippines',
          contactPerson: 'Jose Rizal',
          paymentTerms: 'Net30' as const,
          status: 'active' as const,
          rating: 4.8,
          averageDeliveryTime: 3,
          products: ['1', '7', '25', '11', '14', '31'],
          category: 'Hand Tools, Fasteners',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'BuildPro Materials',
          email: 'orders@buildpro.ph',
          phone: '+63 918 234 5678',
          address: '456 Bonifacio St',
          city: 'Quezon City',
          state: 'NCR',
          zipCode: '1100',
          country: 'Philippines',
          contactPerson: 'Andres Bonifacio',
          paymentTerms: 'COD' as const,
          status: 'active' as const,
          rating: 4.5,
          averageDeliveryTime: 5,
          products: ['5', '22', '27', '2', '21', '28'],
          category: 'Construction, Plumbing',
          createdAt: new Date(),
        },
        {
          id: '3',
          name: 'PowerTools Depot',
          email: 'sales@powertools.ph',
          phone: '+63 919 345 6789',
          address: '789 Luna Blvd',
          city: 'Cebu City',
          state: 'Cebu',
          zipCode: '6000',
          country: 'Philippines',
          contactPerson: 'Juan Luna',
          paymentTerms: 'Net30' as const,
          status: 'active' as const,
          rating: 4.9,
          averageDeliveryTime: 2,
          products: ['4', '19', '26', '17'],
          category: 'Power Tools, Garden',
          createdAt: new Date(),
        },
        {
          id: '4',
          name: 'Lumina Tech',
          email: 'support@luminatech.ph',
          phone: '+63 920 456 7890',
          address: '101 Aguinaldo Hwy',
          city: 'Cavite City',
          state: 'Cavite',
          zipCode: '4100',
          country: 'Philippines',
          contactPerson: 'Emilio Aguinaldo',
          paymentTerms: 'Net60' as const,
          status: 'active' as const,
          rating: 4.2,
          averageDeliveryTime: 4,
          products: ['6', '15', '29'],
          category: 'Electrical',
          createdAt: new Date(),
        },
        {
          id: '5',
          name: 'ColorTech Supplies',
          email: 'orders@colortech.ph',
          phone: '+63 921 567 8901',
          address: '202 Mabini St',
          city: 'Davao City',
          state: 'Davao del Sur',
          zipCode: '8000',
          country: 'Philippines',
          contactPerson: 'Apolinario Mabini',
          paymentTerms: 'Net30' as const,
          status: 'active' as const,
          rating: 4.6,
          averageDeliveryTime: 3,
          products: ['3', '8', '20'],
          category: 'Painting',
          createdAt: new Date(),
        },
        {
          id: '6',
          name: 'SafeBuild Inc',
          email: 'procurement@safebuild.ph',
          phone: '+63 922 678 9012',
          address: '303 Silang Way',
          city: 'Vigan City',
          state: 'Ilocos Sur',
          zipCode: '2700',
          country: 'Philippines',
          contactPerson: 'Gabriela Silang',
          paymentTerms: 'Net30' as const,
          status: 'active' as const,
          rating: 4.75,
          averageDeliveryTime: 2,
          products: ['9', '12', '30', '18'],
          category: 'Safety, Garden',
          createdAt: new Date(),
        }
      ];

      const mockSales: any[] = [];
      const cashiers = ['Sarah Cruz', 'Mark Santos', 'Dave Reyes', 'Jenny Lim'];
      const paymentMethods = ['cash', 'card', 'online', 'check'] as const;
      const customers = ['Juan dela Cruz', 'Maria Clara', 'Crisostomo Ibarra', 'Simoun', 'Leonor Rivera', 'Walk-in', 'Walk-in', 'Walk-in', 'Walk-in'];

      const now = new Date();
      for (let day = 30; day >= 0; day--) {
        const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
        const dayOfWeek = date.getDay(); // 0 is Sunday
        
        // Weekend has more transactions
        const numSales = (dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5) ? Math.floor(Math.random() * 5) + 6 : Math.floor(Math.random() * 3) + 3;
        
        for (let s = 0; s < numSales; s++) {
          const saleId = `SALE-${1716000000 + (day * 20000) + (s * 100) + Math.floor(Math.random() * 99)}`;
          const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];
          const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
          const customer = customers[Math.floor(Math.random() * customers.length)];
          
          const saleDate = new Date(date);
          saleDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
          
          const numItems = Math.floor(Math.random() * 3) + 1;
          const chosenProducts: any[] = [];
          const tempProds = [...mockProducts];
          for (let i = 0; i < numItems; i++) {
            const idx = Math.floor(Math.random() * tempProds.length);
            chosenProducts.push(tempProds.splice(idx, 1)[0]);
          }
          
          const saleItems = chosenProducts.map(p => {
            const quantity = p.category === 'Fasteners' ? Math.floor(Math.random() * 15) + 5 : (p.category === 'Construction' ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 2) + 1);
            return {
              productId: p.id,
              productName: p.name,
              quantity,
              unitPrice: p.price,
              discount: 0,
              total: p.price * quantity
            };
          });
          
          const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
          const discount = Math.random() > 0.85 ? Math.round(subtotal * (Math.floor(Math.random() * 11) + 5) / 100) : 0;
          const netTotal = subtotal - discount;
          const tax = Math.round(netTotal * 0.12);
          const total = netTotal + tax;
          
          mockSales.push({
            id: saleId,
            items: saleItems,
            subtotal,
            tax,
            discount,
            total,
            paymentMethod,
            amountPaid: paymentMethod === 'cash' ? Math.ceil(total / 50) * 50 : total,
            change: paymentMethod === 'cash' ? (Math.ceil(total / 50) * 50) - total : 0,
            status: 'completed',
            saleDate,
            customerName: customer,
            cashier,
            notes: customer !== 'Walk-in' ? `Customer: ${customer}` : ''
          });
        }
      }

      const mockAlerts = mockProducts
        .filter(p => p.quantity <= p.reorderLevel)
        .map(p => ({
          id: `ALT-${Math.random().toString(36).substr(2, 9)}`,
          productId: p.id,
          type: 'low-stock' as const,
          message: `Low stock alert: ${p.name} has only ${p.quantity} units left.`,
          createdAt: new Date()
        }));

      const initialLogs = buildInitialAuditLogs(mockSales, mockProducts);

      setProducts(mockProducts);
      setSales(mockSales);
      setSuppliers(mockSuppliers);
      setAlerts(mockAlerts);
      setAuditLogs(initialLogs);
      
      localStorage.setItem('pos_products', JSON.stringify(mockProducts));
      localStorage.setItem('pos_sales', JSON.stringify(mockSales));
      localStorage.setItem('pos_suppliers', JSON.stringify(mockSuppliers));
      localStorage.setItem('pos_alerts', JSON.stringify(mockAlerts));
      localStorage.setItem('pos_audit_logs', JSON.stringify(initialLogs));

      importInventory({ products: mockProducts, stockMovements: [], alerts: mockAlerts });
      importSales({ sales: mockSales, TAX_RATE: 0.12 });
      importSuppliers({ suppliers: mockSuppliers, purchaseOrders: [], payments: [], ratings: [] });

      return false; // Return false to indicate seeded in Offline Local Mode
    }
  };

  const value: AppContextType = {
    products,
    addNewProduct,
    updateExistingProduct,
    deleteExistingProduct,
    searchProduct,
    filterProductsByCategory,
    getProductCategories,
    addProductStock,
    removeProductStock,
    getLowStock,
    getInventoryAlerts,
    clearInventoryAlert,
    clearAllInventoryAlerts,
    sales,
    createNewSale,
    cancelExistingSale,
    getSalesData,
    getDailySalesReport,
    getSalesReportData,
    getTopSellingProducts: getTopSellingProductsData,
    suppliers,
    addNewSupplier,
    updateExistingSupplier,
    deleteExistingSupplier,
    searchSupplier,
    auditLogs,
    recordAuditLog,
    clearAuditLogs,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    user,
    isInitialized,
    login,
    logout,
    seedDemoDatabase,
    showToast,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AppContext.Provider>
  );
};
