angular.module('seqariApp').controller('businessReportCtrl', ['$scope', '$rootScope', 'commonServices', '$location', 'utilServices',
  function ($scope, $rootScope, commonServices, $location, utilServices) {

    $scope.data = {};
    $scope.showResults = false;

    //DATEPICKER
    $scope.openFrom = function($event) {
      $scope.openedFrom = true;
    };
    $scope.openTo = function($event) {
      $scope.openedTo = true;
    };

    $scope.searchReports = function(){
      $scope.report_client_order_quantity();
      $scope.report_deliver_avg();
      $scope.report_dispatchers_deliver_avg();
      $scope.report_orders_delivered();
      $scope.report_routes_finished();
      $scope.report_not_delivered_clients_quantity_by_date();
      $scope.showResults = true;
    };

    $scope.report_client_order_quantity = function(){
      commonServices.postAction('/report_client_order_quantity', $scope.data).then(
        function (result) {
          $scope.orderQuantity = result.data;
          $scope.orderQuantityLabels = [];
          $scope.orderQuantityInfo = [];
          $scope.auxOrderQuantity = [];
          for(var i = 0; i < $scope.orderQuantity.length; i++){
            $scope.orderQuantityLabels.push($scope.orderQuantity[i].left);
            $scope.auxOrderQuantity.push($scope.orderQuantity[i].count);
          }
          $scope.orderQuantityInfo.push($scope.auxOrderQuantity);
        },
        function (error) {
          console.log(error);
        }
      );
    };

    $scope.report_deliver_avg = function(){
      commonServices.postAction('/report_deliver_avg', $scope.data).then(
        function (result) {
          $scope.deliverAvg = result.data;
          $scope.deliverAvgLabels = [];
          $scope.deliverAvgInfo = [];
          $scope.auxDeliverAvg = [];
          for(var i = 0; i < $scope.deliverAvg.length; i++){
            $scope.deliverAvgLabels.push($scope.deliverAvg[i].left);
            $scope.auxDeliverAvg.push($scope.deliverAvg[i].interval_in_hours);
          }
          $scope.deliverAvgInfo.push($scope.auxDeliverAvg);
        },
        function (error) {
          console.log(error);
        }
      );
    };

    $scope.report_dispatchers_deliver_avg = function(){
      commonServices.postAction('/report_dispatchers_deliver_avg', $scope.data).then(
        function (result) {
          $scope.dispatcherDeliverAvg = result.data;
          $scope.dispatcherDeliverAvgLabels = [];
          $scope.dispatcherDeliverAvgInfo = [];
          $scope.auxDispatcherDeliverAvg = [];
          for(var i = 0; i < $scope.dispatcherDeliverAvg.length; i++){
            $scope.dispatcherDeliverAvgLabels.push($scope.dispatcherDeliverAvg[i].name);
            $scope.auxDispatcherDeliverAvg.push($scope.dispatcherDeliverAvg[i].interval_in_hours);
          }
          $scope.dispatcherDeliverAvgInfo.push($scope.auxDispatcherDeliverAvg);
        },
        function (error) {
          console.log(error);
        }
      );
    };

    $scope.report_not_delivered_clients_quantity_by_date = function(){
      commonServices.postAction('/report_not_delivered_clients_quantity_by_date', $scope.data).then(
        function (result) {
          $scope.ordersNotDelivered = result.data;
          $scope.ordersNotDeliveredLabels = [];
          $scope.ordersNotDeliveredInfo = [];
          $scope.auxOrdersNotDelivered = [];
          for(var i = 0; i < $scope.ordersNotDelivered.length; i++){
            if(i < 10){
              $scope.ordersNotDeliveredLabels.push($scope.ordersNotDelivered[i].fecha);
              $scope.auxOrdersNotDelivered.push($scope.ordersNotDelivered[i].cantidad);
            }else{
              $scope.auxOrdersMaxResults = true;
              break;
            }
          }
          $scope.ordersNotDeliveredInfo.push($scope.auxOrdersNotDelivered);
        },
        function (error) {
          console.log(error);
        }
      );
    };

    $scope.report_orders_delivered = function(){
      commonServices.postAction('/report_orders_delivered', $scope.data).then(
        function (result) {
          $scope.ordersDelivered = result.data;
        },
        function (error) {
          console.log(error);
        }
      );
    };

    $scope.report_routes_finished = function(){
      commonServices.postAction('/report_routes_finished', $scope.data).then(
        function (result) {
          $scope.routesFinished = result.data;
          for (var i = 0; i < $scope.routesFinished.length; i++) {
            var retorno = $rootScope.milisecToDaysHoursMinSec($scope.routesFinished[i].duration);
            if (retorno.d != 0) {
              $scope.routesFinished[i].strDuration = retorno.d + "d, " + retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
            }else {
              $scope.routesFinished[i].strDuration = retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
            }
          }
        },
        function (error) {
          console.log(error);
        }
      );
    };

  }
]);
