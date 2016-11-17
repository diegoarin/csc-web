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
