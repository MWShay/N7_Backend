const config = require('../config/index')
const logger = require('../utils/logger')('Admin')
const appError = require('../utils/appError')

const { dataSource } = require('../db/data-source')
const bcrypt = require('bcrypt')
const isAuth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
  })

const { getOrdersData,getSingleOrderData } = require('../services/orderService')
const { proposeEventValid,isUndefined,isNotValidString,isNotValidUuid } = require('../utils/validUtils');

const ERROR_STATUS_CODE = 400;

const adminController = {
    //取得所有一般會員資料 no.26
    async getAllUsers(req, res) {

        const userRepository = dataSource.getRepository('User')
        const users= await userRepository
            .createQueryBuilder('u')
            .leftJoin('Orders', 'o', 'u.id = o.user_id') // 假設 Orders 表中有 user_id 外鍵
            .select([
                'u.serialNo AS serialNo',
                'u.name AS name',
                'u.role AS role',
                'COUNT(o.id) AS count' // 計算每個使用者的購買數量
            ])
            .where('u.role = :role', { role: 'GENERAL' }) // 過濾角色為 GENERAL 的使用者
            .groupBy('u.id') // 按使用者分組
            .getRawMany(); // 獲取原始結果
            
        // const users = await userRepository.find({
        //     select: ['serialNo', 
        //         'name', 
        //         'role', 
        //         'count'],
        //     where: { role: 'GENERAL' }
        // });

        res.status(200).json({
            status: 'success',
            message: '取得成功',
            data: {
                users
            }
        });
    },
    //取得所有活動列表 no.29
    async getAllEvents(req, res) {

        const eventRepository = dataSource.getRepository('Event')
        const events = await eventRepository.find({
            select: ['id', 
                'title', 
                'cover_image_url', 
                'location', 
                'start_at',
                'status'], // 要添加 sale_status, sale_rate
        });

        res.status(200).json({
            status: true,
            message: '取得活動列表成功',
            data: {
                events
            }
        });
    },
    //取得單一活動資訊 no.27
    async getSingleEvent(req, res) {
        const { eventId } = req.params
        if (isUndefined(eventId) || isNotValidString(eventId) || isNotValidUuid(eventId)) {
            next(appError(ERROR_STATUS_CODE, '欄位未填寫正確'))
            return
        }
        const eventRepository = dataSource.getRepository('Event')
        const event = await eventRepository.findOne({
            select: ['id', 'title', 'cover_image_url', 'section_image_url', 'created_at', 'updated_at', 'status'],
            where: { id: eventId }
        })

        res.status(200).json({
            status: true,
            message: "取得活動成功",
            data: event
        })
    },
    //新增活動審核 no.28
    async patchEvent(req, res) {
        const { eventId } = req.params
        const { status } = req.body
        if (isUndefined(eventId) || isNotValidString(eventId) || isNotValidUuid(eventId)) {
            next(appError(ERROR_STATUS_CODE, '欄位未填寫正確'))
            return
        }

        if (isUndefined(status) || isNotValidString(status)) {
            next(appError(ERROR_STATUS_CODE, '狀態欄位未填寫正確'));
            return;
        }

        const eventRepository = dataSource.getRepository('Event')
        const event = await eventRepository.findOne({
            select: ['id', 'title', 'cover_image_url', 'section_image_url', 'created_at', 'updated_at', 'status'],
            where: { id: eventId }
        })
        
        // 更新活動的 status
        const updateResult = await eventRepository.update(
            { id: eventId },
            { status }
        );

        if (updateResult.affected === 0) {
            logger.warn('更新活動狀態失敗');
            return next(appError(400, '更新活動狀態失敗'));
        }

        const updatedEvent = await eventRepository.findOne({
            select: ['id', 'title', 'status'],
            where: { id: eventId }
        });
    
        res.status(200).json({
            status: true,
            message: "活動狀態更新成功",
            data: updatedEvent
        });
    },

    //取得單一會員資料 no.30
    async getSingleUser(req, res, next) {
        const { userId } = req.params
        if (isUndefined(eventId) || isNotValidString(eventId) || isNotValidUuid(eventId)) {
            next(appError(ERROR_STATUS_CODE, '欄位未填寫正確'))
            return
        }
        const singleUser = dataSource.getRepository('User')
        const user = await singleUser.findOne({
            select: ['id', 'name', 'email', 'role', 'created_at'],
            where: { id: userId }
        })
        if (!user) {
            logger.warn('使用者不存在')
            return next(appError(400, '使用者不存在'))
        }
    
        res.status(200).json({
            status: true,
            message: "取得會員資料成功成功",
            data: order
        })
    },

    // 使用者審核 no.31
    async patchUser(req, res, next) {
        const { userId } = req.params
        const { role } = req.body
        if (isUndefined(userId) || isNotValidString(userId) || isNotValidUuid(userId)) {
            next(appError(ERROR_STATUS_CODE, '欄位未填寫正確'))
            return
        }

        const userRepository = dataSource.getRepository('User')
        const existingUser = await userRepository.findOne({
            select: ['id', 'name', 'email', 'role'],
            where: { id: userId }
        })

        if (!existingUser) {
            logger.warn('使用者不存在')
            return next(appError(400, '使用者不存在'))
        }

        const updatedUser = await userRepository.patch({
            id: userId,
            role: 'BLOCKED'
        }, {
            role
        })
        if (updatedUser.affected === 0) {
            logger.warn('更新使用者失敗')
            return next(appError(400, '更新使用者失敗'))
        }

    }
}
module.exports = adminController

