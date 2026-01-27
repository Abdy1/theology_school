import { Router } from 'express';
import { Pool } from 'pg';
import axios from 'axios';
import crypto from 'crypto';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Initialize payment (PROTECTED route)
router.post('/initialize', async (req, res) => {
  try {
      const { userId, courseId, amount, email, firstName } = req.body;

      // Validate required fields
      if (!userId || !courseId || !amount || !email || !firstName) {
        return res.status(400).json({ error: 'Missing required fields: userId, courseId, amount, email, firstName' });
      }

      // Generate unique transaction reference
      const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
      const tx_ref = `TX-${userId}-${courseId}-${Date.now()}-${randomStr}`;

      // Save to database (Status: Pending)
      await pool.query(
        'INSERT INTO transactions (tx_ref, user_id, course_id, amount, status) VALUES ($1, $2, $3, $4, $5)',
        [tx_ref, userId, courseId, amount, 'pending']
      );

      // Call Chapa API
      const chapaResponse = await axios.post(
        'https://api.chapa.co/v1/transaction/initialize',
          {
            amount: amount,
            currency: 'ETB',
            email: email,
            first_name: firstName,
            tx_ref: tx_ref,
            callback_url: 'https://api.dothanministries.org/webhooks/chapa',
            return_url: `https://dothanministries.org/payment-success?tx_ref=${tx_ref}`,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` 
            }
          }
        );
        const checkoutUrl = chapaResponse.data.data.checkout_url;

      // Send checkout URL to React
      res.json({ 
        success: true,
        checkout_url: checkoutUrl,
        tx_ref: tx_ref 
      });

    } catch (error: any) {
      console.error("Chapa Initialization Error:", error.response?.data || error.message);
      res.status(500).json({ 
        success: false,
        error: "Failed to initialize payment" 
      });
    }
});

// GET /api/payment/status/:tx_ref - Check transaction status
router.get('/status/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM transactions WHERE tx_ref = $1',
      [tx_ref]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Transaction not found' 
      });
    }

    res.json({
      success: true,
      transaction: result.rows[0]
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check payment status' 
    });
  }
});

export default router;
