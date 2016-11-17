angular.module('seqariApp').controller('validateOrderCtrl', ['$scope', '$rootScope', '$routeParams', 'commonServices', '$location', 'utilServices',
  function ($scope, $rootScope, $routeParams, commonServices, $location, utilServices) {

    $rootScope.$broadcast("showLoadingModal");
    $scope.qrCode = $routeParams.qrCode;
    $location.path('/validateOrder', false);
    var validateOrdersData = commonServices.getAction('/orders/index_to_validate_by_client_qr/' + $scope.qrCode);
    validateOrdersData.then(
      function (result) {
        $scope.allOrderToValidate = result.data;
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        utilServices.errorModal('Error', error);
      }
    );

    $scope.validateOrders = function(){
      $rootScope.$broadcast("showLoadingModal");
      var validatedOrders = {
        orders: []
      };
      for (var i = 0; i < $scope.allOrderToValidate.orders.length; i++) {
        if($scope.allOrderToValidate.orders[i].validate){
          validatedOrders.orders.push($scope.allOrderToValidate.orders[i].cr);
        }
      }
      if(validatedOrders.orders.length != 0){
        commonServices.postAction("/orders/validates", validatedOrders).then(
          function(){
            utilServices.successModal('Validar pedidos', '¡Los pedidos han sido validados correctamente!');
            $location.path('/validateOrder/' + $scope.qrCode, true);
          },
          function(error){
            utilServices.errorModal('Error', error);
          }
        );
      }else{
        var error = {
          message: "Debes validar al menos un pedido"
        }
        utilServices.errorModal('Error',error);
      }
    };

  }
]);
