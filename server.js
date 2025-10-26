const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const vnpay = require('vnpay');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'livestream_payment',
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// Initialize VNPay
const vnp_TmnCode = process.env.VNP_TMN_CODE;
const vnp_HashSecret = process.env.VNP_HASH_SECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

console.log('VNPay Configuration:');
console.log('- TMN Code:', vnp_TmnCode);
console.log('- Return URL:', vnp_ReturnUrl);

// VNPay helper function
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

function createPaymentUrl(orderId, amount, orderInfo, bankCode = '') {
  let createDate = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
  let expireDate = new Date(Date.now() + 60 * 60 * 1000).toISOString().replace(/[-:T]/g, '').split('.')[0];

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100; // Multiply by 100 for VNPay
  vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
  vnp_Params['vnp_IpAddr'] = '127.0.0.1';
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_ExpireDate'] = expireDate;
  
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  // Create hash
  const querystring = require('qs');
  const crypto = require('crypto');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", vnp_HashSecret);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;
  
  // Build URL
  let url = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });
  
  return url;
}

// Route: Create deposit payment
app.post('/api/payment/create', async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // Validate input
    if (!userId || !amount) {
      return res.status(400).json({ error: 'Missing userId or amount' });
    }

    if (amount < 10000 || amount > 50000000) {
      return res.status(400).json({ error: 'Amount must be between 10,000 and 50,000,000 VND' });
    }

    // Generate order ID
    const orderId = `DEPOSIT_${userId}_${Date.now()}`;
    const orderInfo = `Nap tien vao tai khoan - User ID: ${userId}`;

    // Create VNPay payment URL
    const paymentUrl = createPaymentUrl(orderId, amount, orderInfo);

    // Save transaction to database
    const query = 'INSERT INTO transactions (user_id, type, amount, status, txn_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [userId, 'deposit', amount, 'pending', orderId], (err, result) => {
      if (err) {
        console.error('Error saving transaction:', err);
        return res.status(500).json({ error: 'Failed to save transaction' });
      }

      console.log(`✅ Payment created - Order ID: ${orderId}, Amount: ${amount} VND, User: ${userId}`);
      res.json({ paymentUrl, orderId });
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Handle VNPay callback
app.get('/api/payment/return', async (req, res) => {
  try {
    const vnp_Params = req.query;
    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionStatus, vnp_Amount, vnp_SecureHash } = vnp_Params;

    console.log('📥 VNPay callback received:', vnp_Params);

    // Verify checksum
    const querystring = require('qs');
    const crypto = require('crypto');
    
    let vnp_SecureHash_check = '';
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    signData = signData.replace(/(%20)/g, "+");
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    vnp_SecureHash_check = signed;

    if (vnp_SecureHash === vnp_SecureHash_check) {
      // Checksum valid
      if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
        // Payment successful
        const txnId = vnp_TxnRef;
        const amount = parseInt(vnp_Amount) / 100; // Convert back from VNPay format

        console.log(`✅ Payment successful - Order ID: ${txnId}, Amount: ${amount} VND`);

        // Extract user ID from order ID (format: DEPOSIT_userId_timestamp)
        const userId = parseInt(txnId.split('_')[1]);

        // Update transaction status
        db.query(
          'UPDATE transactions SET status = ?, txn_id = ? WHERE txn_id = ?',
          ['success', vnp_TxnRef, txnId],
          (err, result) => {
            if (err) {
              console.error('Error updating transaction:', err);
            }
          }
        );

        // Add balance to user
        db.query(
          'UPDATE users SET balance = balance + ? WHERE id = ?',
          [amount, userId],
          (err, result) => {
            if (err) {
              console.error('Error updating user balance:', err);
            } else {
              console.log(`✅ Balance added - User ID: ${userId}, Amount: ${amount} VND`);
            }
          }
        );

        // Redirect to success page
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?orderId=${txnId}&amount=${amount}`);
      } else {
        // Payment failed
        console.log(`❌ Payment failed - Response Code: ${vnp_ResponseCode}`);
        
        // Update transaction status
        db.query(
          'UPDATE transactions SET status = ? WHERE txn_id = ?',
          ['failed', txnId],
          (err, result) => {
            if (err) {
              console.error('Error updating transaction:', err);
            }
          }
        );

        // Redirect to failure page
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?orderId=${txnId}`);
      }
    } else {
      // Checksum invalid
      console.log('❌ Checksum verification failed');
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?orderId=${txnId}`);
    }
  } catch (error) {
    console.error('Error processing payment callback:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed`);
  }
});

// Route: Request withdrawal
app.post('/api/withdraw/request', async (req, res) => {
  try {
    const { userId, amount, method, accountInfo } = req.body;

    // Validate input
    if (!userId || !amount || !method || !accountInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check user balance
    db.query('SELECT balance FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userBalance = parseFloat(result[0].balance);

      if (userBalance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Create withdrawal request
      db.query(
        'INSERT INTO withdraw_requests (user_id, amount, method, account_info, status) VALUES (?, ?, ?, ?, ?)',
        [userId, amount, method, accountInfo, 'pending'],
        (err, insertResult) => {
          if (err) {
            console.error('Error creating withdrawal request:', err);
            return res.status(500).json({ error: 'Failed to create withdrawal request' });
          }

          // Deduct balance
          db.query(
            'UPDATE users SET balance = balance - ? WHERE id = ?',
            [amount, userId],
            (err) => {
              if (err) {
                console.error('Error deducting balance:', err);
                return res.status(500).json({ error: 'Failed to deduct balance' });
              }

              console.log(`✅ Withdrawal request created - User ID: ${userId}, Amount: ${amount} VND`);
              res.json({ 
                success: true, 
                requestId: insertResult.insertId,
                message: 'Withdrawal request created successfully' 
              });
            }
          );
        }
      );
    });

  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Get withdrawal list (admin)
app.get('/api/withdraw/list', async (req, res) => {
  try {
    const status = req.query.status || 'all';

    let query = `
      SELECT wr.*, u.username, u.balance 
      FROM withdraw_requests wr
      LEFT JOIN users u ON wr.user_id = u.id
    `;

    if (status !== 'all') {
      query += ' WHERE wr.status = ?';
      db.query(query, [status], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
      });
    } else {
      db.query(query, (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
      });
    }

  } catch (error) {
    console.error('Error fetching withdrawal list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Complete withdrawal (admin)
app.post('/api/withdraw/complete/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body; // 'approved', 'rejected', 'completed'

    db.query(
      'UPDATE withdraw_requests SET status = ? WHERE id = ?',
      [status, requestId],
      (err, result) => {
        if (err) {
          console.error('Error updating withdrawal request:', err);
          return res.status(500).json({ error: 'Failed to update withdrawal request' });
        }

        console.log(`✅ Withdrawal request ${requestId} updated to ${status}`);
        res.json({ success: true, message: 'Withdrawal request updated successfully' });
      }
    );

  } catch (error) {
    console.error('Error completing withdrawal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Get transaction history
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    db.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
      }
    );

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Get user balance
app.get('/api/users/:userId/balance', async (req, res) => {
  try {
    const userId = req.params.userId;

    db.query(
      'SELECT balance FROM users WHERE id = ?',
      [userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({ balance: results[0].balance });
      }
    );

  } catch (error) {
    console.error('Error fetching user balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Payment server running on port ${PORT}`);
  console.log(`📍 VNPay Sandbox URL: ${vnp_Url}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});