//     async postAdminCourse(req, res, next) {
//         const {
//             user_id: userId, skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
//             max_participants: maxParticipants, meeting_url: meetingUrl
//           } = req.body

//           if (isUndefined(userId) || isNotValidString(userId) ||
//             isUndefined(skillId) || isNotValidString(skillId) ||
//             isUndefined(name) || isNotValidString(name) ||
//             isUndefined(description) || isNotValidString(description) ||
//             isUndefined(startAt) || isNotValidString(startAt) ||
//             isUndefined(endAt) || isNotValidString(endAt) ||
//             isUndefined(maxParticipants) || isNotValidInteger(maxParticipants) ||
//             isUndefined(meetingUrl) || isNotValidString(meetingUrl) || !meetingUrl.startsWith('https')) {
//             logger.warn('欄位未填寫正確')
//             return next(appError(400, '欄位未填寫正確'))
//           }

//           const userRepository = dataSource.getRepository('User')
//           const existingUser = await userRepository.findOne({
//             select: ['id', 'name', 'role'],
//             where: { id: userId }
//           })

//           if (!existingUser) {
//             logger.warn('使用者不存在')
//             return next(appError(400, '使用者不存在'))
//           } else if (existingUser.role !== 'COACH') {
//             logger.warn('使用者尚未成為教練')
//             return next(appError(400, '使用者尚未成為教練'))
//           }

//           const courseRepo = dataSource.getRepository('Course')
//           const newCourse = courseRepo.create({
//             user_id: userId,
//             skill_id: skillId,
//             name,
//             description,
//             start_at: startAt,
//             end_at: endAt,
//             max_participants: maxParticipants,
//             meeting_url: meetingUrl
//           })

//           const savedCourse = await courseRepo.save(newCourse)
//           const course = await courseRepo.findOne({
//             where: { id: savedCourse.id }
//           })
//           res.status(201).json({
//             status: 'success',
//             data: {
//               course
//             }
//           })
//     },
//     async putAdminCourse(req, res, next) {
//         const { courseId } = req.params
//         const {
//           skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
//           max_participants: maxParticipants, meeting_url: meetingUrl
//         } = req.body

