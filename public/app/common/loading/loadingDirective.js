angular.module('seqariApp').directive('loadingModal',
  function () {
    return {
      restrict: 'A',
      scope: { show: '=' },
      transclude: true,
      templateUrl: 'app/common/loading/loading.html',
      controller: ['$scope',
        function ($scope) {

          $scope.loadingModal = !!$scope.show;
          $scope.loadingModalCount = 0;

          if ($scope.loadingModal) {
            $scope.loadingModalCount = 1;
          }

          $scope.$on('showLoadingModal', function () {
            $scope.loadingModal = true;
            $scope.loadingModalCount += 1;
          });

          $scope.$on('hideLoadingModal', function () {
            $scope.loadingModalCount -= 1;
            if ($scope.loadingModalCount <= 0) {
              $scope.loadingModal = false;
              $scope.loadingModalCount = 0;
            }
          });

          $scope.$on('forceHideLoadingModal', function () {
            $scope.loadingModal = false;
            $scope.loadingModalCount = 0;
          });

          $scope.$on('showSingleLoadingModal', function () {
            $scope.loadingModal = true;
          });

        }
      ]
    };
  }
);
