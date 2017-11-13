import {app} from "./app";
import {router} from "./routes";

app.use(router);

// port
let PORT    = process.env.PORT || 8080;

// server setup.
let server  = app.listen(PORT, () => {
    let port    = server.address().port;

    console.log("Server running at : http://localhost:%s", port);
});