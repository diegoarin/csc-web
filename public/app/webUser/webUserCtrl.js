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
