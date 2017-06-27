/**
 * Created by sanjibdevnath on 27/6/17.
 */

import chai from "chai";
import chaiHttp from "chai-http";

let except  = chai.expect;
let should  = chaiHttp.should;

chai.use(chaiHttp);

describe("Users Test", function () {
    it("should do basic testing", function () {
        except(1+1).equal(2);
    });
});