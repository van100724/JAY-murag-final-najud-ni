import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
  filterByCategory,
  getCategories,
  addStock,
  removeStock,
  getLowStockProducts,
  getAlerts,
  clearAlert,
  clearAllAlerts,
  importInventory,
} from '../data/inventory';
import { api } from '../services/api';
import type { Product } from '../data/inventory';
import { 
  importSales, 
  getDailyReport, 
  getSalesReport, 
  getTopSellingProducts,
  getAllSales,
  cancelSale
} from '../data/sales';
import type { Sale } from '../data/sales';
import { 
  importSuppliers,
  addSupplier,
  getAllSuppliers,
  updateSupplier,
  deleteSupplier,
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
  cancelExistingSale: (saleId: string) => void;
  getSalesData: () => Sale[];
  getDailySalesReport: (date: Date) => any;
  getSalesReportData: (startDate: Date, endDate: Date) => any;
  getTopSellingProducts: (startDate: Date, endDate: Date, limit?: number) => any[];

  // Suppliers
  suppliers: Supplier[];
  addNewSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'averageDeliveryTime'>) => void;
  updateExistingSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteExistingSupplier: (id: string) => void;
  searchSupplier: (query: string) => Supplier[];

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Auth
  user: User | null;
  isInitialized: boolean;
  login: (email: string, role: 'admin' | 'cashier') => void;
  logout: () => void;
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

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Central function to fetch all data from XAMPP Backend
  const refreshAllData = async () => {
    try {
      const [p, s, sup, a] = await Promise.all([
        api.getProducts(),
        api.getSales(),
        api.getSuppliers(),
        api.getAlerts()
      ]);
      
      setProducts(p);
      setSales(s);
      setSuppliers(sup);
      setAlerts(a);
      
      // Sync the local data layer (optional but good for compatibility)
      importInventory({ products: p, stockMovements: [], alerts: a });
      importSales({ sales: s, TAX_RATE: 0.12 });
      // importSuppliers(sup); // Not exported or used correctly? Just state is enough.
    } catch (err) {
      console.error('Failed to fetch data from XAMPP Backend:', err);
    }
  };

  // Initialize and implement Polling
  useEffect(() => {
    const init = async () => {
      await refreshAllData();
      
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
    localStorage.setItem('pos_cart', JSON.stringify(cart));
    if (user) {
      localStorage.setItem('pos_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pos_user');
    }
  }, [products, sales, suppliers, cart, user, isInitialized]);

  // Inventory functions
  const addNewProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newProduct = { ...productData, id };
      await api.addProduct(newProduct);
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const updateExistingProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await api.updateProduct(id, updates);
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  const deleteExistingProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
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

  const getLowStock = () => products.filter(p => p.quantity <= p.reorderLevel);

  const getInventoryAlerts = () => alerts;

  const clearInventoryAlert = async (alertId: string) => {
    try {
      await api.deleteAlert(alertId);
      const updatedAlerts = await api.getAlerts();
      setAlerts(updatedAlerts);
    } catch (err) {
      console.error('Failed to clear alert:', err);
    }
  };

  const clearAllInventoryAlerts = async () => {
    try {
      await api.clearAllAlerts();
      setAlerts([]);
    } catch (err) {
      console.error('Failed to clear all alerts:', err);
    }
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
    try {
      const id = `SALE-${Date.now()}`;
      
      // Use passed total/tax or calculate if not provided (with fallback for item property names)
      const calculatedTotal = total || (items.reduce((sum, item) => sum + ((item.price || item.unitPrice || 0) * item.quantity), 0) - (discount || 0));
      const calculatedTax = tax || (calculatedTotal * 0.12);
      
      const saleData = {
        id,
        customer_name: notes && notes.startsWith('Customer: ') ? notes.replace('Customer: ', '') : 'Walk-in',
        total: calculatedTotal,
        tax: calculatedTax,
        discount: discount || 0,
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        change_amount: change || (amountPaid - calculatedTotal),
        cashier: cashier || 'Unknown',
        notes: notes || '',
        items: items.map(item => ({
          ...item,
          price: item.price || item.unitPrice // Ensure backend gets 'price'
        }))
      };
      
      await api.createSale(saleData);
      
      // Immediate accuracy: Refresh all data to sync state across the app
      await refreshAllData();
      
      return saleData;
    } catch (err) {
      console.error('Failed to create sale:', err);
      return null;
    }
  };

  const cancelExistingSale = (saleId: string) => {
    cancelSale(saleId);
    setSales(getAllSales());
  };

  const getSalesData = () => sales;

  const getDailySalesReport = (date: Date) => getDailyReport(date);

  const getSalesReportData = (startDate: Date, endDate: Date) => getSalesReport(startDate, endDate);

  const getTopSellingProductsData = (startDate: Date, endDate: Date, limit?: number) => getTopSellingProducts(startDate, endDate, limit);

  // Supplier functions
  const addNewSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'averageDeliveryTime'>) => {
    try {
      const id = `SUP-${Date.now()}`;
      await api.addSupplier({ ...supplierData, id });
      const updatedSuppliers = await api.getSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (err) {
      console.error('Failed to add supplier:', err);
    }
  };

  const updateExistingSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      await api.updateSupplier(id, updates);
      const updatedSuppliers = await api.getSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (err) {
      console.error('Failed to update supplier:', err);
    }
  };

  const deleteExistingSupplier = async (id: string) => {
    try {
      await api.deleteSupplier(id);
      const updatedSuppliers = await api.getSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (err) {
      console.error('Failed to delete supplier:', err);
    }
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

  const clearCart = () => setCart([]);

  // Auth functions
  const login = (email: string, role: 'admin' | 'cashier') => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name: role === 'admin' ? 'Admin User' : 'Cashier User',
      email,
      role
    });
  };

  const logout = () => {
    setUser(null);
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
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    user,
    isInitialized,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};