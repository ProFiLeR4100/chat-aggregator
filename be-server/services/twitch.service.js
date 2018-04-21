module.exports = (config) => {
    let tmi = require('tmi.js');
    let service = {
        name:"Twitch",
        messageBuffer: []
    };
    let client;
    let options = {
        options: {
            debug: false
        },
        connection: {
            cluster: "aws",
            reconnect: true
        },
        identity: {
            username: config.username,
            password: config.oAuthToken
        },
        channels: [config.channel]
    };

    service.init = () => {
        client = new tmi.client(options);
        client.connect();
        client.on('chat', (channel, user, message, self) => {
            // console.log("Twitch: new message");
            if (!self) {
                service.messageBuffer.push({
                    name: user['display-name'],
                    picture: 'https://www.twitch.tv/favicon.ico',
                    text: message,
                    timestamp: Math.floor(new Date().getTime() / 1000),
                    originalTimestamp: new Date().getTime()
                });
            }
        });
    };

    service.checkForInitialization = () => {
        if (!client) {
            console.warn("Twitch service is not initialized");
        }
        return !!client;
    };

    service.getConnectionState = () => {
        return service.checkForInitialization() ? client.readyState() : "NOT_INITIALIZED";
    };

    service.isConnected = () => {
        return service.getConnectionState() === "OPEN";
    };

    service.getLatestMessages = () => {
        if(!service.isConnected()) {
            console.warn("Twitch service is not connected");
            return [];
        }

        let result = service.messageBuffer.slice();
        service.messageBuffer = [];
        return result;
    };
    
    return service;
};



// module.exports = service;