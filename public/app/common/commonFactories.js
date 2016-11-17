angular.module("seqariApp").factory('filterMapResolvers', [function () {

  return{
    filter: function (map, code, def) {
      var value = map[code];
      if (value === undefined || value === null) {
        if(def === undefined || def === null){
          return code;
        }
        else{
          return def;
        }
      }
      return value;
    }
  };

}]);
