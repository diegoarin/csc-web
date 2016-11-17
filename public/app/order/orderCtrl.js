angular.module('seqariApp').controller('orderCtrl', ['$scope', '$rootScope', 'commonServices', '$modal', '$location', 'ngTableParams', 'utilServices',
  function ($scope, $rootScope, commonServices, $modal, $location, ngTableParams, utilServices) {

    $scope.filteredOrders = [];

    $scope.showOrderSummary = function(order){
      $rootScope.$broadcast("showLoadingModal");
      $modal.open({
        templateUrl: '/app/order/showOrderSummaryModal.html',
        controller: 'showOrderSummaryCtrl',
        size: 800,
        resolve:{
          order: function(){
            return order;
          }
        }
      });
    };

    //DATEPICKER
    $scope.openFrom = function($event) {
      $scope.openedFrom = true;
    };
    $scope.openTo = function($event) {
      $scope.openedTo = true;
    };

    $scope.ListOrders = function(){
      $rootScope.$broadcast("showLoadingModal");
      var args = [];
      var indice = 0;
      if($scope.ff_cr !== undefined && $scope.ff_cr !== ''){
        args[indice] = "cr=" + $scope.ff_cr;
        indice++;
      }
      if($scope.ff_status !== undefined && $scope.ff_status !== ''){
        args[indice] = "status=" + $scope.ff_status;
        indice++;
      }
      if($scope.ff_dtFrom !== undefined && $scope.ff_dtFrom !== null){
        args[indice] = "created_from=" + $scope.ff_dtFrom;
        indice++;
      }
      if($scope.ff_dtTo !== undefined && $scope.ff_dtTo !== null){
        args[indice] = "created_to=" + $scope.ff_dtTo;
        indice++;
      }
      var llamada = "index_filtered_order?";
      for(var i=0;i<indice;i++){
        if(i > 0){
          args[i] = '&' + args[i];
        }
        llamada = llamada + args[i];
      }
      var filteredOrderData = commonServices.getAction(llamada);
      filteredOrderData.then(
        function (result) {
          $scope.filteredOrders = result.data;
          if($scope.filteredOrders.length == 0){
            $scope.showResults = false;
          }else{
            $scope.showResults = true;
          }
          $rootScope.$broadcast("hideLoadingModal");
        },
        function (error) {
          utilServices.errorModal('Error', error);
        }
      );
    };

  }
]);

angular.module('seqariApp').controller('showOrderSummaryCtrl', ['$scope', '$rootScope', 'commonServices', '$modalInstance', 'utilServices', 'order',
function ($scope, $rootScope, commonServices, $modalInstance, utilServices,order) {

  $scope.order = order;

  var allOrderSummaryData = commonServices.getAction('index_by_order/' + $scope.order.id);
  allOrderSummaryData.then(
    function (result) {
      $scope.allOrderSummary = result.data;
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
