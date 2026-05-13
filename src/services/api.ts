const API_BASE_URL = 'http://localhost/POS_inventory/api'; // Corrected path for XAMPP

export const api = {
  // Products
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products.php`);
    return res.json();
  },
  async addProduct(product: any) {
    const res = await fetch(`${API_BASE_URL}/products.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },
  async updateProduct(id: string, updates: any) {
    const res = await fetch(`${API_BASE_URL}/products.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  async deleteProduct(id: string) {
    const res = await fetch(`${API_BASE_URL}/products.php?id=${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Sales
  async getSales() {
    const res = await fetch(`${API_BASE_URL}/sales.php`);
    return res.json();
  },
  async createSale(sale: any) {
    const res = await fetch(`${API_BASE_URL}/sales.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    return res.json();
  },

  // Suppliers
  async getSuppliers() {
    const res = await fetch(`${API_BASE_URL}/suppliers.php`);
    return res.json();
  },
  async addSupplier(supplier: any) {
    const res = await fetch(`${API_BASE_URL}/suppliers.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier),
    });
    return res.json();
  },
  async deleteSupplier(id: string) {
    const res = await fetch(`${API_BASE_URL}/suppliers.php?id=${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  async updateSupplier(id: string, updates: any) {
    const res = await fetch(`${API_BASE_URL}/suppliers.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // Alerts
  async getAlerts() {
    const res = await fetch(`${API_BASE_URL}/alerts.php`);
    return res.json();
  },
  async deleteAlert(id: string) {
    const res = await fetch(`${API_BASE_URL}/alerts.php?id=${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  async clearAllAlerts() {
    const res = await fetch(`${API_BASE_URL}/alerts.php?id=all`, {
      method: 'DELETE',
    });
    return res.json();
  }
};
