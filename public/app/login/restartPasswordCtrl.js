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
