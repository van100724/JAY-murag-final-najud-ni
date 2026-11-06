const API_BASE_URL = 'http://localhost/POS_inventory/api'; // Corrected path for XAMPP

export const api = {
  // Products
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products.php`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async addProduct(product: any) {
    const res = await fetch(`${API_BASE_URL}/products.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  },
  async updateProduct(id: string, updates: any) {
    const res = await fetch(`${API_BASE_URL}/products.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  },
  async deleteProduct(id: string) {
    const res = await fetch(`${API_BASE_URL}/products.php?id=${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  },

  // Sales
  async getSales() {
    const res = await fetch(`${API_BASE_URL}/sales.php`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async createSale(sale: any) {
    const res = await fetch(`${API_BASE_URL}/sales.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    const data = await res.json();
    if (!res.ok || data?.error || data?.success === false) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }
    return data;
  },
  async cancelSale(id: string) {
    const res = await fetch(`${API_BASE_URL}/sales.php?id=${id}`, {
      method: 'PUT',
    });
    const data = await res.json();
    if (!res.ok || data?.error || data?.success === false) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }
    return data;
  },

  // Suppliers
  async getSuppliers() {
    const res = await fetch(`${API_BASE_URL}/suppliers.php`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async addSupplier(supplier: any) {
    const res = await fetch(`${API_BASE_URL}/suppliers.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier),
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  },
  async deleteSupplier(id: string) {
    const res = await fetch(`${API_BASE_URL}/suppliers.php?id=${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  },
  async updateSupplier(id: string, updates: any) {
    const res = await fetch(`${API_BASE_URL}/suppliers.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  },

  // Alerts
  async getAlerts() {
    const res = await fetch(`${API_BASE_URL}/alerts.php`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await fetch(`${API_BASE_URL}/audit_logs.php`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async addAuditLog(entry: any) {
    const res = await fetch(`${API_BASE_URL}/audit_logs.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  },
  async deleteAuditLog(id: string) {
    const res = await fetch(`${API_BASE_URL}/audit_logs.php?id=${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  async clearAllAuditLogs() {
    const res = await fetch(`${API_BASE_URL}/audit_logs.php?id=all`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async seedDemoData() {
    const res = await fetch(`${API_BASE_URL}/populate_db.php`, {
      method: 'POST',
    });
    return res.json();
  }
};
