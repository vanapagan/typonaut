'use strict';

var TyponautApp = angular.module('TyponautApp', ['ngMaterial', 'btford.socket-io']);

app.factory('socket', ['$rootScope', function ($rootScope) {
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
    $scope.word = 'testword';

    $scope.newCustomers = [];
    $scope.currentCustomer = {};

    $scope.join = function () {
        socket.emit('add-customer', $scope.currentCustomer);
    };

    socket.on('notification', function (data) {
        $scope.$apply(function () {
            $scope.newCustomers.push(data.customer);
        });
    });

});