//         if (isNotValidString(courseId) ||
//           isUndefined(skillId) || isNotValidString(skillId) ||
//           isUndefined(name) || isNotValidString(name) ||
//           isUndefined(description) || isNotValidString(description) ||
//           isUndefined(startAt) || isNotValidString(startAt) ||
//           isUndefined(endAt) || isNotValidString(endAt) ||
//           isUndefined(maxParticipants) || isNotValidInteger(maxParticipants) ||
//           isUndefined(meetingUrl) || isNotValidString(meetingUrl) || !meetingUrl.startsWith('https')) {
//           logger.warn('欄位未填寫正確')
//           return next(appError(400, '欄位未填寫正確'))
//         }

//         const courseRepo = dataSource.getRepository('Course')
//         const existingCourse = await courseRepo.findOne({
//           where: { id: courseId }
//         })

//         if (!existingCourse) {
//           logger.warn('課程不存在')
//           return next(appError(400, '課程不存在'))
//         }

//         const updateCourse = await courseRepo.update({
//           id: courseId
//         }, {
//           skill_id: skillId,
//           name,
//           description,
//           start_at: startAt,
//           end_at: endAt,
//           max_participants: maxParticipants,
//           meeting_url: meetingUrl
//         })
//         if (updateCourse.affected === 0) {
//           logger.warn('更新課程失敗')
//           return next(appError(400, '更新課程失敗'))
//         }
//         const savedCourse = await courseRepo.findOne({
//           where: { id: courseId }
//         })
//         res.status(200).json({
//           status: 'success',
//           data: {
//             course: savedCourse
//           }
//         })
//     },
//     async postAdminCoach(req, res, next) {
//         const { userId } = req.params
//         const { experience_years: experienceYears, description, profile_image_url: profileImageUrl = null } = req.body
//         if (isUndefined(experienceYears) || isNotValidInteger(experienceYears) || isUndefined(description) || isNotValidString(description)) {
//           logger.warn('欄位未填寫正確')
//           next(appError(400, '欄位未填寫正確'))
//           // res.status(400).json({
//           //   status: 'failed',
//           //   message: '欄位未填寫正確'
//           // })
//           return
//         }
//         if (profileImageUrl && !isNotValidString(profileImageUrl) && !profileImageUrl.startsWith('https')) {
//           logger.warn('大頭貼網址錯誤')
//           next(appError(400, '欄位未填寫正確'))
//           // res.status(400).json({
//           //   status: 'failed',
//           //   message: '欄位未填寫正確'
//           // })
//           return
//         }
//         const userRepository = dataSource.getRepository('User')
//         const existingUser = await userRepository.findOne({
//           select: ['id', 'name', 'role'],
//           where: { id: userId }
//         })
//         if (!existingUser) {
//           logger.warn('使用者不存在')
//           next(appError(400, '使用者不存在'))
//           // res.status(400).json({
//           //   status: 'failed',
//           //   message: '使用者不存在'
//           // })
//           return
//         } else if (existingUser.role === 'COACH') {
//           logger.warn('使用者已經是教練')
//           next(appError(409, '使用者已經是教練'))
//           // res.status(409).json({
//           //   status: 'failed',
//           //   message: '使用者已經是教練'
//           // })
//           return
//         }
//         const coachRepo = dataSource.getRepository('Coach')
//         const newCoach = coachRepo.create({
//           user_id: userId,
//           experience_years: experienceYears,
//           description,
//           profile_image_url: profileImageUrl
//         })
//         const updatedUser = await userRepository.update({
//           id: userId,
//           role: 'USER'
//         }, {
//           role: 'COACH'
//         })
//         if (updatedUser.affected === 0) {
//           logger.warn('更新使用者失敗')
//           next(appError(400, '更新使用者失敗'))
//           // res.status(400).json({
//           //   status: 'failed',
//           //   message: '更新使用者失敗'
//           // })
//           return
//         }
//         const savedCoach = await coachRepo.save(newCoach)
//         const savedUser = await userRepository.findOne({
//           select: ['name', 'role'],
//           where: { id: userId }
//         })
//         res.status(201).json({
//           status: 'success',
//           data: {
//             user: savedUser,
//             coach: savedCoach
//           }
//         })
//     }
// }

