angular.module('seqariApp', ['ngRoute', 'ui.bootstrap', 'ngTable', 'chart.js', 'ngSanitize', 'ngCsv']);

angular.module('seqariApp').config(['$routeProvider',
  function ($routeProvider) {

    $routeProvider = $routeProvider.when('/',
      {
        templateUrl: 'app/home/home.html',
        controller: 'homeCtrl'
      }
    );

    $routeProvider = $routeProvider.when('/login',
      {
        templateUrl: 'app/login/login.html',
        controller: 'loginCtrl',
        title: 'Login'
      }
    );

    $routeProvider = $routeProvider.when('/restart/:perishableToken',
      {
        templateUrl: 'app/login/restartPassword.html',
        controller: 'restartPasswordCtrl',
        title: 'Restart'
      }
    );

    $routeProvider = $routeProvider.when('/validateOrder/:qrCode',
      {
        templateUrl: 'app/validate/validateOrder.html',
        controller: 'validateOrderCtrl',
        title: 'Validate'
      }
    );

    $routeProvider = $routeProvider.when('/500',
      {
        templateUrl: '500.html',
        title: "500"
      }
    );

    $routeProvider = $routeProvider.otherwise(
      {
        templateUrl: '404.html',
        title: "404"
      }
    );

  }
]);

