import { Router } from 'express';
import { Pool } from 'pg';
import crypto from 'crypto';

const router = Router();
const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5432/theology_test"
});

// This function handles the POST request from Chapa
router.post('/', async (req, res) => {
  console.log('🔔 Chapa Webhook Received!');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  try {
    // 1. SECURITY: Verify that this request actually came from Chapa
    const secret = process.env.CHAPA_WEBHOOK_SECRET;
    if (!secret) {
      console.error("CHAPA_WEBHOOK_SECRET not configured");
      return res.status(500).send("Server configuration error");
    }
    
    console.log('🔐 Verifying signature...');
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const chapaSignature = req.headers['x-chapa-signature'];
    console.log('🔍 Generated hash:', hash);
    console.log('🔍 Chapa signature:', chapaSignature);

    if (hash !== chapaSignature) {
      console.error("❌ Access Denied: Invalid Signature");
      return res.status(401).send("Unauthorized");
    }

    console.log('✅ Signature verified successfully!');

    // 2. EXTRACT DATA
    const { tx_ref, status, amount } = req.body;
    console.log(`📋 Processing transaction: ${tx_ref}, status: ${status}, amount: ${amount}`);

    if (status === 'success') {
      console.log('🎉 Payment successful - processing enrollment...');
      
      // 3. IDEMPOTENCY CHECK: Ensure we haven't processed this already
      console.log(`🔍 Checking existing transaction: ${tx_ref}`);
      const existingTx = await pool.query(
        "SELECT status, user_id, course_id FROM transactions WHERE tx_ref = $1", 
        [tx_ref]
      );

      if (existingTx.rows.length === 0) {
        console.error(`❌ Transaction not found: ${tx_ref}`);
        return res.status(404).send("Transaction not found");
      }

      console.log(`📊 Found transaction: status=${existingTx.rows[0].status}, user_id=${existingTx.rows[0].user_id}, course_id=${existingTx.rows[0].course_id}`);

      if (existingTx.rows[0].status === 'success') {
        // If it's already success, just tell Chapa "Got it!" and stop.
        console.log(`ℹ️ Transaction already processed: ${tx_ref}`);
        return res.status(200).send("Already processed");
      }

      // 4. ATOMIC DATABASE UPDATE
      console.log('🔄 Starting database transaction...');
      // We use a client transaction to ensure both steps happen or none do.
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // A. Update the transaction table
        console.log(`💾 Updating transaction status to 'success' for: ${tx_ref}`);
        console.log('🔍 Full webhook body:', JSON.stringify(req.body, null, 2));
        const chapaReference = req.body.reference;
        console.log(`🔍 Extracted Chapa reference: ${chapaReference}`);
        await client.query(
          "UPDATE transactions SET status = 'success', reference = $2, updated_at = NOW() WHERE tx_ref = $1",
          [tx_ref, chapaReference]
        );

        // B. Create the Enrollment (The actual "Product" delivery)
        // Check if user is already enrolled first
        console.log(`🔍 Checking if user ${existingTx.rows[0].user_id} is already enrolled in course ${existingTx.rows[0].course_id}`);
        const enrollmentCheck = await client.query(
          'SELECT * FROM "Enrollment" WHERE "userId" = $1 AND "courseId" = $2',
          [existingTx.rows[0].user_id, existingTx.rows[0].course_id]
        );

        if (enrollmentCheck.rows.length === 0) {
          console.log(`✅ Enrolling user ${existingTx.rows[0].user_id} in course ${existingTx.rows[0].course_id}`);
          await client.query(
            'INSERT INTO "Enrollment" ("userId", "courseId", "status", "progressPercent", "completed", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
            [existingTx.rows[0].user_id, existingTx.rows[0].course_id, 'active', 0, false]
          );
          console.log(`🎓 User ${existingTx.rows[0].user_id} successfully enrolled in course ${existingTx.rows[0].course_id} for tx_ref: ${tx_ref}`);
        } else {
          console.log(`ℹ️ User already enrolled in course ${existingTx.rows[0].course_id}`);
        }

        await client.query('COMMIT');
        console.log(`✅ Payment processed successfully for tx_ref: ${tx_ref}`);

      } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Database transaction failed:', error);
        throw error;
      } finally {
        client.release();
      }
    } else if (status === 'failed') {
      // Handle failed payments
      console.log(`❌ Payment failed for tx_ref: ${tx_ref}`);
      await pool.query(
        "UPDATE transactions SET status = 'failed', updated_at = NOW() WHERE tx_ref = $1",
        [tx_ref]
      );
      console.log(`💾 Updated transaction status to 'failed' for: ${tx_ref}`);
    } else {
      console.log(`ℹ️ Received payment status: ${status} for tx_ref: ${tx_ref}`);
    }

    // 5. ALWAYS RESPOND TO CHAPA
    // If you don't send a 200 OK, Chapa will keep retrying for 24 hours.
    console.log(`📤 Sending 200 OK response to Chapa`);
    res.status(200).send("Webhook Received");

  } catch (error) {
    console.error("❌ Webhook Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
