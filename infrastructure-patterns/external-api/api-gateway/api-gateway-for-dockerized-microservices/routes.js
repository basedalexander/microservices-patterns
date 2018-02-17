const monitor = require('node-docker-monitor');

const routes = {};
module.exports.routes = routes;

monitor({
    onContainerUp: (containerInfo, docker) => {
        if (containerInfo.Labels && containerInfo.Labels.api_route) {
            getContainerRoute(containerInfo, docker);
        }
    },
    onContainerDown: (containerInfo) => {
        if (containerInfo.Labels && containerInfo.Labels.api_route) {
            removeContainerRoute(containerInfo);
        }
    }
});

function getContainerRoute(containerInfo, docker) {
    const container = docker.getContainer(containerInfo.Id);

    container.inspect((err, containerDetails) => {
        if (err) {
            console.log('Error getting container details ', containerInfo, err);
            return;
        }

        const route = {
            apiRoute: containerInfo.Labels.api_route,
            upstreamUrl: getUpstreamUrl(containerDetails)
        };

        routes[containerInfo.Id] = route;
        console.log('Registered new api route: %j', route);
    });
}

function removeContainerRoute(containerInfo) {
        const route = routes[containerInfo.Id];

        if (route) {
            delete routes[containerInfo.Id];
            console.log('Removed api route: %j', route);
        }
}

// generate upstream url from containerDetails
function getUpstreamUrl(containerDetails) {
    const ports = containerDetails.NetworkSettings.Ports;
    for (id in ports) {
        if (ports.hasOwnProperty(id)) {
            return 'http://' + containerDetails.NetworkSettings.IPAddress + ':' + id.split('/')[0];
        }
    }
}