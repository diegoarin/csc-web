angular.module("seqariApp").service('commonServices', ['$rootScope', '$q', '$http', function ($rootScope, $q, $http) {

    /** POST ACTION **/
    this.postAction = function (action, data) {
      var deferred = $q.defer();
      if(data === undefined || data === null){
          data = {};
      }
      $http.post(action, data).
        success(function(data, status, headers, config) {
          deferred.resolve(data, status, headers, config);
        }).
        error(function(data, status, headers, config) {
          deferred.reject(data, status, headers, config);
        });
      return deferred.promise;
    };

    /** GET ACTION **/
    this.getAction = function (action) {
      var deferred = $q.defer();
      $http.get(action).
        success(function (data, status, headers, config) {
          deferred.resolve(data, status, headers, config);
        }).
        error(function (data, status, headers, config) {
          deferred.reject(data, status, headers, config);
        });
      return deferred.promise;
    };

    /** DELETE ACTION **/
    this.deleteAction = function (action) {
      var deferred = $q.defer();
      $http.delete(action).
        success(function (data, status, headers, config) {
          deferred.resolve(data, status, headers, config);
        }).
        error(function (data, status, headers, config) {
          deferred.reject(data, status, headers, config);
        });
      return deferred.promise;
    };

    /** PUT ACTION **/
    this.putAction = function (action, data) {
      var deferred = $q.defer();
      if(data === undefined || data === null){
          data = {};
      }
      $http.put(action, data).
        success(function(data, status, headers, config) {
          deferred.resolve(data, status, headers, config);
        }).
        error(function(data, status, headers, config) {
          deferred.reject(data, status, headers, config);
        });
      return deferred.promise;
    };

    /** PATCH ACTION **/
    this.patchAction = function (action, data) {
      var deferred = $q.defer();
      if(data === undefined || data === null){
          data = {};
      }
      $http.patch(action, data).
        success(function(data, status, headers, config) {
          deferred.resolve(data, status, headers, config);
        }).
        error(function(data, status, headers, config) {
          deferred.reject(data, status, headers, config);
        });
      return deferred.promise;
    };
}]);
