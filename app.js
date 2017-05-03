var TyponautApp = angular.module('TyponautApp', ['ngMaterial', 'btford.socket-io']);

        TyponautApp.factory('socket', ['$rootScope', function ($rootScope) {
            var socket = io.connect();

            return {
                on: function (eventName, callback) {
                    socket.on(eventName, callback);
                },
                emit: function (eventName, data) {
                    socket.emit(eventName, data);
                }
            };
        }]);

        TyponautApp.controller('TyponautController', function ($scope, $http, socket) {
            $scope.showWelcomeView = true;
            $scope.showGameView = false;
            $scope.players = [];

            $scope.name = 'kristo';

            socket.on('new_word', function (msg) {
                $scope.word = msg;
                $scope.$apply();
            });

            socket.on('status', function (msg) {
                $scope.status = msg;
                $scope.$apply();
            });

            function compare(a, b) {
                if (a.points < b.points)
                    return 1;
                if (a.points > b.points)
                    return -1;
                return 0;
            }

            socket.on('leaderboard', function (msg) {
                console.log(msg);
                var arr = msg;
                $scope.players = arr.sort(compare);
                $scope.$apply();
            });

            $scope.sendWord = function () {
                socket.emit('send_input', $scope.input);
                $scope.input = '';
            }

            $scope.submitName = function () {
                $scope.showWelcomeView = false;
                $scope.showGameView = true;
                socket.emit('test', 'testword');
            }

            $scope.showLeaderboard = function () {
                if ($scope.players != null && $scope.players.length > 0) {
                    console.log('do show board');
                    return true;
                } else {
                    console.log('do not show board');
                    return false;
                }
            }

        });