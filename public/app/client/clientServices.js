/**
 * Created by seba on 11/07/15.
 */
angular.module("seqariApp").service('clientServices', ['$rootScope', '$q', '$http', function ($rootScope, $q, $http) {

    /** POST ACTION **/
    this.postAction = function (action, data) {

        var deferred = $q.defer();

        if(data === undefined || data === null){
            data = {};
        }

        $http.post('/client/' + action, data).
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

        $http.get('/client/' + action).
            success(function (data, status, headers, config) {
                deferred.resolve(data, status, headers, config);
            }).
            error(function (data, status, headers, config) {
                deferred.reject(data, status, headers, config);
            });

        return deferred.promise;
    };

}]);