import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// GET /api/books - Browse all books (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, book_type } = req.query;
    
    let query = `
      SELECT id, title, author, description, category, book_type, 
             cover_image, isbn, buy_price, rent_24h_price, rent_7d_price,
             stock_quantity, status, created_at
      FROM books 
      WHERE status = 'active'
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    
    if (book_type) {
      query += ` AND book_type = $${paramIndex++}`;
      params.push(book_type);
    }
    
    if (search) {
      query += ` AND (title ILIKE $${paramIndex++} OR author ILIKE $${paramIndex++})`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/books/:id - Get book details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM books 
      WHERE id = $1 AND status = 'active'
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get book details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/books - Admin upload new book
router.post('/', async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      category,
      book_type = 'digital',
      cover_image,
      file_url,
      isbn,
      buy_price = 0,
      rent_24h_price = 0,
      rent_7d_price = 0,
      stock_quantity = 0,
      shipping_price = 0,
      uploaded_by
    } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }
    
    // Convert numeric fields properly
    const buyPrice = buy_price === null || buy_price === '' ? 0 : parseFloat(buy_price);
    const rent24hPrice = rent_24h_price === null || rent_24h_price === '' ? 0 : parseFloat(rent_24h_price);
    const rent7dPrice = rent_7d_price === null || rent_7d_price === '' ? 0 : parseFloat(rent_7d_price);
    const stockQty = stock_quantity === null || stock_quantity === '' ? 0 : parseInt(stock_quantity);
    const shippingPrice = shipping_price === null || shipping_price === '' ? 0 : parseFloat(shipping_price);
    
    const result = await pool.query(`
      INSERT INTO books (
        title, author, description, category, book_type, 
        cover_image, file_url, isbn, buy_price, rent_24h_price, 
        rent_7d_price, stock_quantity, shipping_price, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      title, author, description, category, book_type,
      cover_image, file_url, isbn, buyPrice, rent24hPrice,
      rent7dPrice, stockQty, shippingPrice, uploaded_by
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/books/:id - Admin update book
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        updateFields.push(`${key} = $${paramIndex++}`);
        updateValues.push(updates[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    updateValues.push(id);
    
    const query = `
      UPDATE books 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await pool.query(query, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/books/:id - Admin delete book
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE books 
      SET status = 'inactive', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/books/:id/purchase - Simulate purchase
router.post('/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, access_type, rental_duration_hours } = req.body;
    
    if (!user_id || !access_type) {
      return res.status(400).json({ message: 'User ID and access type are required' });
    }
    
    // Check if book exists
    const bookResult = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const book = bookResult.rows[0];
    
    // Calculate price based on access type
    let purchase_price = 0;
    let expires_at = null;
    
    if (access_type === 'purchased') {
      purchase_price = book.buy_price;
    } else if (access_type === 'rented') {
      if (rental_duration_hours === 24) {
        purchase_price = book.rent_24h_price;
      } else if (rental_duration_hours === 168) { // 7 days
        purchase_price = book.rent_7d_price;
      }
      expires_at = new Date(Date.now() + rental_duration_hours * 60 * 60 * 1000);
    }
    
    // Check if user already has access
    const existingAccess = await pool.query(
      'SELECT * FROM user_books WHERE user_id = $1 AND book_id = $2',
      [user_id, id]
    );
    
    console.log('Existing access check:', {
      user_id,
      book_id: id,
      existingAccess: existingAccess.rows,
      rowCount: existingAccess.rows.length
    });
    
    if (existingAccess.rows.length > 0) {
      return res.status(400).json({ 
        message: 'User already has access to this book',
        existing: existingAccess.rows[0]
      });
    }
    
    // Grant access
    const result = await pool.query(`
      INSERT INTO user_books (user_id, book_id, access_type, expires_at, purchase_price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user_id, id, access_type, expires_at, purchase_price]);
    
    res.status(201).json({
      message: 'Purchase successful',
      access: result.rows[0]
    });
  } catch (error) {
    console.error('Purchase book error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/my-books - Get user's books
router.get('/my-books/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    console.log('Fetching books for user:', user_id);
    
    const result = await pool.query(`
      SELECT b.*, ub.access_type, ub.expires_at, ub.purchase_price, ub.created_at as access_granted_at
      FROM books b
      JOIN user_books ub ON b.id = ub.book_id
      WHERE ub.user_id = $1 
        AND b.status = 'active'
        AND (ub.expires_at IS NULL OR ub.expires_at > NOW())
      ORDER BY ub.created_at DESC
    `, [user_id]);
    
    console.log('User books result:', {
      user_id,
      count: result.rows.length,
      books: result.rows
    });
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get user books error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/books/:id/view - Secure PDF access (simple ownership check)
router.get('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(401).json({ message: 'User ID required' });
    }
    
    // Check if user owns the book
    const accessResult = await pool.query(`
      SELECT * FROM user_books 
      WHERE user_id = $1 AND book_id = $2 
        AND (expires_at IS NULL OR expires_at > NOW())
    `, [user_id, id]);
    
    if (accessResult.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get book file URL
    const bookResult = await pool.query('SELECT file_url FROM books WHERE id = $1', [id]);
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const fileUrl = bookResult.rows[0].file_url;
    if (!fileUrl) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // For now, just return the file URL
    // Later we can implement blob serving
    res.json({ fileUrl });
  } catch (error) {
    console.error('View book error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
