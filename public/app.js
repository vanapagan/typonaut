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

TyponautApp.controller('TyponautController', function ($scope, $http, $window, socket) {
    $scope.showWelcomeView = true;
    $scope.showGameView = false;
    $scope.showInputForm = false;
    $scope.players = [];
    $scope.gameStarted = false;
    $scope.showRestart = false;

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

    socket.on('game', function (msg) {
        if (msg == 'started') {
            $scope.gameStarted = true;
        }
        if (msg == 'ended') {
            $scope.gameStarted = false;
            $scope.showRestart = true;
        }
        $scope.$apply();
    });

    $scope.sendWord = function () {
        socket.emit('send_input', $scope.input);
        $scope.input = '';
    }

    $scope.join = function () {
        $scope.showWelcomeView = false;
        $scope.showGameView = true;
        socket.emit('join', $scope.name);
    }

    $scope.showLeaderboard = function () {
        if ($scope.players != null && $scope.players.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    $scope.reloadPage = function () {
        $window.location.reload();
    };

});