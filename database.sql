-- Create database
CREATE DATABASE IF NOT EXISTS livestream_payment;
USE livestream_payment;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  balance DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('deposit', 'withdraw') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  txn_id VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Withdrawal requests table
CREATE TABLE IF NOT EXISTS withdraw_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  account_info VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  admin_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (username, email, balance) VALUES
  ('testuser1', 'test1@example.com', 100000),
  ('testuser2', 'test2@example.com', 50000);

-- Create indexes for better performance
CREATE INDEX idx_user_id ON transactions(user_id);
CREATE INDEX idx_status ON transactions(status);
CREATE INDEX idx_txn_id ON transactions(txn_id);
CREATE INDEX idx_withdraw_user_id ON withdraw_requests(user_id);
CREATE INDEX idx_withdraw_status ON withdraw_requests(status);


