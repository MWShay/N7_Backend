const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ✅ 路由
const orderRoutes = require('./routes/orders');
app.use('/api/v1/orders', orderRoutes);

// ✅ 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`伺服器已啟動在 http://localhost:${port}`);
});
