angular.module('seqariApp').controller('userCtrl', ['$scope', 'userServices', function ($scope, userServices) {

    $scope.webUser = {};
    $scope.dispatcherUser = {};

    $scope.webUsers = [];
    $scope.dispatcherUsers = [];

    /******************* WEB USER ********************/
    $scope.createWebUser = function(){
        var jsonBody = {};
        jsonBody = $scope.webUser;
        commonServices.postAction('createWebUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.updateWebUser = function(){
        var jsonBody = {};
        jsonBody = $scope.webUser;
        commonServices.postAction('updateWebUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.deleteWebUser = function(){
        var jsonBody = {};
        jsonBody = $scope.webUser;
        commonServices.postAction('deleteWebUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.listWebUsers = function(){
        userServices.getAction('listWebUsers').then(
            function(success){
                $scope.webUsers = success.data;
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    /**************** DISPATCHER USER ****************/

    $scope.createDispatcherUser = function(){
        var jsonBody = {};
        jsonBody = $scope.dispatcherUser;
        commonServices.postAction('createDispatcherUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.updateDispatcherUser = function(){
        var jsonBody = {};
        jsonBody = $scope.dispatcherUser;
        commonServices.postAction('updateDispatcherUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.deleteDispatcherUser = function(){
        var jsonBody = {};
        jsonBody = $scope.dispatcherUser;
        commonServices.postAction('deleteDispatcherUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.listDispatcherUsers = function(){
        userServices.getAction('listDispatcherUsers').then(
            function(success){
                $scope.dispatcherUsers = success.data;
            },
            function (error) {
                alert(error.error);
            }
        );
    };

}]);
