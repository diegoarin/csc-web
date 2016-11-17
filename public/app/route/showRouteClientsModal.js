angular.module('seqariApp').controller('showRouteClientsModalCtrl', ['$scope', '$rootScope', 'commonServices', 'route', '$modalInstance', '$route', 'utilServices',
  function ($scope, $rootScope, commonServices, route, $modalInstance, $route, utilServices) {

    $scope.route = route;

    //OBTENGO TODOS LOS 'routeClient' DEL RECORRIDO
    var allRouteClientsData = commonServices.getAction('index_by_route/' + $scope.route.id);
    allRouteClientsData.then(
      function (result) {
        $scope.allRouteClients = result.data;
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        utilServices.errorModal('Error', error);
      }
    );

    $scope.close=function(){
      $modalInstance.dismiss('cancel');
    };

  }
]);
