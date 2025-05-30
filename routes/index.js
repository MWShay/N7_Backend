const express = require('express')
const config = require('../config/index')
const logger = require('../utils/logger')('index')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const handleErrorAsync = require('../utils/handleErrorAsync')
const indexController = require('../controllers/index')
const crypto = require('crypto');

// 取得所有活動類型
router.get('/event-types', handleErrorAsync(indexController.getEventTypes))

// // 金流

// const orders = {};

// const { MerchantID, HASHKEY, HASHIV, Version, Host } = process.env;
// const RespondType = 'JSON';

// // console.log(process.env)
// // console.log(MerchantID, HASHIV, HASHKEY, Version, Host)

// // 建立訂單
// router.get('/', function (req, res, next) {
//     res.render('index', { title: 'Express', Host });
// });

// router.post('/createOrder', (req, res) => {
//     const data = req.body;
//     console.log(data);
//     const TimeStamp = Math.round(new Date().getTime() / 1000);
//     console.log(TimeStamp);
//     orders[TimeStamp] = {
//         ...data,
//         TimeStamp,
//         MerchantOrderNo: TimeStamp,
//     };
//     console.log(orders[TimeStamp]);

//     return res.json(orders[TimeStamp]);
// });

// // 確認訂單
// router.get('/check', (req, res, next) => {
//     res.render('check', { title: 'Express', Host });
// });
// router.get('/order/:id', (req, res) => {
//     const { id } = req.params;
//     const order = orders[id];

//     // 用來產出字串
//     const paramString = genDataChain(order);
//     //console.log('paramString:', paramString);
//     console.log(paramString);
//     // 加密第一段字串，此段主要是提供交易內容給予藍新金流
//     const aesEncrypt = create_mpg_aes_encrypt(order);
//     console.log('aesEncrypt:', aesEncrypt);

//     // 使用 HASH 再次 SHA 加密字串，作為驗證使用
//     const shaEncrypt = create_mpg_sha_encrypt(aesEncrypt);
//     console.log('shaEncrypt:', shaEncrypt);

//     res.json({
//         order,
//         aesEncrypt,
//         shaEncrypt,
//     });
// });

// // 交易成功：Return （可直接解密，將資料呈現在畫面上）
// router.post('/spgateway_return', function (req, res, next) {
//     console.log('req.body return data', req.body);
//     res.render('success', { title: 'Express', Host });
// });

// // 確認交易：Notify
// // router.post('/spgateway_notify', function (req, res, next) {
// //   console.log('req.body notify data', req.body);
// //   const response = req.body;

// //   const thisShaEncrypt = create_mpg_sha_encrypt(response.TradeInfo);
// //   // 使用 HASH 再次 SHA 加密字串，確保比對一致（確保不正確的請求觸發交易成功）
// //   if (!thisShaEncrypt === response.TradeSha) {
// //     console.log('付款失敗：TradeSha 不一致');
// //     return res.end();
// //   }

// //   // 解密交易內容
// //   const data = create_mpg_aes_decrypt(response.TradeInfo);
// //   console.log('data:', data);

// //   // 取得交易內容，並查詢本地端資料庫是否有相符的訂單
// //   if (!orders[data?.Result?.MerchantOrderNo]) {
// //     console.log('找不到訂單');
// //     return res.end();
// //   }

// //   // 交易完成，將成功資訊儲存於資料庫
// //   console.log('付款完成，訂單：', orders[data?.Result?.MerchantOrderNo]);

// //   return res.end();
// // });

// module.exports = router;

// // 字串組合
// function genDataChain(order) {
//     return `MerchantID=${MerchantID}&RespondType=${RespondType}&TimeStamp=${order.TimeStamp
//         }&Version=${Version}&MerchantOrderNo=${order.MerchantOrderNo}&Amt=${order.Amt
//         }&ItemDesc=${encodeURIComponent(order.ItemDesc)}&Email=${encodeURIComponent(
//             order.Email,)}`;
// }

// // 交易資料
// // 對應文件 P16：使用 aes 加密
// // $edata1=bin2hex(openssl_encrypt($data1, "AES-256-CBC", $key, OPENSSL_RAW_DATA, $iv));
// function create_mpg_aes_encrypt(TradeInfo) {
//     const encrypt = crypto.createCipheriv('aes256', HASHKEY, HASHIV);
//     const enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex');
//     return enc + encrypt.final('hex');
// }

// // 驗證用
// // 對應文件 P17：使用 sha256 加密
// // $hashs="HashKey=".$key."&".$edata1."&HashIV=".$iv;
// function create_mpg_sha_encrypt(aesEncrypt) {
//     const sha = crypto.createHash('sha256');
//     const plainText = `HashKey=${HASHKEY}&${aesEncrypt}&HashIV=${HASHIV}`;

//     return sha.update(plainText).digest('hex').toUpperCase();
// }

// // 將 aes 解密
// function create_mpg_aes_decrypt(TradeInfo) {
//     const decrypt = crypto.createDecipheriv('aes256', HASHKEY, HASHIV);
//     decrypt.setAutoPadding(false);
//     const text = decrypt.update(TradeInfo, 'hex', 'utf8');
//     const plainText = text + decrypt.final('utf8');
//     const result = plainText.replace(/[\x00-\x20]+/g, '');
//     return JSON.parse(result);
// }


module.exports = router