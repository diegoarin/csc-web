
angular.module('seqariApp').controller('clientController', ['$scope', 'commonServices', function ($scope, commonServices) {

    $scope.client = {};

    $scope.clients = [];

    /******************* WEB USER ********************/
    $scope.createClient = function(){
        var jsonBody = {};
        jsonBody = $scope.client;
        commonServices.postAction('createClient', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.updateClient = function(){
        var jsonBody = {};
        jsonBody = $scope.client;
        commonServices.postAction('updateClient', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.deleteClient = function(){
        var jsonBody = {};
        jsonBody = $scope.client;
        commonServices.postAction('deleteClient', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.listClients = function(){
        commonServices.getAction('listClients').then(
            function(success){
                $scope.clients = success.data;
            },
            function (error) {
                alert(error.error);
            }
        );
    };


}]);
