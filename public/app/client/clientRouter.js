/**
 * Created by seba on 11/07/15.
 */
angular.module('seqariApp').config(['$routeProvider', function ($routeProvider) {

    $routeProvider = $routeProvider.when('/client',
        {
            templateUrl: 'app/client/client.html',
            controller: 'clientCtrl',
            title: 'Clientes'
        }
    );

}]);