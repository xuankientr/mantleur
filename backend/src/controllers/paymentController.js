const crypto = require('crypto');
const qs = require('qs');
const prisma = require('../models/database');

// VNPay configuration
const vnp_TmnCode = process.env.VNP_TMN_CODE;
const vnp_HashSecret = (process.env.VNP_HASH_SECRET || '').trim();
const vnp_Url = (process.env.VNP_URL || '').trim();
const vnp_ReturnUrl = (process.env.VNP_RETURN_URL || 'http://localhost:5000/api/payments/return').replace(/\/$/, '');

// Helper function to sort object for VNPay
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(key);
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = obj[str[key]];
  }
  return sorted;
}

// Create VNPay payment URL
function createPaymentUrl(orderId, amount, orderInfo, bankCode = '') {
  // Use Vietnam timezone (UTC+7)
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const createDate = vietnamTime.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const expireDate = new Date(vietnamTime.getTime() + 1 * 60 * 60 * 1000).toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  
  console.log('🕐 Create Date:', createDate);
  console.log('🕐 Expire Date:', expireDate);

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = Math.round(amount) * 100; // Multiply by 100 for VNPay
  vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
  vnp_Params['vnp_IpAddr'] = '192.168.1.1';
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_ExpireDate'] = expireDate;
  
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  // 👉 KHÔNG thêm vnp_SecureHashType ở đây, chỉ thêm sau khi ký xong
  const sorted = sortObject(vnp_Params);

  // VNPay Sandbox yêu cầu spaces as + cho signData
  const signData = Object.keys(sorted)
    .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
    .join('&')
    .replace(/%20/g, '+');

  console.log('🔐 Sign Data:', signData);
  console.log('🔐 Hash Secret:', vnp_HashSecret);

  const signed = crypto
    .createHmac('sha512', vnp_HashSecret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex')
    .toUpperCase();

  console.log('🔐 My Hash:', signed);

  // ✅ chỉ thêm vnp_SecureHash (VNPay Sandbox không chấp nhận vnp_SecureHashType)
  sorted['vnp_SecureHash'] = signed;
  // ❌ KHÔNG thêm vnp_SecureHashType cho Sandbox
  
  console.log('🔐 Generated Hash:', signed);
  console.log('✅ Final params sent to VNPay:', sorted);
  
  const paymentUrl = `${vnp_Url}?${Object.keys(sorted)
    .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
    .join('&')}`;

  console.log('✅ Payment URL:', paymentUrl);

  return paymentUrl;
}

// Create payment URL
exports.createPayment = async (req, res) => {
  try {
    console.log('🔍 createPayment called with:', req.body);
    console.log('🔍 userId:', req.userId);
    
    const { amount } = req.body;
    const userId = req.userId;

    // Validate input
    if (!amount) {
      console.log('❌ Missing amount');
      return res.status(400).json({ error: 'Missing amount' });
    }

    if (amount < 10000 || amount > 50000000) {
      return res.status(400).json({ error: 'Amount must be between 10,000 and 50,000,000 VND' });
    }

    // Generate order ID
    const orderId = `DEPOSIT_${userId}_${Date.now()}`;
    const orderInfo = `Nap tien vao tai khoan`;
    
    console.log('🔍 Order ID:', orderId);
    console.log('🔍 Order Info:', orderInfo);

    // Create VNPay payment URL
    const paymentUrl = createPaymentUrl(orderId, amount, orderInfo);

    // Save transaction to database
    console.log('💾 Saving transaction to database...');
    const transaction = await prisma.transaction.create({
      data: {
        userId: userId,
        type: 'deposit',
        amount: amount,
        status: 'pending',
        txnId: orderId,
      }
    });
    console.log('✅ Transaction saved:', transaction);

    console.log(`✅ Payment created - Order ID: ${orderId}, Amount: ${amount} VND, User: ${userId}`);
    
    res.json({ 
      paymentUrl, 
      orderId,
      transactionId: transaction.id
    });

  } catch (error) {
    console.error('❌ Error creating payment:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle VNPay callback (robust version)
exports.paymentReturn = async (req, res) => {
  try {
    console.log('🚀 CALLBACK RECEIVED - Starting processing...');
    
    // Raw logs to help debug encoding issues
    console.log('📥 Raw originalUrl:', req.originalUrl); // shows raw query as arrived
    console.log('📥 req.query (parsed):', req.query);
    console.log('📥 req.query keys:', Object.keys(req.query));
    console.log('📥 req.query values:', Object.values(req.query));
    console.log('VNPay Return Params:', req.query);

    // Copy params so we don't mutate req.query directly
    const vnp_Params = { ...req.query };

    // Extract received secure hash
    const receivedSecureHash = (vnp_Params['vnp_SecureHash'] || '').toUpperCase();
    console.log('🔐 Received SecureHash (uppercased):', receivedSecureHash);

    // Remove secure hash fields before recomputing
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Ensure secret has no stray spaces/newlines
    const secret = (process.env.VNP_HASH_SECRET || '').trim();
    if (!secret) {
      console.error('❌ VNP_HASH_SECRET is empty. Check your env var.');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed`);
    }

    // Sort keys A-Z
    const sortedKeys = Object.keys(vnp_Params).sort();
    const sorted = {};
    sortedKeys.forEach(k => sorted[k] = vnp_Params[k]);

    // Build signData using encodeURIComponent on each value, then replace %20 with +
    const signData = sortedKeys
      .map(key => `${key}=${encodeURIComponent(sorted[key])}`)
      .join('&')
      .replace(/%20/g, '+');

    console.log('🔐 Sorted params for verify:', sorted);
    console.log('🔐 SignData:', signData);
    console.log('🔐 Using secret (trimmed):', secret.length > 0 ? '[OK]' : '[EMPTY]');

    // Compute HMAC SHA512
    const signed = crypto.createHmac('sha512', secret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex')
      .toUpperCase();

    console.log('🔐 Generated Hash:', signed);

    // Compare received hash
    const match = receivedSecureHash === signed;

    if (!match) {
      console.log('❌ Checksum verification failed');
      console.log('❌ Expected:', signed);
      console.log('❌ Received:', receivedSecureHash);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed`);
    }

    console.log('✅ Checksum verified successfully');

    // Now process response (use vnp_ResponseCode to detect success)
    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'] || req.query['vnp_ResponseCode'];
    const vnp_TxnRef = vnp_Params['vnp_TxnRef'] || req.query['vnp_TxnRef'];
    const vnp_Amount = vnp_Params['vnp_Amount'] || req.query['vnp_Amount'];

    if (vnp_ResponseCode === '00') {
      // Payment successful
      const txnId = vnp_TxnRef;
      const amount = parseInt(vnp_Amount, 10) / 100; // Convert back from VNPay format

      console.log(`✅ Payment successful - Order ID: ${txnId}, Amount: ${amount} VND`);

      // Extract user ID from order ID (format: DEPOSIT_userId_timestamp)
      const userId = txnId.split('_')[1];

      // Update transaction status
      await prisma.transaction.updateMany({
        where: { txnId: txnId },
        data: { status: 'success' }
      });

      // Add balance to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          coinBalance: {
            increment: Math.floor(amount / 100) // Convert VND to coins (100 VND = 1 coin)
          }
        }
      });

      console.log(`✅ Balance added - User ID: ${userId}, Amount: ${amount} VND`);

      // Redirect to success page
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?orderId=${txnId}&amount=${amount}`);
    } else {
      // Payment failed
      console.log(`❌ Payment failed - Response Code: ${vnp_ResponseCode}, TxnRef: ${vnp_TxnRef}`);

      // Update transaction status
      await prisma.transaction.updateMany({
        where: { txnId: vnp_TxnRef },
        data: { status: 'failed' }
      });

      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?orderId=${vnp_TxnRef}`);
    }
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed`);
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;

    const transactions = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(transactions);

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user balance
exports.getUserBalance = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance: user.coinBalance });

  } catch (error) {
    console.error('Error fetching user balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};