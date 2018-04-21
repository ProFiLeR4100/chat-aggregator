module.exports = (config)=>{
    let fs = require('fs');

    let files = fs.readdir('./services', (res)=>{
        console.log(res);
    });
    console.log(files);
    // Load Services
    let TwitchService = require('./services/twitch.service');
    let YoutubeService = require('./services/youtube.service');

    // Services Configuration
    let services = [
        TwitchService(config.twitch.ThisIsShown),
        YoutubeService(config.youtube.WarpBeacon),
        YoutubeService(config.youtube.ShcherbynaM),
        YoutubeService(config.youtube.ThisIsShown)
    ];

    let socketServer = require('socket.io')();
    let openSockets = {};
    socketServer.on('connection', function(socket) {

        openSockets[socket.id] = socket;
        if (config.debug) {
            console.log("   CONNECT\t", socket.id, "=>", Object.keys(openSockets));
        }


        socket.on('disconnect', function() {
            // clearInterval(addMessagesInterval);
            delete openSockets[socket.id];
            if (config.debug) {
                console.log("DISCONNECT\t", socket.id, "<=", Object.keys(openSockets));
            }
        });
    });

    let addMessagesInterval = setInterval(function () {
        let socketIds = Object.keys(openSockets);
        let messages = getLatestMessages();
        socketIds.forEach((socketId)=>{
            openSockets[socketId].emit('addMessages', messages);
        });
    }, 500);

    services.forEach(function (service) {
        service.init();
    });

    function getLatestMessages() {
        let result = [];

        services.forEach(function (service) {
            result = result.concat(service.getLatestMessages());
        });

        return result;
    }

    socketServer.listen(config.socketPort);

    return socketServer;
};