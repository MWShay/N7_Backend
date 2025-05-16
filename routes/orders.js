const express = require('express')
const config = require('../config/index')
const logger = require('../utils/logger')('Tickets')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const handleErrorAsync = require('../utils/handleErrorAsync')
const ordersController = require('../controllers/orders')
const { USER_ROLE } = require('../enums/index')

const authRole = require('../middlewares/authRole')({
  allowedRoles: [USER_ROLE.GENERAL,USER_ROLE.ORGANIZER,USER_ROLE.ADMIN],
  logger
})

const isAuth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})

// 
router.post('/postTestData', isAuth, authRole, handleErrorAsync(ordersController.postTestOrder))

// 16.使用者取得訂單(票券)列表
router.get('/',isAuth, authRole, handleErrorAsync(ordersController.getOrders));

// 17.使用者取得單一訂單(票券)詳情
router.get('/:orderId',isAuth, authRole, handleErrorAsync(ordersController.getOneOrder));


module.exports = router