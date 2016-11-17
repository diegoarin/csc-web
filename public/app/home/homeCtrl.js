angular.module('seqariApp').controller('homeCtrl', ['$scope', '$rootScope', 'commonServices', '$location', 'utilServices',
function ($scope, $rootScope, commonServices, $location, utilServices) {

	$scope.logout = function(id){
		$rootScope.$broadcast("showLoadingModal");
		commonServices.deleteAction('/user_sessions/' + id).then(
			function(success){
				$rootScope.loggedUser = {};
				$rootScope.isLogged = false;
				$location.url('/login');
				$rootScope.$broadcast("hideLoadingModal");
			},
			function (error) {
				utilServices.errorModal('Error', error);
			}
		);
	};

	$rootScope.goHome = function(){
		$location.url('/');
	};

	$rootScope.goToLogin = function(){
		$location.url('/login');
	};

	$rootScope.adminWebUsers = function(){
		$location.url('/webUsers');
	};

	$rootScope.adminClients = function(){
		$location.url('/clients');
	};

	$rootScope.adminDispatchers = function(){
		$location.url('/dispatchers');
	};

	$rootScope.showOrders = function(){
		$location.url('/orders');
	};

	$rootScope.showRoutes = function(){
		$location.url('/routes');
	};

	$rootScope.showHistoryRoutes = function(){
		$location.url('/historyRoutes');
	};

	$rootScope.dailyReports = function(){
		$location.url('/dailyReports');
	};

	$rootScope.businessReports = function(){
		$location.url('/businessReports');
	};

}
]);
