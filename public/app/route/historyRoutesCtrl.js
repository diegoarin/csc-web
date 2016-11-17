angular.module('seqariApp').controller('historyRoutesCtrl', ['$scope', '$rootScope', 'commonServices', '$modal', '$location', 'ngTableParams',
  function ($scope, $rootScope, commonServices, $modal, $location, ngTableParams) {

    $rootScope.$broadcast("showLoadingModal");

    //OBTENGO TODOS LOS RECORRIDOS FINALIZADOS
    var allFinalizedRoutesData = commonServices.getAction('history_routes');
    allFinalizedRoutesData.then(
      function (result) {
        $scope.finalizedRoutes = result.data;
        for (var i = 0; i < result.data.length; i++) {
          var retorno = $rootScope.milisecToDaysHoursMinSec(result.data[i].duration);
          if (retorno.d != 0) {
            result.data[i].strDuration = retorno.d + "d, " + retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
          }else {
            result.data[i].strDuration = retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
          }
        }
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

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

    $scope.viewHistoryRoute = function(route_id){
      $location.url('/historyRoute/' + route_id);
    };

    //PAGINACION DE TODOS LOS RECORRIDOS
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
    }, {
        getData: function ($defer, params) {
            var orderedData = $scope.finalizedRoutes;
            params.total(orderedData.length);
            $defer.resolve($scope.blocks = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });

  }
]);
