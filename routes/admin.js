const express = require('express')


const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')
const  appError = require('../utils/appError')
const isAuth = require('../middleware/isAuth')
// const isCoach = require('../middleware/isCoach')
const {isUndefined, isNotValidString, isNotValidInteger} = require('../utils/validUtils')
const handleErrorAsync = require('../utils/handleErrorAsync')
const adminController = require('../controllers/admin')


// 26.取得所有一般會員資料
router.get('/admin/users', isAuth, handleErrorAsync(adminController.getAllUsers))

// 27.取得單一活動資訊
router.get('/admin/events/:eventId', isAuth, handleErrorAsync(adminController.getSingleEvent))

// 28.新增活動審核
router.patch('/admin/events/:eventId', isAuth, handleErrorAsync(adminController.patchEvent))

// 29.取得所有活動列表
router.get('/admin/events', isAuth, handleErrorAsync(adminController.getAllEvents))

// 30.查看單一會員詳細資訊
router.get('/admin/users/:userId', isAuth, handleErrorAsync(adminController.getSingleUser))

// 31.使用者審核
router.patch('/admin/users/:userId', isAuth, handleErrorAsync(adminController.patchUser))

module.exports = router
