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
