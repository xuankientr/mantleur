const crypto = require('crypto');
const axios = require('axios');

// MoMo Payment Gateway Integration
class MoMoPayment {
  constructor() {
    this.partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO_PARTNER_CODE';
    this.accessKey = process.env.MOMO_ACCESS_KEY || 'MOMO_ACCESS_KEY';
    this.secretKey = process.env.MOMO_SECRET_KEY || 'MOMO_SECRET_KEY';
    this.endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
    this.returnUrl = process.env.MOMO_RETURN_URL || 'http://localhost:5173/payment/success';
    this.notifyUrl = process.env.MOMO_NOTIFY_URL || 'http://localhost:5000/api/payment/momo-webhook';
  }

  // Tạo payment request
  async createPayment(orderId, amount, orderInfo) {
    try {
      const requestId = Date.now().toString();
      const extraData = ''; // Extra data if needed

      // Tạo raw signature
      const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.returnUrl}&requestId=${requestId}&requestType=captureWallet`;

      // Tạo signature
      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(rawSignature)
        .digest('hex');

      // Request body
      const requestBody = {
        partnerCode: this.partnerCode,
        accessKey: this.accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: this.returnUrl,
        ipnUrl: this.notifyUrl,
        extraData: extraData,
        requestType: 'captureWallet',
        signature: signature,
        lang: 'vi'
      };

      // Gọi MoMo API
      const response = await axios.post(this.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('MoMo payment error:', error);
      throw error;
    }
  }

  // Verify payment result
  verifyPayment(orderId, amount, responseTime, resultCode, extraData, signature) {
    try {
      const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${resultCode}&orderId=${orderId}&partnerCode=${this.partnerCode}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${responseTime}`;

      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(rawSignature)
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      console.error('MoMo verification error:', error);
      return false;
    }
  }
}

// VNPay Payment Gateway Integration
class VNPayPayment {
  constructor() {
    this.vnp_TmnCode = process.env.VNPAY_TMN_CODE || 'VNPAY_TMN_CODE';
    this.vnp_HashSecret = process.env.VNPAY_HASH_SECRET || 'VNPAY_HASH_SECRET';
    this.vnp_Url = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.vnp_ReturnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:5173/payment/success';
  }

  // Tạo payment URL
  createPaymentUrl(orderId, amount, orderDescription) {
    const vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
    vnp_Params['vnp_Amount'] = amount * 100; // VNPay expects amount in cents
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderDescription;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_ReturnUrl'] = this.vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');

    // Sort parameters
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((result, key) => {
        result[key] = vnp_Params[key];
        return result;
      }, {});

    // Create query string
    const queryString = Object.keys(sortedParams)
      .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&');

    // Create signature
    const signData = queryString;
    const signature = crypto
      .createHmac('sha512', this.vnp_HashSecret)
      .update(signData)
      .digest('hex');

    return `${this.vnp_Url}?${queryString}&vnp_SecureHash=${signature}`;
  }

  // Verify payment result
  verifyPayment(vnp_Params) {
    try {
      const secureHash = vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      // Sort parameters
      const sortedParams = Object.keys(vnp_Params)
        .sort()
        .reduce((result, key) => {
          result[key] = vnp_Params[key];
          return result;
        }, {});

      // Create query string
      const queryString = Object.keys(sortedParams)
        .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
        .join('&');

      // Create signature
      const signData = queryString;
      const signature = crypto
        .createHmac('sha512', this.vnp_HashSecret)
        .update(signData)
        .digest('hex');

      return signature === secureHash;
    } catch (error) {
      console.error('VNPay verification error:', error);
      return false;
    }
  }
}

// ZaloPay Payment Gateway Integration
class ZaloPayPayment {
  constructor() {
    this.appId = process.env.ZALOPAY_APP_ID || 'ZALOPAY_APP_ID';
    this.key1 = process.env.ZALOPAY_KEY1 || 'ZALOPAY_KEY1';
    this.key2 = process.env.ZALOPAY_KEY2 || 'ZALOPAY_KEY2';
    this.endpoint = process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create';
    this.returnUrl = process.env.ZALOPAY_RETURN_URL || 'http://localhost:5173/payment/success';
  }

  // Tạo payment request
  async createPayment(orderId, amount, description) {
    try {
      const timestamp = Date.now();
      const order = {
        app_id: parseInt(this.appId),
        app_trans_id: orderId,
        app_user: 'MantleUR_User',
        amount: amount,
        description: description,
        item: JSON.stringify([{
          itemid: orderId,
          itemname: description,
          itemprice: amount,
          itemquantity: 1
        }]),
        embed_data: JSON.stringify({
          redirecturl: this.returnUrl
        }),
        bank_code: 'zalopayapp'
      };

      // Tạo signature
      const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.embed_data}|${order.item}`;
      order.mac = crypto
        .createHmac('sha256', this.key1)
        .update(data)
        .digest('hex');

      // Gọi ZaloPay API
      const response = await axios.post(this.endpoint, order, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('ZaloPay payment error:', error);
      throw error;
    }
  }

  // Verify payment result
  verifyPayment(data) {
    try {
      const mac = data.mac;
      delete data.mac;

      const dataStr = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('&');

      const expectedMac = crypto
        .createHmac('sha256', this.key2)
        .update(dataStr)
        .digest('hex');

      return mac === expectedMac;
    } catch (error) {
      console.error('ZaloPay verification error:', error);
      return false;
    }
  }
}

module.exports = {
  MoMoPayment,
  VNPayPayment,
  ZaloPayPayment
};
