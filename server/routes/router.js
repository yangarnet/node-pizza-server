
const handler = require('../handlers/index');
const helper = require('../../utils/helper');

const routeConfig = {
    customer: {
        register: handler.customer.register,
        login: handler.customer.login,
        logoff: handler.customer.logoff,
        update: handler.customer.update,
        cancel: handler.customer.cancel,
        listmenu: handler.customer.listmenu,
        shopping: {
            add: handler.customer.add,
            checkout: handler.customer.checkout
        }
    },
    notFound: handler.notFound
};

const router = (req, res) => {
    helper.isLoadingStaticResources(req.url.trim()) ? 
       helper.loadingStaticResouces(req, res) : 
       helper.loadRequestPayload(req, res, routeConfig);
};

module.exports = router;