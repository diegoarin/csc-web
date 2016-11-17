angular.module('seqariApp').controller('clientCtrl', ['$scope', '$rootScope', 'commonServices',  '$modal',
  function ($scope, $rootScope, commonServices, $modal) {

    $rootScope.$broadcast("showLoadingModal");

    var allClientsData = commonServices.getAction('clients');
    allClientsData.then(
      function (result) {
        $scope.allClients = result.data;
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    $scope.createClientDataModal = function(){
      var modalInstance = $modal.open({
        templateUrl: '/app/client/adminClientDataModal.html',
        controller: 'createClientDataCtrl',
        size: '800',
        resolve:{
          client: function(){
            return {};
          },
          type: function(){
            return 'CREATE';
          }
        }
      });
    };

    $scope.modifyClientDataModal = function(client){
      $modal.open({
        templateUrl: '/app/client/adminClientDataModal.html',
        controller: 'modifyClientDataCtrl',
        size: '800',
        resolve:{
          client: function(){
            return client;
          },
          type: function(){
            return 'UPDATE';
          }
        }
      });
    };

  }
]);

angular.module('seqariApp').controller('createClientDataCtrl', ['$scope', '$rootScope', 'commonServices', 'client', 'type', '$modalInstance', '$route', '$timeout', 'utilServices',
  function ($scope, $rootScope, commonServices, client, type, $modalInstance, $route, $timeout, utilServices) {

    $scope.isMapLoaded = false;
    $scope.client = angular.copy(client);
    $scope.type = type;

    $scope.initialize = function() {

      var latlng = new google.maps.LatLng(-33.7852771,-55.7143609);
      var myOptions = {
        zoom: 7,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      $scope.isMapLoaded = true;
    };

    $scope.init = function(){
      $scope.initialize();
    };

    $scope.$watch("map", function(newValue, oldValue){
      if($scope.isMapLoaded){
        google.maps.event.addListener($scope.map, "click", function(event) {
          $scope.client.lat = event.latLng.lat();
          $scope.client.long = event.latLng.lng();
          if($scope.marker){
            $scope.marker.setMap(null);
          }
          $scope.marker = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          $scope.addMarker($scope.marker, $scope.map);
        });
      }
    });

    $scope.addMarker = function(location, map) {
      $scope.marker = new google.maps.Marker({
        position: location,
        map: map
      });
    };

    $timeout(function () {
      google.maps.event.trigger($scope.map, 'resize');
      $scope.map.setCenter(new google.maps.LatLng(-33.7852771,-55.7143609));
    },0);

    $scope.save = function(){
      $rootScope.$broadcast("showLoadingModal");
      $scope.client.active = true;
      commonServices.postAction('/clients/', $scope.client).then(
        function(){
          $route.reload();
          $modalInstance.dismiss('cancel');
          utilServices.successModal('Crear cliente', '¡El cliente ha sido creado correctamente!');
        },
        function(error){
          if (error.cr !== null) {
            error.message = 'ID del cliente incorrecto';
          }else {
            error.message = 'Datos ingresados inválidos';
          }
          utilServices.errorModal('Error', error);
        }
      );
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

  }
]);

angular.module('seqariApp').controller('modifyClientDataCtrl', ['$scope', '$rootScope', 'commonServices', 'client', 'type', '$modalInstance', '$route', '$timeout', 'utilServices',
  function ($scope, $rootScope, commonServices, client, type, $modalInstance, $route, $timeout, utilServices) {

    $scope.isMapLoaded = false;
    $scope.client = angular.copy(client);
    $scope.type = type;

    $scope.initialize = function() {
      var latlng = new google.maps.LatLng($scope.client.lat,$scope.client.long);
      var myOptions = {
        zoom: 15,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      $scope.marker = { lat: $scope.client.lat, lng: $scope.client.long };
      addMarker($scope.marker, $scope.map);
      $scope.isMapLoaded = true;
    };

    $scope.init = function(){
      $scope.initialize();
    };

    $scope.$watch("map", function(newValue, oldValue){
      if($scope.isMapLoaded){
        google.maps.event.addListener($scope.map, "click", function(event) {
          $scope.client.lat = event.latLng.lat();
          $scope.client.long = event.latLng.lng();
          if($scope.marker){
            $scope.marker.setMap(null);
          }
          $scope.marker = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          addMarker($scope.marker, $scope.map);
        });
      }
    });

    function addMarker(location, map) {
      $scope.marker = new google.maps.Marker({
        position: location,
        map: map
      });
    }

    $timeout(function () {
      google.maps.event.trigger($scope.map, 'resize');
      $scope.map.setCenter(new google.maps.LatLng($scope.client.lat,$scope.client.long));
    },0);

    $scope.save = function(){
      $rootScope.$broadcast("showLoadingModal");
      commonServices.patchAction('/clients/' + $scope.client.id, $scope.client).then(
        function(){
          $route.reload();
          $modalInstance.dismiss('cancel');
          utilServices.successModal('Modificar cliente', '¡El cliente ha sido modificado correctamente!');
        },
        function(error){
          utilServices.errorModal('Error', error);
        }
      );
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

  }
]);
