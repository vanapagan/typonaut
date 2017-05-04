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
    $scope.gameEnded = false;
    $scope.showRestart = false;
    $scope.welcome = 'Welcome!';

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

    socket.on('welcome', function (msg) {
        $scope.welcome = msg;
        $scope.$apply();
    });

    socket.on('endgame', function (msg) {
        if (msg == '-1') {
            $scope.endgame = 'Could not figure out winner. Everyone left.';
        } else if (msg == 'draw') {
            $scope.endgame = "It's a draw!"
        } else {
            $scope.endgame = msg.name + ' won with ' + msg.points + ' points!';
        }
        $scope.$apply();
    });

    socket.on('game', function (msg) {
        if (msg == 'started') {
            $scope.gameStarted = true;
        }
        if (msg == 'ended') {
            $scope.showGameView = false;
            $scope.gameEnded = true;
        }
        $scope.$apply();
    });

    $scope.sendWord = function () {
        socket.emit('send_input', $scope.input);
        $scope.input = '';
    }

    $scope.join = function () {
        socket.emit('join', $scope.name);
    }

    socket.on('accepted', function (msg) {
        if (msg == 'yes') {
            $scope.showWelcomeView = false;
            $scope.showGameView = true;
        } else {
            $scope.welcome = 'Sorry the game has already started';
        }
        $scope.$apply();
    });

    $scope.showLeaderboard = function () {
        if ($scope.gameStarted && $scope.players != null && $scope.players.length > 0) {
            return true;
        } else {
            return false;
        }
    };
    
    $scope.showEndgame = function () {
        if ($scope.gameStarted && $scope.gameEnded) {
            return true;
        } else {
            return false;
        }
    };

    $scope.reloadPage = function () {
        $window.location.reload();
    };

});