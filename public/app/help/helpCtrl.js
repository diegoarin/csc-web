angular.module('seqariApp').controller('helpCtrl', ['$scope', '$rootScope', 'commonServices', '$location', 'utilServices',
  function ($scope, $rootScope, commonServices, $location, utilServices) {

  	$scope.goBack = function(){
  		$location.url('/');
  	}
  }
]);
