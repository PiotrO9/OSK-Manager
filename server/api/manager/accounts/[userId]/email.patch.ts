import {
    accountUserId,
    forwardManagerAccount,
} from '~~/server/utils/manager/accountsBff';

export default defineEventHandler(async (event) =>
    forwardManagerAccount(
        event,
        `/manager/accounts/${accountUserId(event)}/email`,
        'PATCH',
        await readBody(event),
    ),
);
