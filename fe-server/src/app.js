var app = angular.module("LiveChatClient", ["ngSanitize", "luegg.directives"]);

app
    .constant('config', {
        API_KEY:''
    })
    .factory("RestService",["$http", "$log", function ($http, $log) {
        var factory = {};
        var url = "/rpc/IRRemoteControl";

        factory.sendIRButton = function (button) {
            var startTime = new Date().getTime();
            return $http({
                method: "POST",
                url: url,
                data: button
            }).then(function (response) {
                logResponse(url, button, response, startTime);
                return response;
            });
        };

        function logResponse(url, data, response, startTime) {
            try {
                var format = "[%1$s]: ";
                if (data) {
                    format += "data:%2$o, ";
                }
                format += "response:%3$o, time: %4$dms";
                $log.log(format, url, data, response.data, (new Date().getTime() - startTime));
            } catch (ignore) {}
        }

        return factory;
    }])
    .controller("MainController",['$scope', '$http', '$q', '$element','$interval', function ($scope, $http, $q, $element, $interval) {
        var $ctrl = this;
        $ctrl.messages = [];

        var socket = io('http://localhost:3010');

        socket.on('addMessages', function(data){
            $ctrl.messages = $ctrl.messages.concat(data);
        });

        $scope.$on('$destroy', function() {
            socket.disconnect();
        });

        // socket.on('connect', function () {
        //     socket.emit('getMessages', {});
        // });
        // socket.on('disconnect', function(){});

        $interval(function () {
            angular.element('*[emojime]', $element).Emoji({
                path:  'images/emoji/',
                class: 'emoji',
                ext:   'png'
            });
        },800);
    }]);

