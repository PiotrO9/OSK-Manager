import { forwardManagerAccount } from '~~/server/utils/manager/accountsBff';

export default defineEventHandler((event) =>
    forwardManagerAccount(event, '/manager/accounts', 'GET'),
);