angular.module('seqariApp').run(['$rootScope', 'commonServices', '$location', '$routeParams', '$route',
  function ($rootScope, commonServices, $location, $routeParams, $route) {

    $rootScope.$broadcast("showLoadingModal");

    $rootScope.isLogged = false;

    //VERSION DEL PRODUCTO
    $rootScope.seqariVersion = 'CSC-6.2';

    //UBICACION CARRAU
    $rootScope.carrau = {
      lat: -34.873584,
      long: -56.151004,
      business: 'CARRAU & CÍA. S.A.',
      address: 'Avda. Dámaso Antonio Larrañaga 3444'
    }

    var userSessionData = commonServices.getAction('user_logged');
    userSessionData.then(
      function (result) {
        if(result.logged){
          $rootScope.isLogged = true;
          $rootScope.loggedUser = result.data;
          console.log("Usuario logueado!");
        }else{
          var initPath = $location.path().split('/');
          if(initPath[1] !== 'restart' && initPath[1] !== 'validateOrder'){
            $location.url('/login');
          }
        }
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    var original = $location.path;
    $location.path = function (path, reload) {
      if (reload === false) {
        var lastRoute = $route.current;
        var un = $rootScope.$on('$locationChangeSuccess', function () {
          $route.current = lastRoute;
          un();
        });
      }
      return original.apply($location, [path]);
    };

    $rootScope.milisecToDaysHoursMinSec = function(interval){
      var msecPerMinute = 1000 * 60;
      var msecPerHour = msecPerMinute * 60;
      var msecPerDay = msecPerHour * 24;

      days = Math.floor(interval / msecPerDay );
      interval = interval - (days * msecPerDay );

      // Calcular las horas , minutos y segundos
      hours = Math.floor(interval / msecPerHour );
      interval = interval - (hours * msecPerHour );

      minutes = Math.floor(interval / msecPerMinute );
      interval = interval - (minutes * msecPerMinute );

      seconds = Math.floor(interval / 1000 );
      var result = {
        d: days,
        h: hours,
        m: minutes,
        s: seconds
      };
      return result;
    };

  }
]);
;
angular.module('seqariApp').controller('clientCtrl', ['$scope', '$rootScope', 'commonServices',  '$modal',
  function ($scope, $rootScope, commonServices, $modal) {

    $rootScope.$broadcast("showLoadingModal");

    var allClientsData = commonServices.getAction('clients');
    allClientsData.then(
      function (result) {
        $scope.allClients = result.data;
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    $scope.createClientDataModal = function(){
      var modalInstance = $modal.open({
        templateUrl: '/app/client/adminClientDataModal.html',
        controller: 'createClientDataCtrl',
        size: '800',
        resolve:{
          client: function(){
            return {};
          },
          type: function(){
            return 'CREATE';
          }
        }
      });
    };

    $scope.modifyClientDataModal = function(client){
      $modal.open({
        templateUrl: '/app/client/adminClientDataModal.html',
        controller: 'modifyClientDataCtrl',
        size: '800',
        resolve:{
          client: function(){
            return client;
          },
          type: function(){
            return 'UPDATE';
          }
        }
      });
    };

  }
]);

angular.module('seqariApp').controller('createClientDataCtrl', ['$scope', '$rootScope', 'commonServices', 'client', 'type', '$modalInstance', '$route', '$timeout', 'utilServices',
  function ($scope, $rootScope, commonServices, client, type, $modalInstance, $route, $timeout, utilServices) {

    $scope.isMapLoaded = false;
    $scope.client = angular.copy(client);
    $scope.type = type;

    $scope.initialize = function() {

      var latlng = new google.maps.LatLng(-33.7852771,-55.7143609);
      var myOptions = {
        zoom: 7,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      $scope.isMapLoaded = true;
    };

    $scope.init = function(){
      $scope.initialize();
    };

    $scope.$watch("map", function(newValue, oldValue){
      if($scope.isMapLoaded){
        google.maps.event.addListener($scope.map, "click", function(event) {
          $scope.client.lat = event.latLng.lat();
          $scope.client.long = event.latLng.lng();
          if($scope.marker){
            $scope.marker.setMap(null);
          }
          $scope.marker = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          $scope.addMarker($scope.marker, $scope.map);
        });
      }
    });

    $scope.addMarker = function(location, map) {
      $scope.marker = new google.maps.Marker({
        position: location,
        map: map
      });
    };

    $timeout(function () {
      google.maps.event.trigger($scope.map, 'resize');
      $scope.map.setCenter(new google.maps.LatLng(-33.7852771,-55.7143609));
    },0);

    $scope.save = function(){
      $rootScope.$broadcast("showLoadingModal");
      $scope.client.active = true;
      commonServices.postAction('/clients/', $scope.client).then(
        function(){
          $route.reload();
          $modalInstance.dismiss('cancel');
          utilServices.successModal('Crear cliente', '¡El cliente ha sido creado correctamente!');
        },
        function(error){
          if (error.cr !== null) {
            error.message = 'ID del cliente incorrecto';
          }else {
            error.message = 'Datos ingresados inválidos';
          }
          utilServices.errorModal('Error', error);
        }
      );
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

  }
]);

angular.module('seqariApp').controller('modifyClientDataCtrl', ['$scope', '$rootScope', 'commonServices', 'client', 'type', '$modalInstance', '$route', '$timeout', 'utilServices',
  function ($scope, $rootScope, commonServices, client, type, $modalInstance, $route, $timeout, utilServices) {

    $scope.isMapLoaded = false;
    $scope.client = angular.copy(client);
    $scope.type = type;

    $scope.initialize = function() {
      var latlng = new google.maps.LatLng($scope.client.lat,$scope.client.long);
      var myOptions = {
        zoom: 15,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      $scope.marker = { lat: $scope.client.lat, lng: $scope.client.long };
      addMarker($scope.marker, $scope.map);
      $scope.isMapLoaded = true;
    };

    $scope.init = function(){
      $scope.initialize();
    };

    $scope.$watch("map", function(newValue, oldValue){
      if($scope.isMapLoaded){
        google.maps.event.addListener($scope.map, "click", function(event) {
          $scope.client.lat = event.latLng.lat();
          $scope.client.long = event.latLng.lng();
          if($scope.marker){
            $scope.marker.setMap(null);
          }
          $scope.marker = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          addMarker($scope.marker, $scope.map);
        });
      }
    });

    function addMarker(location, map) {
      $scope.marker = new google.maps.Marker({
        position: location,
        map: map
      });
    }

    $timeout(function () {
      google.maps.event.trigger($scope.map, 'resize');
      $scope.map.setCenter(new google.maps.LatLng($scope.client.lat,$scope.client.long));
    },0);

    $scope.save = function(){
      $rootScope.$broadcast("showLoadingModal");
      commonServices.patchAction('/clients/' + $scope.client.id, $scope.client).then(
        function(){
          $route.reload();
          $modalInstance.dismiss('cancel');
          utilServices.successModal('Modificar cliente', '¡El cliente ha sido modificado correctamente!');
        },
        function(error){
          utilServices.errorModal('Error', error);
        }
      );
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

  }
]);
;
/**
 * Created by seba on 11/07/15.
 */
angular.module('seqariApp').config(['$routeProvider', function ($routeProvider) {

    $routeProvider = $routeProvider.when('/client',
        {
            templateUrl: 'app/client/client.html',
            controller: 'clientCtrl',
            title: 'Clientes'
        }
    );

}]);;
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

}]);;

;
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
;
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
;
angular.module('seqariApp').controller('dispatcherCtrl', ['$scope', '$rootScope', 'commonServices', '$modal', '$location',
  function ($scope, $rootScope, commonServices, $modal, $location) {

    $rootScope.$broadcast("showLoadingModal");

    var allDispatchersData = commonServices.getAction('dispatchers');
    allDispatchersData.then(
      function (result) {
        $scope.allDispatchers = result.data;
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    $scope.modifyDispatcherDataModal = function(dispatcher){
  		$modal.open({
  			templateUrl: '/app/dispatcher/adminDispatcherDataModal.html',
  			controller: 'modifyDispatcherDataCtrl',
  			resolve:{
  				dispatcher: function(){
  					return dispatcher;
  				},
          type: function(){
            return 'UPDATE';
          }
  			}
  		});
    };

    $scope.createDispatcherDataModal = function(){
      $modal.open({
        templateUrl: '/app/dispatcher/adminDispatcherDataModal.html',
        controller: 'createDispatcherDataCtrl',
        resolve:{
          dispatcher: function(){
            return {};
          },
          type: function(){
            return 'CREATE';
          }
        }
      });
    };

  }
]);

angular.module('seqariApp').controller('createDispatcherDataCtrl', ['$scope', '$rootScope', 'commonServices', 'dispatcher', 'type', '$modalInstance', '$route', 'utilServices',
  function ($scope, $rootScope, commonServices, dispatcher, type, $modalInstance, $route, utilServices) {

    $scope.dispatcher = angular.copy(dispatcher);
    $scope.type = type;

    $scope.save = function(){
      $rootScope.$broadcast("showLoadingModal");
      $scope.dispatcher.active = true;
      commonServices.postAction("/dispatchers/", $scope.dispatcher).then(
        function(){
          $route.reload();
          $modalInstance.dismiss('cancel');
          utilServices.successModal('Crear transportista', '¡El transportista ha sido creado correctamente!');
        },
        function(error){
          utilServices.errorModal('Error', error);
        }
      );
    };

    $scope.close=function(){
      $modalInstance.dismiss('cancel');
    };

  }
]);

angular.module('seqariApp').controller('modifyDispatcherDataCtrl', ['$scope', '$rootScope', 'commonServices', 'dispatcher', 'type', '$modalInstance', '$route', 'utilServices',
  function ($scope, $rootScope, commonServices, dispatcher, type, $modalInstance, $route, utilServices) {

    $scope.dispatcher = angular.copy(dispatcher);
    $scope.type = type;

  	$scope.save = function(){
      $rootScope.$broadcast("showLoadingModal");
  		commonServices.patchAction("/dispatchers/" + $scope.dispatcher.id, $scope.dispatcher).then(
  			function(){
          $route.reload();
  				$modalInstance.dismiss('cancel');
          utilServices.successModal('Modificar transportista', '¡El transportista ha sido modificado correctamente!');
  			},
  			function(error){
  				utilServices.errorModal('Error', error);
  			}
	    );
  	};

  	$scope.close = function(){
  		$modalInstance.dismiss('cancel');
  	};

  }
]);
;
angular.module('seqariApp').controller('helpCtrl', ['$scope', '$rootScope', 'commonServices', '$location', 'utilServices',
  function ($scope, $rootScope, commonServices, $location, utilServices) {

  	$scope.goBack = function(){
  		$location.url('/');
  	}
  }
]);
;
angular.module('seqariApp').config(['$routeProvider',
  function ($routeProvider) {

    $routeProvider = $routeProvider.when('/help',
      {
        templateUrl: 'app/help/help.html',
        controller: 'helpCtrl',
        title: 'Ayuda'
      }
    );
  }
]);;
angular.module('seqariApp').controller('homeCtrl', ['$scope', '$rootScope', 'commonServices', '$location', 'utilServices',
function ($scope, $rootScope, commonServices, $location, utilServices) {

	$scope.logout = function(id){
		$rootScope.$broadcast("showLoadingModal");
		commonServices.deleteAction('/user_sessions/' + id).then(
			function(success){
				$rootScope.loggedUser = {};
				$rootScope.isLogged = false;
				$location.url('/login');
				$rootScope.$broadcast("hideLoadingModal");
			},
			function (error) {
				utilServices.errorModal('Error', error);
			}
		);
	};

	$rootScope.goHome = function(){
		$location.url('/');
	};

	$rootScope.goToLogin = function(){
		$location.url('/login');
	};

	$rootScope.adminWebUsers = function(){
		$location.url('/webUsers');
	};

	$rootScope.adminClients = function(){
		$location.url('/clients');
	};

	$rootScope.adminDispatchers = function(){
		$location.url('/dispatchers');
	};

	$rootScope.showOrders = function(){
		$location.url('/orders');
	};

	$rootScope.showRoutes = function(){
		$location.url('/routes');
	};

	$rootScope.showHistoryRoutes = function(){
		$location.url('/historyRoutes');
	};

	$rootScope.dailyReports = function(){
		$location.url('/dailyReports');
	};

	$rootScope.businessReports = function(){
		$location.url('/businessReports');
	};

}
]);
;
angular.module('seqariApp').config(['$routeProvider',
  function ($routeProvider) {

    $routeProvider = $routeProvider.when('/webUsers',
      {
        templateUrl: 'app/webUser/webUsers.html',
        controller: 'webUserCtrl',
        title: 'Gestionar usuarios web'
      }
    );

    $routeProvider = $routeProvider.when('/clients',
      {
        templateUrl: 'app/client/clients.html',
        controller: 'clientCtrl',
        title: 'Gestionar clientes'
      }
    );

    $routeProvider = $routeProvider.when('/dispatchers',
      {
        templateUrl: 'app/dispatcher/dispatchers.html',
        controller: 'dispatcherCtrl',
        title: 'Gestionar transportistas'
      }
    );

    $routeProvider = $routeProvider.when('/orders',
      {
        templateUrl: 'app/order/orders.html',
        controller: 'orderCtrl',
        title: 'Listado de pedidos'
      }
    );

    $routeProvider = $routeProvider.when('/routes',
      {
        templateUrl: 'app/route/routes.html',
        controller: 'routesCtrl',
        title: 'Listado de recorridos'
      }
    );

    $routeProvider = $routeProvider.when('/historyRoutes',
      {
        templateUrl: 'app/route/historyRoutes.html',
        controller: 'historyRoutesCtrl',
        title: 'Histórico de recorridos'
      }
    );

    $routeProvider = $routeProvider.when('/dailyReports',
      {
        templateUrl: 'app/report/dailyReports.html',
        controller: 'dailyReportCtrl',
        title: 'Reportes del día'
      }
    );

    $routeProvider = $routeProvider.when('/businessReports',
      {
        templateUrl: 'app/report/businessReports.html',
        controller: 'businessReportCtrl',
        title: 'Reportes de negocio'
      }
    );

  }
]);
;
angular.module('seqariApp').controller('loginCtrl', ['$scope', '$rootScope', 'commonServices', '$location', 'utilServices', '$modal',
  function ($scope, $rootScope, commonServices, $location, utilServices, $modal) {

    $scope.loginUser = {
      remember_me: false
    };

    if($rootScope.isLogged){
      $location.url('/');
    }

    $scope.showError = false;

    $scope.login = function(){
      $rootScope.$broadcast("showLoadingModal");
      var jsonBody = {};
      jsonBody = $scope.loginUser;
      commonServices.postAction('/user_sessions', jsonBody).then(
        function(success){
          if(success.data !== null){
            $rootScope.loggedUser = success.data;
            $rootScope.isLogged = true;
            $location.path( '/' );
          }else{
            $rootScope.loggedUser = {};
            $rootScope.isLogged = false;
            $scope.showError = true;
          }
          $rootScope.$broadcast("hideLoadingModal");
        },
        function (error) {
          if (error.password != null) {
            error.message = 'Contraseña inválida';
          }else if (error.login != null) {
            error.message = 'Usuario inválido';
          }else {
            error.message = 'Ingreso al sistema inválido';
          }
          utilServices.errorModal('Error', error);
        }
      );
    };

    $scope.restartPasswordModal = function(){
  		$modal.open({
  			templateUrl: '/app/login/restartPasswordModal.html',
  			controller: 'restartPasswordModalCtrl'
  		});
    };

  }
]);

angular.module('seqariApp').controller('restartPasswordModalCtrl', ['$scope', '$rootScope', 'commonServices', '$modalInstance', '$route', 'utilServices',
  function ($scope, $rootScope, commonServices, $modalInstance, $route, utilServices) {

    $scope.data = {
      email: ''
    }

  	$scope.save = function(){
      $rootScope.$broadcast("showLoadingModal");
  		commonServices.postAction("/password_resets", $scope.data).then(
  			function(){
  				$modalInstance.dismiss('cancel');
          utilServices.successModal('Resetear contraseña', '¡Las instrucciones para resetear su contraseña fueron enviadas a su email correctemente!');
  			},
  			function(error){
          error.message = error.data;
          error.message = error.message.replace("&oacute;",'ó');
  				utilServices.errorModal('Error', error);
  			}
	    );
  	};

  	$scope.close = function(){
  		$modalInstance.dismiss('cancel');
  	};

  }
]);
;
angular.module('seqariApp').controller('restartPasswordCtrl', ['$scope', '$rootScope', '$routeParams', 'commonServices', '$location', 'utilServices',
  function ($scope, $rootScope, $routeParams, commonServices, $location, utilServices) {

    $rootScope.restartPassword = true;
    if($rootScope.isLogged){
      $location.url('/');
    }

    $scope.showError = false;
    $scope.token = $routeParams.perishableToken;

    $scope.reset = function(){
      $rootScope.$broadcast("showLoadingModal");
      var jsonBody = {};
      jsonBody = $scope.loginUser;
      commonServices.patchAction('/password_resets/' + $scope.token, jsonBody).then(
        function(success){
          if(success.data !== null){
            $rootScope.loggedUser = success.data;
            $rootScope.isLogged = true;
            $location.path('/');
          }else{
            $rootScope.loggedUser = {};
            $rootScope.isLogged = false;
            $scope.showError = true;
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
;

angular.module('seqariApp').controller('clientController', ['$scope', 'commonServices', function ($scope, commonServices) {

    $scope.client = {};

    $scope.clients = [];

    /******************* WEB USER ********************/
    $scope.createClient = function(){
        var jsonBody = {};
        jsonBody = $scope.client;
        commonServices.postAction('createClient', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.updateClient = function(){
        var jsonBody = {};
        jsonBody = $scope.client;
        commonServices.postAction('updateClient', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.deleteClient = function(){
        var jsonBody = {};
        jsonBody = $scope.client;
        commonServices.postAction('deleteClient', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.listClients = function(){
        commonServices.getAction('listClients').then(
            function(success){
                $scope.clients = success.data;
            },
            function (error) {
                alert(error.error);
            }
        );
    };


}]);
;
angular.module('seqariApp').controller('mapCtrl', ['$scope', 'commonServices', function ($scope, commonServices) {

    //ARRAY DE CIUDADES A MOSTRAR
    $scope.cities = [
        {
            city : 'Montevideo',
            desc : 'La gran capital',
            lat : -34.890497,
            long : -56.114054
        },
        {
            city : 'Sarandí del Yí',
            desc : 'Pueblo con vacas y ovejas',
            lat : -33.338080,
            long : -55.630668
        },
        {
            city : 'Villa Serrana',
            desc : 'Traigan alfajores',
            lat : -34.320921,
            long : -54.985759
        }
    ];

    $scope.waypts = [];
    $scope.waypts.push({
        location:"-34.320921,-54.985759",
        stopover:true
    });

    //$scope.bounds = new google.maps.LatLngBounds();
    //$scope.markers = [];
    //$scope.infoWindow = new google.maps.InfoWindow();
    $scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: false});

    //OBJETOS DE ORIGEN Y DESTINO
    $scope.origin = new google.maps.LatLng($scope.cities[0].lat, $scope.cities[0].long);
    $scope.destination = new google.maps.LatLng($scope.cities[1].lat, $scope.cities[1].long);
    $scope.destination1 = new google.maps.LatLng($scope.cities[2].lat, $scope.cities[2].long);
    $scope.destinationIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=D|FF0000|000000';
    $scope.originIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=O|FFFF00|000000';
    //$scope.geocoder = new google.maps.Geocoder();

    //OPCIONES DEL MAPA
    $scope.mapOptions = {
        center: new google.maps.LatLng(-33.8887456, -55.8683931),
        zoom: 7,
        scaleControl: true,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };


    function initialize() {
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
        zoom: 8,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),
            myOptions);
}
google.maps.event.addDomListener(window, "load", initialize);

//    $scope.map = new google.maps.Map(document.getElementById('map'), $scope.mapOptions);
//    $scope.directionsDisplay.setMap($scope.map);

    //FUNCION PARA CALCULAR LA RUTA ENTRE CIUDADES
    $scope.calcRoute = function(){
        var request = {
            origin:$scope.origin,
            destination:$scope.destination,
            optimizeWaypoints:true,
            waypoints: $scope.waypts,
            travelMode: google.maps.TravelMode.DRIVING
        };
        $scope.directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                $scope.directionsDisplay.setDirections(response);
            }
        });
    };

    //FUNCION PARA CALCULAR DISTANCIAS ENTRE CIUDADES
    $scope.calculateDistances = function(){
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [$scope.origin],
            destinations: [$scope.destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, callback);
    };

    function callback(response, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
            alert('Error was: ' + status);
        } else {
            var origins = response.originAddresses;
            var destinations = response.destinationAddresses;
            var outputDiv = document.getElementById('outputDiv');
            outputDiv.innerHTML = '';
            $scope.deleteOverlays();

            for (var i = 0; i < origins.length; i++) {
                var results = response.rows[i].elements;
                //$scope.addMarker(origins[i], false, $scope.cities[0]);
                for (var j = 0; j < results.length; j++) {
                    //$scope.addMarker(destinations[j], true, $scope.cities[1]);
                    outputDiv.innerHTML += '<b>ORIGEN: </b>' + origins[i] + ' | <b>DESTINO: </b>' + destinations[j] +
                    ' | <b>DISTANCIA: </b>' + results[j].distance.text + ' | <b>TIEMPO ESTIMADO: </b>' + results[j].duration.text;
                }
            }
        }
    }

    //AGREGAR UN MARCADOR DETERMINADO EN EL MAPA
    /*$scope.addMarker = function(location, isDestination, info){
        var icon;
        if (isDestination) {
            icon = $scope.destinationIcon;
        } else {
            icon = $scope.originIcon;
        }
        $scope.geocoder.geocode({'address': location}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                $scope.bounds.extend(results[0].geometry.location);
                $scope.map.fitBounds($scope.bounds);
                var marker = new google.maps.Marker({
                    map: $scope.map,
                    position: results[0].geometry.location,
                    title: info.city,
                    icon: icon
                });

                //CONTENIDO DE LOS MARCADORES AL HACERLE CLICK
                marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';

                google.maps.event.addListener(marker, 'click', function(){
                    $scope.infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                    $scope.infoWindow.open($scope.map, marker);
                });

                $scope.markers.push(marker);

            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    };*/

    //BORRA LOS MARCADORES
    $scope.deleteOverlays = function(){
        for (var i = 0; i < $scope.markers.length; i++) {
            $scope.markers[i].setMap(null);
        }
        $scope.markers = [];
    };

    //ABRE LOS CUADROS EN CADA MARCADOR
    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    };

    //CALCULO DISTANCIAS DESDE UN INICIO
    $scope.calculateDistances();
    $scope.calcRoute();

}]);
;
angular.module('seqariApp').controller('userCtrl', ['$scope', 'userServices', function ($scope, userServices) {

    $scope.webUser = {};
    $scope.dispatcherUser = {};

    $scope.webUsers = [];
    $scope.dispatcherUsers = [];

    /******************* WEB USER ********************/
    $scope.createWebUser = function(){
        var jsonBody = {};
        jsonBody = $scope.webUser;
        commonServices.postAction('createWebUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.updateWebUser = function(){
        var jsonBody = {};
        jsonBody = $scope.webUser;
        commonServices.postAction('updateWebUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.deleteWebUser = function(){
        var jsonBody = {};
        jsonBody = $scope.webUser;
        commonServices.postAction('deleteWebUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.listWebUsers = function(){
        userServices.getAction('listWebUsers').then(
            function(success){
                $scope.webUsers = success.data;
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    /**************** DISPATCHER USER ****************/

    $scope.createDispatcherUser = function(){
        var jsonBody = {};
        jsonBody = $scope.dispatcherUser;
        commonServices.postAction('createDispatcherUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.updateDispatcherUser = function(){
        var jsonBody = {};
        jsonBody = $scope.dispatcherUser;
        commonServices.postAction('updateDispatcherUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.deleteDispatcherUser = function(){
        var jsonBody = {};
        jsonBody = $scope.dispatcherUser;
        commonServices.postAction('deleteDispatcherUser', jsonBody).then(
            function(success){
                alert(success.data);
            },
            function (error) {
                alert(error.error);
            }
        );
    };

    $scope.listDispatcherUsers = function(){
        userServices.getAction('listDispatcherUsers').then(
            function(success){
                $scope.dispatcherUsers = success.data;
            },
            function (error) {
                alert(error.error);
            }
        );
    };

}]);
;
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
;
angular.module('seqariApp').controller('profileCtrl', ['$scope', '$rootScope', 'commonServices', '$location', 'utilServices',
  function ($scope, $rootScope, commonServices, $location, utilServices) {

  	$scope.user = $rootScope.loggedUser;
  	$scope.password = "PASSWORD";
  	$scope.password_confirmation = "PASSWORD";

  	$scope.cancel = function(){
  		$location.url('/');
  	}

  	$scope.save = function(){
  		if($scope.password != "PASSWORD"){
  			$scope.user.password = $scope.password;
  			$scope.user.password_confirmation = $scope.password_confirmation;
  		}
  		commonServices.patchAction("/users/" + $scope.user.id, $scope.user).then(
        function(){
          utilServices.successModal('Modificar perfil', '¡Los datos han sido guardados correctamente!');
  				$location.url('/');
  			},
  			function(error){
  				utilServices.errorModal('Error', error);
  			}
	    );
  	};
  }
]);
;
angular.module('seqariApp').config(['$routeProvider',
  function ($routeProvider) {

    $routeProvider = $routeProvider.when('/profile',
      {
        templateUrl: 'app/profile/profile.html',
        controller: 'profileCtrl',
        title: 'Perfil de usuario'
      }
    );
  }
]);
;
angular.module('seqariApp').controller('businessReportCtrl', ['$scope', '$rootScope', 'commonServices', '$location', 'utilServices',
  function ($scope, $rootScope, commonServices, $location, utilServices) {

    $scope.data = {};
    $scope.showResults = false;

    //DATEPICKER
    $scope.openFrom = function($event) {
      $scope.openedFrom = true;
    };
    $scope.openTo = function($event) {
      $scope.openedTo = true;
    };

    $scope.searchReports = function(){
      $scope.report_client_order_quantity();
      $scope.report_deliver_avg();
      $scope.report_dispatchers_deliver_avg();
      $scope.report_orders_delivered();
      $scope.report_routes_finished();
      $scope.report_not_delivered_clients_quantity_by_date();
      $scope.showResults = true;
    };

    $scope.report_client_order_quantity = function(){
      commonServices.postAction('/report_client_order_quantity', $scope.data).then(
        function (result) {
          $scope.orderQuantity = result.data;
          $scope.orderQuantityLabels = [];
          $scope.orderQuantityInfo = [];
          $scope.auxOrderQuantity = [];
          for(var i = 0; i < $scope.orderQuantity.length; i++){
            $scope.orderQuantityLabels.push($scope.orderQuantity[i].left);
            $scope.auxOrderQuantity.push($scope.orderQuantity[i].count);
          }
          $scope.orderQuantityInfo.push($scope.auxOrderQuantity);
        },
        function (error) {
          console.log(error);
        }
      );
    };

    $scope.report_deliver_avg = function(){
      commonServices.postAction('/report_deliver_avg', $scope.data).then(
        function (result) {
          $scope.deliverAvg = result.data;
          $scope.deliverAvgLabels = [];
          $scope.deliverAvgInfo = [];
          $scope.auxDeliverAvg = [];
          for(var i = 0; i < $scope.deliverAvg.length; i++){
            $scope.deliverAvgLabels.push($scope.deliverAvg[i].left);
            $scope.auxDeliverAvg.push($scope.deliverAvg[i].interval_in_hours);
          }
          $scope.deliverAvgInfo.push($scope.auxDeliverAvg);
        },
        function (error) {
          console.log(error);
        }
      );
    };

    $scope.report_dispatchers_deliver_avg = function(){
      commonServices.postAction('/report_dispatchers_deliver_avg', $scope.data).then(
        function (result) {
          $scope.dispatcherDeliverAvg = result.data;
          $scope.dispatcherDeliverAvgLabels = [];
          $scope.dispatcherDeliverAvgInfo = [];
          $scope.auxDispatcherDeliverAvg = [];
          for(var i = 0; i < $scope.dispatcherDeliverAvg.length; i++){
            $scope.dispatcherDeliverAvgLabels.push($scope.dispatcherDeliverAvg[i].name);
            $scope.auxDispatcherDeliverAvg.push($scope.dispatcherDeliverAvg[i].interval_in_hours);
          }
          $scope.dispatcherDeliverAvgInfo.push($scope.auxDispatcherDeliverAvg);
        },
        function (error) {
          console.log(error);
        }
      );
    };

    $scope.report_not_delivered_clients_quantity_by_date = function(){
      commonServices.postAction('/report_not_delivered_clients_quantity_by_date', $scope.data).then(
        function (result) {
          $scope.ordersNotDelivered = result.data;
          $scope.ordersNotDeliveredLabels = [];
          $scope.ordersNotDeliveredInfo = [];
          $scope.auxOrdersNotDelivered = [];
          for(var i = 0; i < $scope.ordersNotDelivered.length; i++){
            if(i < 10){
              $scope.ordersNotDeliveredLabels.push($scope.ordersNotDelivered[i].fecha);
              $scope.auxOrdersNotDelivered.push($scope.ordersNotDelivered[i].cantidad);
            }else{
              $scope.auxOrdersMaxResults = true;
              break;
            }
          }
          $scope.ordersNotDeliveredInfo.push($scope.auxOrdersNotDelivered);
        },
        function (error) {
          console.log(error);
        }
      );
    };

    $scope.report_orders_delivered = function(){
      commonServices.postAction('/report_orders_delivered', $scope.data).then(
        function (result) {
          $scope.ordersDelivered = result.data;
        },
        function (error) {
          console.log(error);
        }
      );
    };

    $scope.report_routes_finished = function(){
      commonServices.postAction('/report_routes_finished', $scope.data).then(
        function (result) {
          $scope.routesFinished = result.data;
          for (var i = 0; i < $scope.routesFinished.length; i++) {
            var retorno = $rootScope.milisecToDaysHoursMinSec($scope.routesFinished[i].duration);
            if (retorno.d != 0) {
              $scope.routesFinished[i].strDuration = retorno.d + "d, " + retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
            }else {
              $scope.routesFinished[i].strDuration = retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
            }
          }
        },
        function (error) {
          console.log(error);
        }
      );
    };

  }
]);
;
angular.module('seqariApp').controller('dailyReportCtrl', ['$scope', '$rootScope', 'commonServices', '$location', 'utilServices',
  function ($scope, $rootScope, commonServices, $location, utilServices) {

    $scope.colors = {
      blue: '#ABC8D7',
      yellow: '#FDB45C',
      green: '#A7C17A',
      red: '#F86B6E'
    }

    commonServices.getAction('/report_daily_routes').then(
      function (result) {
        $scope.routesData = result.data;
        $scope.routesLabels = ["Pendientes", "En tránsito", "Finalizados"];
        $scope.routesInfo = [$scope.routesData.pending, $scope.routesData.in_transit, $scope.routesData.finalized];
        $scope.routesColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green]
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_orders').then(
      function (result) {
        $scope.ordersData = result.data;
        //Junto los estados entregados
        $scope.ordersData.delivered += $scope.ordersData.delivered_without_validation;
        $scope.ordersLabels = ["Pendientes", "En tránsito", "Entregados", "No entregados"];
        $scope.ordersInfo = [$scope.ordersData.pending, $scope.ordersData.in_transit, $scope.ordersData.delivered, $scope.ordersData.not_delivered];
        $scope.ordersColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red]
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_rutes_delay').then(
      function (result) {
        $scope.routesDelay = result.data;
        for(var j = 0; j < result.data.length; j++){
          if(result.data[j].route_delay == null){
            $scope.routesDelay.splice(j, 1);
          }
        }
        $scope.routesDelayLabels = [];
        $scope.routesDelayInfo = [];
        $scope.auxRoutesDelay = [];
        for(var i = 0; i < $scope.routesDelay.length; i++){
          $scope.routesDelayLabels.push('Recorrido ' + $scope.routesDelay[i].route_id);
          $scope.auxRoutesDelay.push($scope.routesDelay[i].route_delay);
          var retorno = $rootScope.milisecToDaysHoursMinSec($scope.routesDelay[i].route_delay*60000)
          if (retorno.d != 0) {
            $scope.routesDelay[i].route_delay_date = retorno.d + "d, " + retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
          }else {
            $scope.routesDelay[i].route_delay_date = retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
          }
        }
        $scope.routesDelayInfo.push($scope.auxRoutesDelay);
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_top_10_dispatchers').then(
      function (result) {
        $scope.topDispatchers = result.data;
        $scope.topDispatchersLabels = [];
        $scope.topDispatchersInfo = [];
        $scope.auxInfo = [];
        for(var i = 0; i < $scope.topDispatchers.length; i++){
          $scope.topDispatchersLabels.push($scope.topDispatchers[i].dispatcher_name);
          $scope.auxInfo.push($scope.topDispatchers[i].routes_count);
        }
        $scope.topDispatchersInfo.push($scope.auxInfo);
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_top_10_clients').then(
      function (result) {
        $scope.topClients = result.data;
        $scope.topClientsLabels = [];
        $scope.topClientsInfo = [];
        $scope.auxClients = [];
        for(var i = 0; i < $scope.topClients.length; i++){
          $scope.topClientsLabels.push($scope.topClients[i].client_business);
          $scope.auxClients.push($scope.topClients[i].order_count);
        }
        $scope.topClientsInfo.push($scope.auxClients);
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_top_10_clients_delay').then(
      function (result) {
        $scope.topClientsDelay = result.data;
        $scope.topClientsDelayLabels = [];
        $scope.topClientsDelayInfo = [];
        $scope.auxClientsDelay = [];
        for(var i = 0; i < $scope.topClientsDelay.length; i++){
          $scope.topClientsDelayLabels.push($scope.topClientsDelay[i].client_business);
          $scope.auxClientsDelay.push($scope.topClientsDelay[i].avg_proximity_elapsed);
        }
        $scope.topClientsDelayInfo.push($scope.auxClientsDelay);
      },
      function (error) {
        console.log(error);
      }
    );

    commonServices.getAction('/report_daily_top_hour_delivered').then(
      function (result) {
        $scope.hoursDelivered = result.data;
        $scope.hoursDeliveredLabels = [];
        $scope.hoursDeliveredInfo = [];
        $scope.auxHoursDelivered = [];
        for(var i = 0; i < $scope.hoursDelivered.length; i++){
          $scope.hoursDeliveredLabels.push($scope.hoursDelivered[i].hour + 'hs');
          $scope.auxHoursDelivered.push($scope.hoursDelivered[i].hour_count);
        }
        $scope.hoursDeliveredInfo.push($scope.auxHoursDelivered);
      },
      function (error) {
        console.log(error);
      }
    );

  }
]);
;
angular.module('seqariApp').controller('historyRouteCtrl', ['$scope', '$rootScope', 'commonServices', '$modal', '$location', 'ngTableParams', '$routeParams', '$timeout', '$q',
  function ($scope, $rootScope, commonServices, $modal, $location, ngTableParams, $routeParams, $timeout, $q) {

    $rootScope.$broadcast("showLoadingModal");

    $scope.id = $routeParams.id;
    $scope.markers = [];
    $scope.mapMarkers = [];
    $scope.infowindows = [];

    //AGREGO A CARRAU COMO MARCADOR
    $scope.markers.push({
        marker: {
          lat: $rootScope.carrau.lat,
          lng: $rootScope.carrau.long
        },
        client: {
          business: $rootScope.carrau.business,
          address: $rootScope.carrau.address
        }
    });

    var allHistoryRouteData = commonServices.getAction('index_with_clients/' + $scope.id);
    var routeSummariesData = commonServices.getAction('route_summary/' + $scope.id);
    var allData = $q.all([allHistoryRouteData,routeSummariesData]);
    allData.then(
      function (result) {
        $scope.historyRoute = result[0].data;
        $scope.routeSummaries = result[1].data;
        //Duracion total formatter
        $scope.duration = $rootScope.milisecToDaysHoursMinSec($scope.historyRoute.duration);

        for (var i = 0; i < $scope.historyRoute.clients.length; i++) {
          $scope.markers.push({
              marker: {
                lat: $scope.historyRoute.clients[i].lat,
                lng: $scope.historyRoute.clients[i].long
              },
              client: $scope.historyRoute.clients[i]
          });
        }
        $rootScope.$broadcast("addMarkers");
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    //INICIALIZO MAPA
    $scope.initialize = function() {
      $scope.directionsDisplay = new google.maps.DirectionsRenderer();
      var latlng = new google.maps.LatLng($rootScope.carrau.lat,$rootScope.carrau.long);
      var myOptions = {
        zoom: 12,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      $scope.directionsDisplay.setMap($scope.map);
    };
    $scope.init = function(){
      $scope.initialize();
    };

    $rootScope.$on("addMarkers",function(e){
      for (var j = 0; j < $scope.markers.length; j++) {
        $scope.addMarker(j);
        $scope.showInfoWindow(j);
      }
    });

    //AGREGO MARCADOR
    $scope.addMarker = function(index) {
      var iconUrl;
      if(index === 0){
        iconUrl = 'images/carrauMarker.png';
      }else{
        iconUrl = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=';
        switch ($scope.markers[index].client.route_client_status) {
          case 'PENDING':
            iconUrl = iconUrl + index + '|b1aae0|000000';
            break;
          case 'IN_TRANSIT':
            iconUrl = iconUrl + index + '|D5EB49|000000';
            break;
          case 'DELIVERED':
            iconUrl = iconUrl + index + '|10d11a|000000';
            break;
          case 'NOT_DELIVERED':
            iconUrl = iconUrl + index + '|db9292|000000';
            break;
        }
      }
      $scope.mapMarkers[index] = new google.maps.Marker({
        position: $scope.markers[index].marker,
        map: $scope.map,
        clickable: true,
        icon: iconUrl
      });
    };

    //AGREGO MODAL A MARCADOR
    $scope.showInfoWindow = function(index) {
      $scope.infowindows[index] = new google.maps.InfoWindow();
      $scope.mapMarkers[index].addListener('click', function() {
        var content = '<div class="modal-text"><legend>' + $scope.markers[index].client.business + '</legend>';
        if(!!$scope.markers[index].client.route_client_status){
          content = content + '<div><b>Estado: </b>' + $scope.filterStatus($scope.markers[index].client.route_client_status) + '</div>';
        }
        content = content + '<div><b>Dirección: </b>' + $scope.markers[index].client.address + '</div>';
        if(!!$scope.markers[index].client.phone){
          content = content + '<div><b>Teléfono: </b>' + $scope.markers[index].client.phone + '</div>';
        }
        if(!!$scope.markers[index].client.route_client_proximity){
          var elapsed = $rootScope.milisecToDaysHoursMinSec($scope.markers[index].client.route_client_proximity);
          if (elapsed.d != 0) {
            content = content + '<div><b>Tiempo de espera: </b>' + elapsed.d + 'd, ' + elapsed.h + 'hs, ' + elapsed.m + 'min, ' + elapsed.s + 'seg' + '</div>';
          }else {
            content = content + '<div><b>Tiempo de espera: </b>' + elapsed.h + 'hs, ' + elapsed.m + 'min, ' + elapsed.s + 'seg' + '</div>';
          }

        }
        content = content + '</div>';
        $scope.infowindows[index].setContent(content);
        $scope.infowindows[index].open($scope.map, $scope.mapMarkers[index]);
        $scope.mapMarkers[index].setAnimation(google.maps.Animation.BOUNCE);
      });
      $scope.infowindows[index].addListener('closeclick',function(){
        $scope.mapMarkers[index].setAnimation(null);
      });
    };

    $scope.filterStatus = function(status){
      var filteredStatus;
      switch (status) {
        case 'PENDING':   filteredStatus = 'Pendiente';break;
        case 'IN_TRANSIT':   filteredStatus = 'En tránsito';break;
        case 'DELIVERED':   filteredStatus = 'Entregado';break;
        case 'NOT_DELIVERED':   filteredStatus = 'No entregado';break;
        default: filteredStatus = status;
      }
      return filteredStatus;
    }

    $scope.redirectToRoute = function(){
  		$location.url('/route/' + $scope.id);
  	};

  }
]);
;
angular.module('seqariApp').controller('historyRoutesCtrl', ['$scope', '$rootScope', 'commonServices', '$modal', '$location', 'ngTableParams',
  function ($scope, $rootScope, commonServices, $modal, $location, ngTableParams) {

    $rootScope.$broadcast("showLoadingModal");

    //OBTENGO TODOS LOS RECORRIDOS FINALIZADOS
    var allFinalizedRoutesData = commonServices.getAction('history_routes');
    allFinalizedRoutesData.then(
      function (result) {
        $scope.finalizedRoutes = result.data;
        for (var i = 0; i < result.data.length; i++) {
          var retorno = $rootScope.milisecToDaysHoursMinSec(result.data[i].duration);
          if (retorno.d != 0) {
            result.data[i].strDuration = retorno.d + "d, " + retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
          }else {
            result.data[i].strDuration = retorno.h + "h, " + retorno.m + "m, " + retorno.s + "s";
          }
        }
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    //CLIENTES DE UN RECORRIDO
    $scope.showRouteClients = function(route){
      $rootScope.$broadcast("showLoadingModal");
      $modal.open({
        templateUrl: '/app/route/showRouteClientsModal.html',
        controller: 'showRouteClientsModalCtrl',
        resolve:{
          route: function(){
            return route;
          }
        }
      });
    };

    $scope.viewHistoryRoute = function(route_id){
      $location.url('/historyRoute/' + route_id);
    };

    //PAGINACION DE TODOS LOS RECORRIDOS
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
    }, {
        getData: function ($defer, params) {
            var orderedData = $scope.finalizedRoutes;
            params.total(orderedData.length);
            $defer.resolve($scope.blocks = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });

  }
]);
;
angular.module('seqariApp').controller('routeCtrl', ['$scope', '$rootScope', 'commonServices', '$modal', '$location', 'ngTableParams', '$routeParams', '$interval', '$timeout', '$q',
  function ($scope, $rootScope, commonServices, $modal, $location, ngTableParams, $routeParams, $interval, $timeout, $q) {

    $rootScope.$broadcast("showLoadingModal");

    $scope.id = $routeParams.id;
    $scope.waypts = [];
    $scope.markers = [];
    $scope.mapMarkers = [];
    $scope.infowindows = [];
    $scope.directionsService = new google.maps.DirectionsService();
    //Por defecto carrau es el origen y destino
    $scope.originLocation = new google.maps.LatLng($rootScope.carrau.lat, $rootScope.carrau.long);
    $scope.destinationLocation = new google.maps.LatLng($rootScope.carrau.lat, $rootScope.carrau.long);

    //AGREGO A CARRAU COMO MARCADOR
    $scope.markers.push({
        marker: {
          lat: $rootScope.carrau.lat,
          lng: $rootScope.carrau.long
        },
        client: {
          business: $rootScope.carrau.business,
          address: $rootScope.carrau.address
        }
    });

    var allRouteData = commonServices.getAction('index_with_clients/' + $scope.id);
    var routeSummariesData = commonServices.getAction('route_summary/' + $scope.id);
    var allData = $q.all([allRouteData,routeSummariesData]);
    allData.then(
      function (result) {
        $scope.route = result[0].data;
        $scope.routeSummaries = result[1].data;
        if($scope.route.status == 'IN_TRANSIT'){
          //Recorrido comienza con ubicación del camión
          $scope.originLocation = new google.maps.LatLng($scope.route.lat, $scope.route.long);
        }
        for (var i = 0; i < $scope.route.clients.length; i++) {
          if(i < 7 && ($scope.route.clients[i].route_client_status == 'IN_TRANSIT' || $scope.route.clients[i].route_client_status == 'PENDING')){
            $scope.waypts.push({
                location:$scope.route.clients[i].lat + ',' + $scope.route.clients[i].long,
                stopover:true
            });
          }
          $scope.markers.push({
              marker: {
                lat: $scope.route.clients[i].lat,
                lng: $scope.route.clients[i].long
              },
              client: $scope.route.clients[i]
          });
        }
        $rootScope.$broadcast("calculateRoute");
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    //INICIALIZO MAPA
    $scope.initialize = function() {
      $scope.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
      var latlng = new google.maps.LatLng($rootScope.carrau.lat,$rootScope.carrau.long);
      var myOptions = {
        zoom: 7,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      $scope.directionsDisplay.setMap($scope.map);
    };
    $scope.init = function(){
      $scope.initialize();
    };

    //FUNCION PARA CALCULAR LA RUTA ENTRE CIUDADES
    $scope.calcRoute = function(){
        var request = {
            origin: $scope.originLocation,
            destination: $scope.destinationLocation,
            optimizeWaypoints:true,
            waypoints: $scope.waypts,
            travelMode: google.maps.TravelMode.DRIVING
        };
        $scope.directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              //ESTABLECER ORDEN SUGERIDO DE LOS MARCADORES
              // for (var y = 0; y < result.routes[0].waypoint_order.length; y++) {
              //   $scope.markers[y+1].position = result.routes[0].waypoint_order[y]+1;
              // }
              $scope.directionsDisplay.setDirections(result);
              $scope.addMarkers();
            }
        });
    };

    //ACTUALIZO UBICACIÓN DEL TRANSPORTISTA
    $scope.updateDispatcherMarker = function(){
      commonServices.getAction("/get_dispatcher_location/" + $scope.route.id).then(
        function(result){
          var LatLng = new google.maps.LatLng(result.data.latitude, result.data.longitude);
          $scope.dispatcherMarker.setPosition(LatLng);
        },
        function(error){
          console.log('ERROR: No se pudo obtener ubicación actual - ' + error);
        }
      );
    };

    //AGREGO MARCADORES
    $scope.addMarkers = function() {
      for (var j = 0; j < $scope.markers.length; j++) {
        var iconUrl;
        if(j === 0){
          iconUrl = 'images/carrauMarker.png';
        }else{
          switch ($scope.markers[j].client.route_client_status) {
            case 'PENDING':
              iconUrl = 'images/pendingMarker.png';
              break;
            case 'IN_TRANSIT':
              iconUrl = 'images/inTransitMarker.png';
              break;
            case 'DELIVERED':
              iconUrl = 'images/deliveredMarker.png';
              break;
            case 'NOT_DELIVERED':
              iconUrl = 'images/notDeliveredMarker.png';
              break;
          }
        }
        $scope.mapMarkers[j] = new google.maps.Marker({
          position: $scope.markers[j].marker,
          map: $scope.map,
          clickable: true,
          icon: iconUrl
        });
        $scope.showInfoWindow(j);
      }
      var truckMarker = {
        lat: $scope.route.lat,
        lng: $scope.route.long
      }
      $scope.dispatcherMarker = new google.maps.Marker({
        position: truckMarker,
        map: $scope.map,
        clickable: false,
        icon: 'images/truck.png'
      });
      $timeout(function () {
        $scope.$broadcast('setDispatcherLocation');
      },1000);
    };

    //CONSULTO UBICACION DEL TRANSPORTISTA CADA 10 SEGUNDOS
    $scope.$on('setDispatcherLocation', function (event) {
      $interval($scope.updateDispatcherMarker, 10000);
    });

    //AGREGO MODAL A MARCADOR
    $scope.showInfoWindow = function(index) {
      $scope.infowindows[index] = new google.maps.InfoWindow();
      $scope.mapMarkers[index].addListener('click', function() {
        var content = '<div class="modal-text"><legend>' + $scope.markers[index].client.business + '</legend>';
        if(!!$scope.markers[index].client.route_client_status){
          content = content + '<div><b>Estado: </b>' + $scope.filterStatus($scope.markers[index].client.route_client_status) + '</div>';
        }
        content = content + '<div><b>Dirección: </b>' + $scope.markers[index].client.address + '</div>';
        if(!!$scope.markers[index].client.phone){
          content = content + '<div><b>Teléfono: </b>' + $scope.markers[index].client.phone + '</div>';
        }
        content = content + '</div>';
        $scope.infowindows[index].setContent(content);
        $scope.infowindows[index].open($scope.map, $scope.mapMarkers[index]);
        $scope.mapMarkers[index].setAnimation(google.maps.Animation.BOUNCE);
      });
      $scope.infowindows[index].addListener('closeclick',function(){
        $scope.mapMarkers[index].setAnimation(null);
      });
    };

    $scope.filterStatus = function(status){
      var filteredStatus;
      switch (status) {
        case 'PENDING':   filteredStatus = 'Pendiente';break;
        case 'IN_TRANSIT':   filteredStatus = 'En tránsito';break;
        case 'DELIVERED':   filteredStatus = 'Entregado';break;
        case 'NOT_DELIVERED':   filteredStatus = 'No entregado';break;
        default: filteredStatus = status;
      }
      return filteredStatus;
    }

    $rootScope.$on("calculateRoute",function(e){
        $scope.calcRoute();
    });

    $scope.redirectToHistoryRoute = function(){
  		$location.url('/historyRoute/' + $scope.id);
  	};

    $scope.refreshRoute = function(){
      var refreshData = commonServices.getAction('index_with_clients/' + $scope.id);
      refreshData.then(
        function (result) {
          $scope.markers = [];
          $scope.waypts = [];
          $scope.deleteMarkers();
          //AGREGO A CARRAU COMO MARCADOR
          $scope.markers.push({
              marker: {
                lat: $rootScope.carrau.lat,
                lng: $rootScope.carrau.long
              },
              client: {
                business: $rootScope.carrau.business,
                address: $rootScope.carrau.address
              }
          });
          $scope.route = result.data;
          if($scope.route.status == 'IN_TRANSIT'){
            //Recorrido comienza con ubicación del camión
            $scope.originLocation = new google.maps.LatLng($scope.route.lat, $scope.route.long);
          }
          for (var i = 0; i < $scope.route.clients.length; i++) {
            if(i < 7 && ($scope.route.clients[i].route_client_status == 'IN_TRANSIT' || $scope.route.clients[i].route_client_status == 'PENDING')){
              $scope.waypts.push({
                  location:$scope.route.clients[i].lat + ',' + $scope.route.clients[i].long,
                  stopover:true
              });
            }
            $scope.markers.push({
                marker: {
                  lat: $scope.route.clients[i].lat,
                  lng: $scope.route.clients[i].long
                },
                client: $scope.route.clients[i]
            });
          }
          $rootScope.$broadcast("calculateRoute");
        }
      );
  	};

    $scope.deleteMarkers = function(){
      for (var i = 0; i < $scope.mapMarkers.length; i++) {
        $scope.mapMarkers[i].setMap(null);
      }
      $scope.mapMarkers = [];
  	};

  }
]);
;
angular.module('seqariApp').config(['$routeProvider',
  function ($routeProvider) {

    $routeProvider = $routeProvider.when('/route/:id',
      {
        templateUrl: 'app/route/route.html',
        controller: 'routeCtrl',
        title: 'Recorrido'
      }
    );

    $routeProvider = $routeProvider.when('/historyRoute/:id',
      {
        templateUrl: 'app/route/historyRoute.html',
        controller: 'historyRouteCtrl',
        title: 'Recorrido'
      }
    );

  }
]);
;
angular.module('seqariApp').controller('routesCtrl', ['$scope', '$rootScope', 'commonServices', '$modal', '$location', 'ngTableParams',
  function ($scope, $rootScope, commonServices, $modal, $location, ngTableParams) {

    $rootScope.$broadcast("showLoadingModal");

    //OBTENGO TODOS LOS RECORRIDOS
    var allRoutesData = commonServices.getAction('current_routes');
    allRoutesData.then(
      function (result) {
        $scope.allRoutes = result.data;
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    //PAGINACION DE TODOS LOS RECORRIDOS
    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
    }, {
        getData: function ($defer, params) {
            var orderedData = $scope.allRoutes;
            params.total(orderedData.length);
            $defer.resolve($scope.blocks = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });

    //CLIENTES DE UN RECORRIDO
    $scope.showRouteClients = function(route){
      $rootScope.$broadcast("showLoadingModal");
      $modal.open({
        templateUrl: '/app/route/showRouteClientsModal.html',
        controller: 'showRouteClientsModalCtrl',
        resolve:{
          route: function(){
            return route;
          }
        }
      });
    };

    $scope.viewRoute = function(route_id){
      $location.url('/route/' + route_id);
    };

  }
]);
;
angular.module('seqariApp').controller('showRouteClientsModalCtrl', ['$scope', '$rootScope', 'commonServices', 'route', '$modalInstance', '$route', 'utilServices',
  function ($scope, $rootScope, commonServices, route, $modalInstance, $route, utilServices) {

    $scope.route = route;

    //OBTENGO TODOS LOS 'routeClient' DEL RECORRIDO
    var allRouteClientsData = commonServices.getAction('index_by_route/' + $scope.route.id);
    allRouteClientsData.then(
      function (result) {
        $scope.allRouteClients = result.data;
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
;
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
;
angular.module('seqariApp').controller('webUserCtrl', ['$scope', '$rootScope', 'commonServices', '$modal',
  function ($scope, $rootScope, commonServices, $modal) {

    $rootScope.$broadcast("showLoadingModal");

    var allUsersData = commonServices.getAction('users');
    allUsersData.then(
      function (result) {
        $scope.allUsers = result.data;
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    $scope.modifyUserDataModal = function(user){
  		$modal.open({
  			templateUrl: '/app/webUser/adminUserDataModal.html',
  			controller: 'modifyUserDataCtrl',
  			resolve:{
  				user: function(){
  					return user;
  				},
          type: function(){
            return 'UPDATE';
          }
  			}
  		});
    };

    $scope.createUserDataModal = function(){
      $modal.open({
        templateUrl: '/app/webUser/adminUserDataModal.html',
        controller: 'createUserDataCtrl',
        resolve:{
          user: function(){
            return {};
          },
          type: function(){
            return 'CREATE';
          }
        }
      });
    };

    $scope.profileModal = function(user){
  		$modal.open({
  			templateUrl: '/app/webUser/profileModal.html',
  			controller: 'profileModalCtrl',
  			resolve:{
  				user: function(){
  					return user;
  				}
  			}
  		});
    };

  }
]);

angular.module('seqariApp').controller('createUserDataCtrl', ['$scope', '$rootScope', 'commonServices', 'user', 'type', '$modalInstance', '$route', 'utilServices',
  function ($scope, $rootScope, commonServices, user, type, $modalInstance, $route, utilServices) {

    $scope.user = angular.copy(user);
    $scope.type = type;
    $scope.user.queries = true;

    $scope.save = function(){
      $rootScope.$broadcast("showLoadingModal");
      $scope.user.password = $scope.user.login;
      $scope.user.password_confirmation = $scope.user.login;
      $scope.user.active = true;
      commonServices.postAction("/users/", $scope.user).then(
        function(){
          $route.reload();
          $modalInstance.dismiss('cancel');
          utilServices.successModal('Crear usuario web', '¡El usuario web ha sido creado correctamente!');
        },
        function(error){
          if (error.login =! null && error.email == null) {
            error.message = 'Usuario incorrecto';
          }else if (error.email != null) {
            error.message = 'Email inválido';
          }else {
            error.message = 'Datos incorrectos';
          }
          console.log(error);
          utilServices.errorModal('Error', error);
        }
      );
    };

    $scope.close = function(){
      $modalInstance.dismiss('cancel');
    };

  }
]);

angular.module('seqariApp').controller('modifyUserDataCtrl', ['$scope', '$rootScope', 'commonServices', 'user', 'type', '$modalInstance', '$route', 'utilServices',
  function ($scope, $rootScope, commonServices, user, type, $modalInstance, $route, utilServices) {

    $scope.user = angular.copy(user);
    $scope.type = type;

  	$scope.save = function(){
      $rootScope.$broadcast("showLoadingModal");
  		commonServices.patchAction("/users/" + $scope.user.id, $scope.user).then(
  			function(){
          if($rootScope.loggedUser.id === $scope.user.id && $rootScope.loggedUser.name !== $scope.user.name){
            $rootScope.loggedUser.name = $scope.user.name;
          }
          $route.reload();
  				$modalInstance.dismiss('cancel');
          utilServices.successModal('Modificar usuario web', '¡El usuario web ha sido modificado correctamente!');
  			},
  			function(error){
          utilServices.errorModal('Error', error);
  			}
  		);
  	};

  	$scope.close = function(){
  		$modalInstance.dismiss('cancel');
  	};

  }
]);

angular.module('seqariApp').controller('profileModalCtrl', ['$scope', '$rootScope', 'commonServices', 'user', '$modalInstance', 'utilServices',
  function ($scope, $rootScope, commonServices, user, $modalInstance, utilServices) {

    $scope.user = user;

    $scope.close = function(){
      $modalInstance.dismiss('cancel');
    };

  }
]);
;
angular.module("seqariApp").directive('accessError',
  function () {
    return {
      restrict: 'A',
      transclude: true,
      templateUrl: 'app/common/error/accessError.html'
    };
  }
);
;
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
;
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
;
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
;
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
;
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
;
angular.module('seqariApp').directive('loadingModal',
  function () {
    return {
      restrict: 'A',
      scope: { show: '=' },
      transclude: true,
      templateUrl: 'app/common/loading/loading.html',
      controller: ['$scope',
        function ($scope) {

          $scope.loadingModal = !!$scope.show;
          $scope.loadingModalCount = 0;

          if ($scope.loadingModal) {
            $scope.loadingModalCount = 1;
          }

          $scope.$on('showLoadingModal', function () {
            $scope.loadingModal = true;
            $scope.loadingModalCount += 1;
          });

          $scope.$on('hideLoadingModal', function () {
            $scope.loadingModalCount -= 1;
            if ($scope.loadingModalCount <= 0) {
              $scope.loadingModal = false;
              $scope.loadingModalCount = 0;
            }
          });

          $scope.$on('forceHideLoadingModal', function () {
            $scope.loadingModal = false;
            $scope.loadingModalCount = 0;
          });

          $scope.$on('showSingleLoadingModal', function () {
            $scope.loadingModal = true;
          });

        }
      ]
    };
  }
);
;
angular.module("seqariApp").directive('navbar',
  function () {
    return {
      restrict: 'A',
      transclude: true,
      templateUrl: 'app/common/navbar/navbar.html',
      controller: ['$rootScope', '$scope', '$location',
        function ($rootScope, $scope, $location) {

          $scope.goProfile = function(user){
            $location.url('/profile');
          };

          $scope.goHelp = function(){
            $location.url('/help');
          };

        }
      ]
    };
  }
);
;
angular.module("seqariApp").service('utilServices', ['$modal', function ($modal) {

  this.errorModal = function (title, error) {
    $modal.open({
      templateUrl: 'app/common/utils/errorModal.html',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        title: function () {
          return title;
        },
        error: function () {
          return error;
        }
      },
      controller: ['$scope','$rootScope','$modalInstance','title','error',
        function ($scope, $rootScope, $modalInstance, title, error) {

          $scope.error = {
            title: title,
            code: error.code,
            message: error.message
          };

          $rootScope.$broadcast("forceHideLoadingModal");

          $scope.close = function () {
            $modalInstance.dismiss('cancel');
          };

        }
      ]
    });
  };

  this.successModal = function (title, success) {
    $modal.open({
      templateUrl: 'app/common/utils/successModal.html',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        title: function () {
          return title;
        },
        success: function () {
          return success;
        }
      },
      controller: ['$scope','$rootScope','$modalInstance','title','success',
        function ($scope,$rootScope,$modalInstance,title,success) {

          $scope.success = {
            title: title,
            message: success
          };

          $rootScope.$broadcast("forceHideLoadingModal");

          $scope.close = function () {
            $modalInstance.dismiss('cancel');
          };

        }
      ]
    });
  };

}]);
