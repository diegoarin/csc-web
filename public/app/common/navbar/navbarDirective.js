angular.module("seqariApp").directive('navbar',
  function () {
    return {
      restrict: 'A',
      transclude: true,
      templateUrl: 'app/common/navbar/navbar.html',
      controller: ['$rootScope', '$scope', '$location',
        function ($rootScope, $scope, $location) {

          $scope.goProfile = function(user){
            $location.url('/profile');
          };

          $scope.goHelp = function(){
            $location.url('/help');
          };

        }
      ]
    };
  }
);
