import {
    accountUserId,
    forwardManagerAccount,
} from '~~/server/utils/manager/accountsBff';

export default defineEventHandler((event) =>
    forwardManagerAccount(
        event,
        `/manager/accounts/${accountUserId(event)}/password-reset`,
        'POST',
    ),
);
