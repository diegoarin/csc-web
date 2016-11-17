angular.module('seqariApp').controller('historyRouteCtrl', ['$scope', '$rootScope', 'commonServices', '$modal', '$location', 'ngTableParams', '$routeParams', '$timeout', '$q',
  function ($scope, $rootScope, commonServices, $modal, $location, ngTableParams, $routeParams, $timeout, $q) {

    $rootScope.$broadcast("showLoadingModal");

    $scope.id = $routeParams.id;
    $scope.markers = [];
    $scope.mapMarkers = [];
    $scope.infowindows = [];

    //AGREGO A CARRAU COMO MARCADOR
    $scope.markers.push({
        marker: {
          lat: $rootScope.carrau.lat,
          lng: $rootScope.carrau.long
        },
        client: {
          business: $rootScope.carrau.business,
          address: $rootScope.carrau.address
        }
    });

    var allHistoryRouteData = commonServices.getAction('index_with_clients/' + $scope.id);
    var routeSummariesData = commonServices.getAction('route_summary/' + $scope.id);
    var allData = $q.all([allHistoryRouteData,routeSummariesData]);
    allData.then(
      function (result) {
        $scope.historyRoute = result[0].data;
        $scope.routeSummaries = result[1].data;
        //Duracion total formatter
        $scope.duration = $rootScope.milisecToDaysHoursMinSec($scope.historyRoute.duration);

        for (var i = 0; i < $scope.historyRoute.clients.length; i++) {
          $scope.markers.push({
              marker: {
                lat: $scope.historyRoute.clients[i].lat,
                lng: $scope.historyRoute.clients[i].long
              },
              client: $scope.historyRoute.clients[i]
          });
        }
        $rootScope.$broadcast("addMarkers");
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    //INICIALIZO MAPA
    $scope.initialize = function() {
      $scope.directionsDisplay = new google.maps.DirectionsRenderer();
      var latlng = new google.maps.LatLng($rootScope.carrau.lat,$rootScope.carrau.long);
      var myOptions = {
        zoom: 12,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      $scope.directionsDisplay.setMap($scope.map);
    };
    $scope.init = function(){
      $scope.initialize();
    };

    $rootScope.$on("addMarkers",function(e){
      for (var j = 0; j < $scope.markers.length; j++) {
        $scope.addMarker(j);
        $scope.showInfoWindow(j);
      }
    });

    //AGREGO MARCADOR
    $scope.addMarker = function(index) {
      var iconUrl;
      if(index === 0){
        iconUrl = 'images/carrauMarker.png';
      }else{
        iconUrl = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=';
        switch ($scope.markers[index].client.route_client_status) {
          case 'PENDING':
            iconUrl = iconUrl + index + '|b1aae0|000000';
            break;
          case 'IN_TRANSIT':
            iconUrl = iconUrl + index + '|D5EB49|000000';
            break;
          case 'DELIVERED':
            iconUrl = iconUrl + index + '|10d11a|000000';
            break;
          case 'NOT_DELIVERED':
            iconUrl = iconUrl + index + '|db9292|000000';
            break;
        }
      }
      $scope.mapMarkers[index] = new google.maps.Marker({
        position: $scope.markers[index].marker,
        map: $scope.map,
        clickable: true,
        icon: iconUrl
      });
    };

    //AGREGO MODAL A MARCADOR
    $scope.showInfoWindow = function(index) {
      $scope.infowindows[index] = new google.maps.InfoWindow();
      $scope.mapMarkers[index].addListener('click', function() {
        var content = '<div class="modal-text"><legend>' + $scope.markers[index].client.business + '</legend>';
        if(!!$scope.markers[index].client.route_client_status){
          content = content + '<div><b>Estado: </b>' + $scope.filterStatus($scope.markers[index].client.route_client_status) + '</div>';
        }
        content = content + '<div><b>Dirección: </b>' + $scope.markers[index].client.address + '</div>';
        if(!!$scope.markers[index].client.phone){
          content = content + '<div><b>Teléfono: </b>' + $scope.markers[index].client.phone + '</div>';
        }
        if(!!$scope.markers[index].client.route_client_proximity){
          var elapsed = $rootScope.milisecToDaysHoursMinSec($scope.markers[index].client.route_client_proximity);
          if (elapsed.d != 0) {
            content = content + '<div><b>Tiempo de espera: </b>' + elapsed.d + 'd, ' + elapsed.h + 'hs, ' + elapsed.m + 'min, ' + elapsed.s + 'seg' + '</div>';
          }else {
            content = content + '<div><b>Tiempo de espera: </b>' + elapsed.h + 'hs, ' + elapsed.m + 'min, ' + elapsed.s + 'seg' + '</div>';
          }

        }
        content = content + '</div>';
        $scope.infowindows[index].setContent(content);
        $scope.infowindows[index].open($scope.map, $scope.mapMarkers[index]);
        $scope.mapMarkers[index].setAnimation(google.maps.Animation.BOUNCE);
      });
      $scope.infowindows[index].addListener('closeclick',function(){
        $scope.mapMarkers[index].setAnimation(null);
      });
    };

    $scope.filterStatus = function(status){
      var filteredStatus;
      switch (status) {
        case 'PENDING':   filteredStatus = 'Pendiente';break;
        case 'IN_TRANSIT':   filteredStatus = 'En tránsito';break;
        case 'DELIVERED':   filteredStatus = 'Entregado';break;
        case 'NOT_DELIVERED':   filteredStatus = 'No entregado';break;
        default: filteredStatus = status;
      }
      return filteredStatus;
    }

    $scope.redirectToRoute = function(){
  		$location.url('/route/' + $scope.id);
  	};

  }
]);
