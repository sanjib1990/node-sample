import {express} from "./app";
import TestController from "./controllers/TestController";

// default load of group routing.
require('express-group-routes');

let router = new express.Router();

/**
 * Routing.
 *
 * Set all the routers here.
 */
router.group("/test", router => {
    router.group("/mock", router => {
        router.get('/test', TestController.test);
    });
});

module.exports = {
    router: router
};

