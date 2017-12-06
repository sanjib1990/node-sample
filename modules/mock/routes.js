import {express} from "./app";
import TestController from "./controllers/TestController";
import FlipkartV3Controller from "./controllers/FlipkartV3Controller";

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

// Flipkart mock apis.
router.get("/oauth-service/oauth/token", FlipkartV3Controller.token);
router.group("/sellers", router => {
    router.group("/v3", router => {
        router.get('/shipments', FlipkartV3Controller.getShipmentDetails);
        router.post('/shipments/filter', FlipkartV3Controller.getFilterShipment);
        router.get('/shipments/:shipment_id', FlipkartV3Controller.getShipment);
        router.get('/shipments/:shipment_id/invoices', FlipkartV3Controller.getInvoice);
    });
});

module.exports = {
    router: router
};

