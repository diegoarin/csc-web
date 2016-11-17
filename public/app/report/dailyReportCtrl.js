angular.module('seqariApp').controller('dailyReportCtrl', ['$scope', '$rootScope', 'commonServices', '$location', 'utilServices',
  function ($scope, $rootScope, commonServices, $location, utilServices) {

    $scope.colors = {
      blue: '#ABC8D7',
      yellow: '#FDB45C',
      green: '#A7C17A',
      red: '#F86B6E'
    }

    commonServices.getAction('/report_daily_routes').then(
      function (result) {
        $scope.routesData = result.data;
        $scope.routesLabels = ["Pendientes", "En tránsito", "Finalizados"];
        $scope.routesInfo = [$scope.routesData.pending, $scope.routesData.in_transit, $scope.routesData.finalized];
        $scope.routesColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green]
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_orders').then(
      function (result) {
        $scope.ordersData = result.data;
        //Junto los estados entregados
        $scope.ordersData.delivered += $scope.ordersData.delivered_without_validation;
        $scope.ordersLabels = ["Pendientes", "En tránsito", "Entregados", "No entregados"];
        $scope.ordersInfo = [$scope.ordersData.pending, $scope.ordersData.in_transit, $scope.ordersData.delivered, $scope.ordersData.not_delivered];
        $scope.ordersColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red]
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_rutes_delay').then(
      function (result) {
        $scope.routesDelay = result.data;
        for(var j = 0; j < result.data.length; j++){
          if(result.data[j].route_delay == null){
            $scope.routesDelay.splice(j, 1);
          }
        }
        $scope.routesDelayLabels = [];
        $scope.routesDelayInfo = [];
        $scope.auxRoutesDelay = [];
        for(var i = 0; i < $scope.routesDelay.length; i++){
          $scope.routesDelayLabels.push('Recorrido ' + $scope.routesDelay[i].route_id);
          $scope.auxRoutesDelay.push($scope.routesDelay[i].route_delay);
          var retorno = $rootScope.milisecToDaysHoursMinSec($scope.routesDelay[i].route_delay*60000)
          if (retorno.d != 0) {
            $scope.routesDelay[i].route_delay_date = retorno.d + "d, " + retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
          }else {
            $scope.routesDelay[i].route_delay_date = retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
          }
        }
        $scope.routesDelayInfo.push($scope.auxRoutesDelay);
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_top_10_dispatchers').then(
      function (result) {
        $scope.topDispatchers = result.data;
        $scope.topDispatchersLabels = [];
        $scope.topDispatchersInfo = [];
        $scope.auxInfo = [];
        for(var i = 0; i < $scope.topDispatchers.length; i++){
          $scope.topDispatchersLabels.push($scope.topDispatchers[i].dispatcher_name);
          $scope.auxInfo.push($scope.topDispatchers[i].routes_count);
        }
        $scope.topDispatchersInfo.push($scope.auxInfo);
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_top_10_clients').then(
      function (result) {
        $scope.topClients = result.data;
        $scope.topClientsLabels = [];
        $scope.topClientsInfo = [];
        $scope.auxClients = [];
        for(var i = 0; i < $scope.topClients.length; i++){
          $scope.topClientsLabels.push($scope.topClients[i].client_business);
          $scope.auxClients.push($scope.topClients[i].order_count);
        }
        $scope.topClientsInfo.push($scope.auxClients);
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_top_10_clients_delay').then(
      function (result) {
        $scope.topClientsDelay = result.data;
        $scope.topClientsDelayLabels = [];
        $scope.topClientsDelayInfo = [];
        $scope.auxClientsDelay = [];
        for(var i = 0; i < $scope.topClientsDelay.length; i++){
          $scope.topClientsDelayLabels.push($scope.topClientsDelay[i].client_business);
          $scope.auxClientsDelay.push($scope.topClientsDelay[i].avg_proximity_elapsed);
        }
        $scope.topClientsDelayInfo.push($scope.auxClientsDelay);
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_top_hour_delivered').then(
      function (result) {
        $scope.hoursDelivered = result.data;
        $scope.hoursDeliveredLabels = [];
        $scope.hoursDeliveredInfo = [];
        $scope.auxHoursDelivered = [];
        for(var i = 0; i < $scope.hoursDelivered.length; i++){
          $scope.hoursDeliveredLabels.push($scope.hoursDelivered[i].hour + 'hs');
          $scope.auxHoursDelivered.push($scope.hoursDelivered[i].hour_count);
        }
        $scope.hoursDeliveredInfo.push($scope.auxHoursDelivered);
      },
      function (error) {
        console.log(error);
      }
    );

  }
]);
