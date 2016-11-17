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
