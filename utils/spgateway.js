const crypto = require('crypto');
const qs = require('qs');

// ✅ 金流商店資料
const merchantID = 'MS155503722';
const hashKey = 'u012eS6UNNEn3cO29EltQJGiOnhnoknN';
const hashIV = 'COCX41JaaPHVJWAP';

// ✅ 建立交易資料物件並加密
function createData(order) {
  const data = {
    MerchantID: merchantID,
    RespondType: 'JSON',
    TimeStamp: Math.floor(Date.now() / 1000),
    Version: '2.0',
    LangType: 'zh-tw',
    MerchantOrderNo: order.orderNo,
    Amt: order.amount,
    ItemDesc_1: order.description,
    ItemCount_1: 1,
    ItemUnit_1: '件',
    ItemPrice_1: order.amount,
    ReturnURL: 'https://n7-backend.onrender.com/api/v1/orders/payment_return',
    NotifyURL: 'https://n7-backend.onrender.com/api/v1/orders/payment_notify',
    Email: order.email,
    LoginType: 0,
    WEBATM: 1 // ✅ 只開啟 WebATM 付款
  };

  const tradeInfo = encryptTradeInfo(data);
  const tradeSha = sha256(tradeInfo);

  return {
    MerchantID: merchantID,
    TradeInfo: tradeInfo,
    TradeSha: tradeSha,
    Version: '2.0',
    action: 'http://ccore.newebpay.com/MPG/mpg_gateway', // ✅ 用於前端表單提交
  };
}

// ✅ 將參數加密（AES-256-CBC）
function encryptTradeInfo(data) {
  const encrypt = crypto.createCipheriv('aes-256-cbc', hashKey, hashIV);
  let encrypted = encrypt.update(qs.stringify(data), 'utf8', 'hex');
  encrypted += encrypt.final('hex');
  return encrypted;
}

// ✅ 建立 SHA256 校驗碼
function sha256(tradeInfo) {
  const plainText = `HashKey=${hashKey}&${tradeInfo}&HashIV=${hashIV}`;
  return crypto.createHash('sha256').update(plainText).digest('hex').toUpperCase();
}

module.exports = { createData };
