const http = require('http');
const httpProxy = require('http-proxy');
const parseurl = require('parseurl');

const routes = require('./routes').routes;

// create and start http server
const server = http.createServer(function (req, res) {
    const foundRoute = findRoute(req, routes);

    if (!foundRoute) {
        return returnError(req, res);
    }

    req.url = url.replace(foundRoute.apiRoute, '');
    proxy.web(req, res, { target: foundRoute.upstreamUrl });
});
server.listen(3000);


function findRoute(req, routes) {
    const routesKeys = Object.keys(routes);

    const url = req.url;
    const parsedUrl = parseurl(req);

    for (let key of routesKeys) {
        const routeUrl = routes[key].apiRoute;

        if (parsedUrl.indexOf(routeUrl) === 0) {
            return routes[key];
        }
    }
}
const proxy = httpProxy.createProxyServer();

function returnError(req, res) {
    res.writeHead(502, {'Content-Type': 'text/plain'});
    res.write('Bad Gateway for: ' + req.url);
    res.end();
}