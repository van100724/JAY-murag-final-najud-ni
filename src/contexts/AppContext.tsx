import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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
  cancelExistingSale: (saleId: string) => Promise<void>;
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
      
      // Ensure all dates fetched from MariaDB are real Date objects for reports/charts
      const parsedSales = s.map((sale: any) => ({
        ...sale,
        saleDate: new Date(sale.saleDate)
      }));
      
      const parsedProducts = p.map((prod: any) => ({
        ...prod,
        costPrice: prod.costPrice !== undefined ? Number(prod.costPrice) : Number(prod.cost_price ?? 0),
        reorderLevel: prod.reorderLevel !== undefined ? Number(prod.reorderLevel) : Number(prod.reorder_level ?? 0),
      }));

      setProducts(parsedProducts);
      setSales(parsedSales);
      setSuppliers(sup);
      setAlerts(a);
      
      // Sync the local data layer (optional but good for compatibility)
      importInventory({ products: p, stockMovements: [], alerts: a });
      importSales({ sales: parsedSales, TAX_RATE: 0.12 });
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
      const parsedProducts = updatedProducts.map((prod: any) => ({
        ...prod,
        costPrice: prod.costPrice !== undefined ? Number(prod.costPrice) : Number(prod.cost_price ?? 0),
        reorderLevel: prod.reorderLevel !== undefined ? Number(prod.reorderLevel) : Number(prod.reorder_level ?? 0),
      }));
      setProducts(parsedProducts);
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const updateExistingProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await api.updateProduct(id, updates);
      const updatedProducts = await api.getProducts();
      const parsedProducts = updatedProducts.map((prod: any) => ({
        ...prod,
        costPrice: prod.costPrice !== undefined ? Number(prod.costPrice) : Number(prod.cost_price ?? 0),
        reorderLevel: prod.reorderLevel !== undefined ? Number(prod.reorderLevel) : Number(prod.reorder_level ?? 0),
      }));
      setProducts(parsedProducts);
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  const deleteExistingProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      const updatedProducts = await api.getProducts();
      const parsedProducts = updatedProducts.map((prod: any) => ({
        ...prod,
        costPrice: prod.costPrice !== undefined ? Number(prod.costPrice) : Number(prod.cost_price ?? 0),
        reorderLevel: prod.reorderLevel !== undefined ? Number(prod.reorderLevel) : Number(prod.reorder_level ?? 0),
      }));
      setProducts(parsedProducts);
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

  const cancelExistingSale = async (saleId: string) => {
    try {
      await api.cancelSale(saleId);
      await refreshAllData();
    } catch (err) {
      console.warn('Failed to cancel sale in database, using offline fallback:', err);
      setSales(prev => prev.map(sale => sale.id === saleId ? { ...sale, status: 'cancelled' } : sale));
    }
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
  };

  const updateExistingSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      await api.updateSupplier(id, updates);
      const updatedSuppliers = await api.getSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (err) {
      console.warn('Failed to update supplier in database, using offline fallback:', err);
      setSuppliers(prev => prev.map(sup => sup.id === id ? { ...sup, ...updates } : sup));
    }
  };

  const deleteExistingSupplier = async (id: string) => {
    try {
      await api.deleteSupplier(id);
      const updatedSuppliers = await api.getSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (err) {
      console.warn('Failed to delete supplier from database, using offline fallback:', err);
      setSuppliers(prev => prev.filter(sup => sup.id !== id));
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

      setProducts(mockProducts);
      setSales(mockSales);
      setSuppliers(mockSuppliers);
      setAlerts(mockAlerts);
      
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};