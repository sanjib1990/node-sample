import Controller from "./Controller";

/**
 * Class TestController
 */
export default class TestController extends Controller
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
    static test(req, res) {
        return res.json(TestController.getContentOf("/test.js"));
    }
}
