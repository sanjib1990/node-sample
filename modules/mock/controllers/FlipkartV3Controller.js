import Controller from "./Controller";

/**
 * Class FlipkartV3Controller
 */
export default class FlipkartV3Controller extends Controller
{
    /**
     * This is just an example method, when the mock server
     * is made to actual use, we may remove this method.
     *
     * @param req
     * @param res
     *
     * @return response
     */
    static getShipment(req, res)
    {
        let content = super.getContentOf("/flipkartv3/getShipment.js");

        content.shipmentId = req.params.shipment_id;

        return res.json(content);
    }

    /**
     * Flipkart mock token.
     *
     * @param req
     * @param res
     */
    static token(req, res)
    {
        return res.json({
            access_token: "adsdadaddd",
            expires_in: 900,
            type: "Bearer"
        });
    }

    /**
     * Get invoice details for a shipment.
     *
     * @param req
     * @param res
     */
    static getInvoice(req, res)
    {
        let content = super.getContentOf("/flipkartv3/getInvoice.js");

        content.invoices.shipmentId = req.params.shipment_id;

        return res.json(content);
    }

    /**
     * Get Shipment details.
     *
     * @param req
     * @param res
     */
    static getShipmentDetails(req, res)
    {
        return res.json(super.getShipmentContent(req));
    }

    /**
     * Get Shipment info based on query params.
     *
     * @param req
     * @return {string}
     */
    static getShipmentContent(req)
    {
        let content = "";
        if (req.query.shipmentIds) {
            content = super.getContentOf("/flipkartv3/getShipmentDetails.js");
            content.shipmentId = req.query.shipmentIds;

            return content;
        }

        if (req.query.orderItemIds) {
            content = super.getContentOf("/flipkartv3/getShipmentDetails.js");
            content.orderItems[0].orderItemId = req.query.orderItemIds;

            return content;
        }

        throw Error("No Parameter provided.");
    }

    /**
     * Get shipments by filter.
     *
     * @param req
     * @param res
     * @return {*}
     */
    static getFilterShipment(req, res)
    {
        return res.json(super.getContentOf("/flipkartv3/getShipmentFilter.js"));
    }
}
