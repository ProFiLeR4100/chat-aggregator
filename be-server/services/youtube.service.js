module.exports = (config) => {
    // let Youtube = require('youtube-api');
    let request = require('request');
    let service = {
        messageBuffer: [],
        latestMessageTimestamp: 0
    };
    let deferred = require('deferred');


    service.getLiveVideoID = (channelId) => {
        let def = deferred();
        let result;
        let outgoingRequest = request.get('https://www.youtube.com/embed/live_stream?channel=' + channelId);
        outgoingRequest.setHeader('user-agent', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36');
        outgoingRequest
            .on('error', (err) => {
                console.error('Failed to get live video ID', err.message);
                def.reject(err);
                service.error = true;
            })
            .on('data', (chunk) => {
                result += chunk.toString();
            })
            .on('end', () => {
                if(typeof result === 'string') {
                    result = result.match(/\'VIDEO_ID\': \"(.*?)\"/);
                    if(result[1]) {
                        def.resolve(result[1]);
                    } else {
                        def.reject(false);
                    }
                } else {
                    def.reject(result);
                }
            });

        return def.promise;
    };

    service.getMessages = function (videoId) {
        let ping = new Date().getTime();
        let def = deferred();
        let result;
        let outgoingRequest = request.get("https://www.youtube.com/live_chat?v=" + videoId);
        outgoingRequest.setHeader('accept-encoding', 'gzip;q=0,deflate,sdch');
        outgoingRequest.setHeader('user-agent', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36');
        outgoingRequest
            .on('error', (err) => {
                console.error('Failed to get messages', err.message);
                def.reject(err);
                service.error = true;
            })
            .on('data', (chunk) => {
                result += chunk.toString();
            })
            .on('end', () => {
                let text = result.match(/window\[\"ytInitialData\"\] = ([^\n]+)/);
                if (!Array.isArray(text)) {
                    def.reject();
                    return;
                }
                text = text[1].substring(0, text[1].length - 1);
                let json = JSON.parse(text);
                if(!json.contents.liveChatRenderer.actions) {
                    def.reject();
                    return;
                }
                let maxTimestamp = 0;
                let messages = json.contents.liveChatRenderer.actions.map((action) => {
                    if(!action || !action.addChatItemAction || !action.addChatItemAction.item || !action.addChatItemAction.item.liveChatTextMessageRenderer)
                        return;

                    let originalTimestamp = Math.floor(action.addChatItemAction.item.liveChatTextMessageRenderer.timestampUsec / 1000);
                    let timestamp = Math.floor(originalTimestamp / 1000);
                    maxTimestamp = Math.max(maxTimestamp, originalTimestamp);
                    // console.log(originalTimestamp, service.latestMessageTimestamp, originalTimestamp<maxTimestamp);
                    return {
                        name: action.addChatItemAction.item.liveChatTextMessageRenderer.authorName.simpleText,
                        picture: 'https://www.youtube.com/favicon.ico',
                        text: action.addChatItemAction.item.liveChatTextMessageRenderer.message.runs.reduce(function (prev, curr) {
                            return prev + (prev?"\n":"") + curr.text;
                        },""),
                        timestamp: timestamp,
                        originalTimestamp: originalTimestamp
                    };
                });
                def.resolve({
                    messages:messages,
                    maxTimestamp:maxTimestamp
                });
            });


        return def.promise;
    };

    service.init = () => {
        service.getLiveVideoID(config.channelId)
            .then(function (videoId) {
                service.videoId = videoId;
            });
        // service.auth = Youtube.authenticate({
        //     type: "oauth",
        //     client_id: config.clientId,
        //     client_secret: config.secret
        // });
    };

    service.intervalCallback = () => {
        let startMSec = (new Date().getTime());
        if (!service.videoId) {
            console.warn("Youtube service is not connected");
            return;
        }
        service.getMessages(service.videoId)
            .then((result) => {
                if(result.maxTimestamp - service.latestMessageTimestamp == 0) {
                    return;
                }

                // console.log("Youtube: new message");

                for (let i = 0; i < result.messages.length; i++) {
                    let message = result.messages[i];

                    if(!message || !message.originalTimestamp)
                        continue;

                    if (message.originalTimestamp - service.latestMessageTimestamp > 0) {
                        service.messageBuffer.push(message);
                    }
                }

                service.latestMessageTimestamp = Math.max(result.maxTimestamp, service.latestMessageTimestamp);
            })
    };

    setInterval(service.intervalCallback, 2000);

    service.getLatestMessages = () => {
        if(!service.videoId) {
            console.warn("Youtube service is not connected");
            return [];
        }

        let result = service.messageBuffer.slice();
        service.messageBuffer = [];
        return result;
    };

    return service;
};