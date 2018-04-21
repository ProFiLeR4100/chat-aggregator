var ipc = require('electron').ipcRenderer;
// var authButton = document.getElementById('auth-button');
// authButton.addEventListener('click', function(){
//
//     ipc.send('invokeAction', 'someData');
// });



var app = angular.module("LiveChatGUI", []);

app
    .controller("MainController",['$scope', '$http', '$q', '$element','$interval', function ($scope, $http, $q, $element, $interval) {
        var $ctrl = this;
        $ctrl.currentPage = "start";
        var prevMenuItem;
        $ctrl.menu = [{
            title: "Link stream services",
            icon: "info",
            active: true,
            onClick: function (menuItem) {
                if(prevMenuItem) {
                    prevMenuItem.active = false;
                }
                $ctrl.currentPage = "start";
                menuItem.active = true;
                prevMenuItem = menuItem;
            }
        },{
            title: "Link stream services",
            icon: "link",
            onClick: function (menuItem) {
                if(prevMenuItem) {
                    prevMenuItem.active = false;
                }
                $ctrl.currentPage = "link";
                menuItem.active = true;
                prevMenuItem = menuItem;
            }
        },{
            title: "Start/Stop live chat",
            icon: "play",
            started: false,
            onClick: function (menuItem) {
                menuItem.icon = ipc.sendSync('server', menuItem.started ? 'stop': 'start')
                menuItem.started = !menuItem.started;
            }
        },{
            title: "Chat",
            icon: "eye",
            onClick: function (menuItem) {
                if(prevMenuItem) {
                    prevMenuItem.active = false;
                }
                $ctrl.currentPage = "chat";
                menuItem.active = true;
                prevMenuItem = menuItem;

                ipc.send('invokeAction', 'someData');
            }
        },/*{
            title: "Settings",
            icon: "cogs",
            onClick: function (menuItem) {
                if(prevMenuItem) {
                    prevMenuItem.active = false;
                }
                $ctrl.currentPage = "settings";
                menuItem.active = true;
                prevMenuItem = menuItem;

                ipc.send('invokeAction', 'someData');
            }
        },*/{
            title: "Exit",
            icon: "sign-out",
            onClick: function (menuItem) {
                window.close();
            }
        }];
        prevMenuItem = $ctrl.menu[0];
    }]);
// app
//     .factory("RestService",["$http", "$log", function ($http, $log) {
//         var factory = {};
//         var url = "/rpc/IRRemoteControl";
//
//         factory.sendIRButton = function (button) {
//             var startTime = new Date().getTime();
//             return $http({
//                 method: "POST",
//                 url: url,
//                 data: button
//             }).then(function (response) {
//                 logResponse(url, button, response, startTime);
//                 return response;
//             });
//         };
//
//         function logResponse(url, data, response, startTime) {
//             try {
//                 var format = "[%1$s]: ";
//                 if (data) {
//                     format += "data:%2$o, ";
//                 }
//                 format += "response:%3$o, time: %4$dms";
//                 $log.log(format, url, data, response.data, (new Date().getTime() - startTime));
//             } catch (ignore) {}
//         }
//
//         return factory;
//     }])
//     .controller("MainController",['$scope', '$http', '$q', '$element','$interval', function ($scope, $http, $q, $element, $interval) {
//         var $ctrl = this;
//         $ctrl.messages = [];
//
//         var socket = io('http://profiler4100v2.ddns.net:3010');
//
//         socket.on('addMessages', function(data){
//             $ctrl.messages = $ctrl.messages.concat(data);
//         });
//
//         // socket.on('connect', function () {
//         //     socket.emit('getMessages', {});
//         // });
//         // socket.on('disconnect', function(){});
//
//         $interval(function () {
//             angular.element('*[emojime]', $element).Emoji({
//                 path:  'images/emoji/',
//                 class: 'emoji',
//                 ext:   'png'
//             });
//         },800);
//     }]);
//
