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
