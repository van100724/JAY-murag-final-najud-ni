import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Database Connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pos_inventory',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { id, name, sku, category, price, cost_price, quantity, reorder_level, supplier, description, image } = req.body;
  try {
    await pool.query(
      'INSERT INTO products (id, name, sku, category, price, cost_price, quantity, reorder_level, supplier, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, sku, category, price, cost_price, quantity, reorder_level, supplier, description, image]
    );
    res.status(201).json({ message: 'Product created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    await pool.query('UPDATE products SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SALES ---
app.get('/api/sales', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    // Fetch items for each sale
    const salesWithItems = await Promise.all(rows.map(async (sale) => {
      const [items] = await pool.query('SELECT * FROM sale_items WHERE sale_id = ?', [sale.id]);
      return { ...sale, items };
    }));
    res.json(salesWithItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const { id, customer_name, total, discount, payment_method, cashier, notes, items } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Insert sale
    await connection.query(
      'INSERT INTO sales (id, customer_name, total, discount, payment_method, cashier, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, customer_name, total, discount, payment_method, cashier, notes]
    );
    
    // Insert items and update stock
    for (const item of items) {
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [id, item.productId, item.productName, item.quantity, item.price]
      );
      
      await connection.query(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }
    
    await connection.commit();
    res.status(201).json({ message: 'Sale completed' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// --- SUPPLIERS ---
app.get('/api/suppliers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers');
    const mappedRows = rows.map(row => ({
      id: row.id,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      paymentTerms: row.payment_terms,
      category: row.category,
      status: row.status,
      rating: row.rating,
      totalOrders: row.total_orders,
      totalSpent: row.total_spent,
      averageDeliveryTime: row.average_delivery_time,
      createdAt: row.created_at
    }));
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  const { 
    id, name, contactPerson, email, phone, address, city, state, 
    zipCode, country, paymentTerms, category, status, rating 
  } = req.body;
  try {
    await pool.query(
      `INSERT INTO suppliers 
       (id, name, contact_person, email, phone, address, city, state, zip_code, country, payment_terms, category, status, rating) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, contactPerson, email, phone, address, city, state, zipCode, country, paymentTerms, category, status, rating]
    );
    res.status(201).json({ message: 'Supplier created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  
  // Map camelCase to snake_case
  const updates = {};
  if (body.name) updates.name = body.name;
  if (body.contactPerson) updates.contact_person = body.contactPerson;
  if (body.email) updates.email = body.email;
  if (body.phone) updates.phone = body.phone;
  if (body.address) updates.address = body.address;
  if (body.city) updates.city = body.city;
  if (body.state) updates.state = body.state;
  if (body.zipCode) updates.zip_code = body.zipCode;
  if (body.country) updates.country = body.country;
  if (body.paymentTerms) updates.payment_terms = body.paymentTerms;
  if (body.category) updates.category = body.category;
  if (body.status) updates.status = body.status;
  if (body.rating) updates.rating = body.rating;

  try {
    await pool.query('UPDATE suppliers SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Supplier updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
