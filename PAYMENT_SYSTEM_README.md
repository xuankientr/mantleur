# 🎬 Livestream Payment System - VNPay Integration

Payment system using VNPay Sandbox for livestream platforms (similar to NimoTV).

## 📋 Features

- ✅ Deposit money via VNPay (Sandbox)
- ✅ Withdrawal requests (manual admin approval)
- ✅ Transaction history
- ✅ Real-time balance updates
- ✅ Secure checksum verification

## 🛠️ Technologies

- Node.js + Express
- MySQL (MariaDB)
- VNPay Sandbox API
- RESTful API architecture

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install express cors body-parser mysql2 dotenv qs
```

### 2. Configure Database

Create the database and tables:

```bash
mysql -u root -p < database.sql
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=livestream_payment
DB_PORT=3306

# VNPay Sandbox
VNP_TMN_CODE=YOUR_SANDBOX_TMN_CODE
VNP_HASH_SECRET=YOUR_SANDBOX_SECRET_KEY
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/api/payment/return

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 4. Get VNPay Sandbox Credentials

1. Visit https://sandbox.vnpayment.vn/
2. Register an account
3. Get your TMN Code and Hash Secret
4. Update `.env` file with these credentials

### 5. Run the Server

```bash
node server.js
```

Server will start on `http://localhost:3000`

## 📡 API Endpoints

### Deposit (Nạp tiền)

#### Create Payment URL
```http
POST /api/payment/create
Content-Type: application/json

{
  "userId": 1,
  "amount": 50000
}
```

Response:
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "orderId": "DEPOSIT_1_1234567890"
}
```

#### Handle Return Callback
```http
GET /api/payment/return
```

Automatically handles VNPay callback and updates user balance.

---

### Withdrawal (Rút tiền)

#### Request Withdrawal
```http
POST /api/withdraw/request
Content-Type: application/json

{
  "userId": 1,
  "amount": 100000,
  "method": "Bank Transfer",
  "accountInfo": "Bank Name - 1234567890"
}
```

Response:
```json
{
  "success": true,
  "requestId": 1,
  "message": "Withdrawal request created successfully"
}
```

#### Get Withdrawal List (Admin)
```http
GET /api/withdraw/list?status=pending
```

Response:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "amount": 100000,
    "method": "Bank Transfer",
    "account_info": "Bank Name - 1234567890",
    "status": "pending",
    "created_at": "2024-01-01 10:00:00"
  }
]
```

#### Complete Withdrawal (Admin)
```http
POST /api/withdraw/complete/1
Content-Type: application/json

{
  "status": "completed"
}
```

---

### Transaction History

#### Get User Transactions
```http
GET /api/transactions/:userId
```

Response:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "type": "deposit",
    "amount": 50000,
    "status": "success",
    "txn_id": "DEPOSIT_1_1234567890",
    "created_at": "2024-01-01 10:00:00"
  }
]
```

#### Get User Balance
```http
GET /api/users/:userId/balance
```

Response:
```json
{
  "balance": 150000
}
```

---

## 🔄 Payment Flow

### Deposit Flow

1. User clicks "Nạp tiền" button
2. Frontend calls `POST /api/payment/create`
3. Server creates payment URL and returns it
4. User redirects to VNPay payment page
5. User completes payment
6. VNPay redirects back to `/api/payment/return`
7. Server verifies checksum
8. Server updates user balance
9. User redirects to success page

### Withdrawal Flow

1. User submits withdrawal request
2. Frontend calls `POST /api/withdraw/request`
3. Server deducts balance and creates request
4. Request status: `pending`
5. Admin reviews request in dashboard
6. Admin calls `POST /api/withdraw/complete/:id`
7. Request status: `completed`

---

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  balance DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('deposit', 'withdraw') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  txn_id VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Withdraw Requests Table
```sql
CREATE TABLE withdraw_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  account_info VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  admin_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔒 Security Features

- ✅ VNPay checksum verification
- ✅ CSRF protection
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ Balance verification before withdrawal

---

## 🧪 Testing

### Test Deposit Flow

1. Start the server:
```bash
node server.js
```

2. Create a payment:
```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 50000}'
```

3. Copy the `paymentUrl``
4. Open in browser
5. Use test credentials (provided by VNPay Sandbox)

### Test Withdrawal

1. Create withdrawal request:
```bash
curl -X POST http://localhost:3000/api/withdraw/request \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "amount": 100000,
    "method": "Bank Transfer",
    "accountInfo": "Vietcombank - 1234567890"
  }'
```

2. View withdrawal list:
```bash
curl http://localhost:3000/api/withdraw/list
```

---

## 📞 Support

For VNPay integration issues:
- Documentation: https://sandbox.vnpayment.vn/
- Support: support@vnpayment.vn

---

## 📄 License

MIT License


