const config = require('../config/index')
const logger = require('../utils/logger')('TicketsService')
const appError = require('../utils/appError')
const { dataSource } = require('../db/data-source')
const { TICKET_STATUS  } = require('../enums/index')
const ERROR_STATUS_CODE = 400;


const verifyTicket = async (ticketInfo, orgEventId, orgUserId) => {
    return dataSource.transaction(async (manager) => {
        const ticketRepository = manager.getRepository('Ticket')

        const{ event_id: ticketEventId, user_id: ticketUserId, ticket_id: ticketId } = ticketInfo

        if(ticketEventId !== orgEventId){
            throw appError(ERROR_STATUS_CODE, `欲驗證之活動與票券活動不符`)
        }

        const ticketWithUserEvent = await ticketRepository
            .createQueryBuilder("ticket")
            .innerJoin("ticket.Order", "order")
            .innerJoin("order.User", "user")
            .innerJoin("ticket.Seat", "seat")  //AI建議由ticket → seat → section → event，再次驗證座位之event正確
            .innerJoin("seat.Section", "section")
            .innerJoin("section.Event", "event")
            .where("ticket.id = :ticketId", { ticketId })
            .andWhere("user.id = :userId", { userId: ticketUserId })
            .andWhere("event.id = :eventId", { eventId: ticketEventId })
            .select([
                "user.name AS user_name",
                "user.email AS user_email",

                "event.id AS event_id",
                "event.title AS event_title",
                "event.location AS event_location",
                "event.start_at AS event_start_at",
                "event.end_at AS event_end_at",
                "event.user_id AS org_user_id",

                "ticket.serialNo AS ticket_no",
                "ticket.status AS ticket_status"
            ])
            .getRawOne();


        if (!ticketWithUserEvent) {
            throw appError(ERROR_STATUS_CODE, `票券不存在`)
        }

        if( ticketWithUserEvent.org_user_id !==  orgUserId){
            throw appError(403, `使用者權限不足，非屬該活動之舉辦者`)
        }

        if(ticketWithUserEvent.ticket_status === TICKET_STATUS.USED){
            throw appError(ERROR_STATUS_CODE, `票券已使用`)
        }

        const now = new Date();
        const start = new Date( ticketWithUserEvent.event_start_at );
        const end = new Date( ticketWithUserEvent.event_end_at );
        const dayBeforeStart = new Date(start.getTime() - 24 * 60 * 60 * 1000); 
        if(now < dayBeforeStart){
            throw appError(ERROR_STATUS_CODE, `活動開始前1天，票券才開放驗證`)
        }
        if(end < now) {
            throw appError(ERROR_STATUS_CODE, `票券活動已結束`)
        }

        //更新票券狀態為used
        const updatedEventResult = await ticketRepository.update(
              { id: ticketId },
              { status: TICKET_STATUS.USED }
            );
        if (updatedEventResult.affected === 0) {
            throw appError(ERROR_STATUS_CODE, '驗證發生錯誤！請再次掃描')
        }

        const formatTicket = {
            ticket_no: ticketWithUserEvent.ticket_no,
            event: {
                title: ticketWithUserEvent.event_title,
                location: ticketWithUserEvent.event_location,
                start_at: ticketWithUserEvent.event_start_at,
                end_at: ticketWithUserEvent.event_end_at
            },
            user: {
                name: ticketWithUserEvent.user_name,
                email: ticketWithUserEvent.user_email
            }
        };
        return formatTicket;
    });
}

module.exports = {
    verifyTicket
}