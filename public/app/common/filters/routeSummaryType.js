angular.module("seqariApp").filter('routeSummaryType', ['filterMapResolvers', function (fmr) {

  var titleMap = {
    "START_ROUTE": "Se inicia el recorrido",
    "END_ROUTE": "Finaliza el recorrido",
    "UPDATE_CLIENT_STATUS": "Se actualiza el estado del cliente"
  };

  return function (input) {
      return fmr.filter(titleMap, input);
  };

}]);
