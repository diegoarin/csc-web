angular.module("seqariApp").filter('orderStatus', ['filterMapResolvers', function (fmr) {

  var titleMap = {
    "PENDING": "Pendiente",
    "IN_TRANSIT": "En tránsito",
    "DELIVERED": "Entregado y verificado",
    "DELIVERED_WITHOUT_VALIDATION": "Entregado sin verificar",
    "NOT_DELIVERED": "No entregado"
  };

  return function (input) {
      return fmr.filter(titleMap, input);
  };

}]);
