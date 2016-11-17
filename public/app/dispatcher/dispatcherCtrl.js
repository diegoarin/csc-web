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
