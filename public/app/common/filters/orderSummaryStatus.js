angular.module("seqariApp").filter('orderSummaryStatus', ['filterMapResolvers', function (fmr) {

  var titleMap = {
    "1": "Ingresado",
    "10": "Pasa a UN",
    "14": "Detenido por UN",
    "15": "Detenido por VENTAS",
    "16": "No alcanza monto mínimo",
    "19": "Aprobado por VENTAS",
    "23": "Cliente sin código",
    "25": "Detenido por CRÉDITOS",
    "29": "Aprobado por CRÉDITOS",
    "49": "Enviado a WIS",
    "58": "Recibido de WIS (pre)",
    "59": "Recibido de WIS",
    "68": "Facturado fuera de WIS",
    "69": "Facturado",
    "79": "Expedido",
    "88": "Excluido de WIS",
    "89": "Cumplido",
    "99": "Anulado"
  };

  return function (input) {
      return fmr.filter(titleMap, input);
  };

}]);
