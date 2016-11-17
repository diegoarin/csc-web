angular.module('seqariApp').controller('routesCtrl', ['$scope', '$rootScope', 'commonServices', '$modal', '$location', 'ngTableParams',
  function ($scope, $rootScope, commonServices, $modal, $location, ngTableParams) {

    $rootScope.$broadcast("showLoadingModal");

    //OBTENGO TODOS LOS RECORRIDOS
    var allRoutesData = commonServices.getAction('current_routes');
    allRoutesData.then(
      function (result) {
        $scope.allRoutes = result.data;
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    //PAGINACION DE TODOS LOS RECORRIDOS
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
    }, {
        getData: function ($defer, params) {
            var orderedData = $scope.allRoutes;
            params.total(orderedData.length);
            $defer.resolve($scope.blocks = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });

    //CLIENTES DE UN RECORRIDO
    $scope.showRouteClients = function(route){
      $rootScope.$broadcast("showLoadingModal");
      $modal.open({
        templateUrl: '/app/route/showRouteClientsModal.html',
        controller: 'showRouteClientsModalCtrl',
        resolve:{
          route: function(){
            return route;
          }
        }
      });
    };

    $scope.viewRoute = function(route_id){
      $location.url('/route/' + route_id);
    };

  }
]);
