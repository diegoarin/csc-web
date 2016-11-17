angular.module("seqariApp").filter('routeStatus', ['filterMapResolvers', function (fmr) {

  var titleMap = {
    "PENDING": "Pendiente",
    "IN_TRANSIT": "En tránsito",
    "FINISHED": "Finalizado"
  };

  return function (input) {
      return fmr.filter(titleMap, input);
  };

}]);
