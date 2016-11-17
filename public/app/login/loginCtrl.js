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
