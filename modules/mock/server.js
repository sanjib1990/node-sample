import {app} from "./app";
import {router} from "./routes";
import Logger from "./Utils/Logger";

let logger = new Logger();

// Middleware to be used by all view request
app.use((req, res, next) => {
    logger.log(req.method + ": " + req.url);
    logger.log("[QUERY]", JSON.stringify(req.query));
    logger.log("[BODY]", JSON.stringify(req.body));
    next();
});

app.use(router);

// port
let PORT    = process.env.PORT || 8080;

// server setup.
let server  = app.listen(PORT, () => {
    let port    = server.address().port;

    logger.log("Server running at : http://localhost:" + port);
});