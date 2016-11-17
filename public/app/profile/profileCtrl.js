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
