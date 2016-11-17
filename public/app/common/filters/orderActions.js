angular.module("seqariApp").filter('orderActions', ['filterMapResolvers', function (fmr) {

  var titleMap = {
    "1": "Ingresado",
    "2": "Listado",
    "3": "Relistado",
    "4": "Modificado",
    "5": "Pasado a UN",
    "6": "Detenido por UN",
    "7": "Liberado por UN",
    "8": "Detenido por VENTAS",
    "9": "Aprobado por VENTAS",
    "10": "Anula OK de VENTAS",
    "11": "",
    "12": "Detenido por CRÉDITOS",
    "13": "Liberado por CRÉDITOS",
    "14": "Aprobado por CRÉDITOS",
    "15": "Anula OK de CRÉDITOS",
    "16": "Rechazado por CRÉDITOS",
    "17": "Enviado a WIS",
    "18": "No enviado a WIS",
    "19": "Recibido de WIS",
    "20": "Tandeado",
    "21": "Facturado",
    "22": "Expedido",
    "23": "Excluido de WIS",
    "24": "Cumplido",
    "25": "Anulado",
    "26": "Activa anulación (vta)",
    "27": "Fix",
    "28": "Generado por N/C",
    "29": "Anulado, Excede IVA",
    "30": "Generada por Prefact.",
    "31": "Eliminada",
    "32": "Anulado, Excede U.C.",
    "33": "Anulada Autom. (SIS)",
    "34": "N/C automática WIS",
    "35": "Ingreso precios N/C",
    "36": "Aprobación precios N/C",
    "41": "CP-SI-DOLAR a valor 1",
    "42": "CP-SI-EXPORT a valor 1",
    "43": "CP-SI-IVA a valor 1",
    "44": "CP-SI-IMESI a valor 1",
    "45": "CP-SI-SERVIC a valor 1",
    "46": "CP-SI-REMITO a valor 1",
    "51": "CP-SI-DOLAR a valor 0",
    "52": "CP-SI-EXPORT a valor 0",
    "53": "CP-SI-IVA a valor 0",
    "54": "CP-SI-IMESI a valor 0",
    "55": "CP-SI-SERVIC a valor 0",
    "56": "CP-SI-REMITO a valor 0",
    "60": "Carga referencias N/C"
  };

  return function (input) {
      return fmr.filter(titleMap, input);
  };

}]);
