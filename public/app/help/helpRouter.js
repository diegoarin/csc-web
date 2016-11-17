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
]);