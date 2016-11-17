angular.module('seqariApp').controller('routeCtrl', ['$scope', '$rootScope', 'commonServices', '$modal', '$location', 'ngTableParams', '$routeParams', '$interval', '$timeout', '$q',
  function ($scope, $rootScope, commonServices, $modal, $location, ngTableParams, $routeParams, $interval, $timeout, $q) {

    $rootScope.$broadcast("showLoadingModal");

    $scope.id = $routeParams.id;
    $scope.waypts = [];
    $scope.markers = [];
    $scope.mapMarkers = [];
    $scope.infowindows = [];
    $scope.directionsService = new google.maps.DirectionsService();
    //Por defecto carrau es el origen y destino
    $scope.originLocation = new google.maps.LatLng($rootScope.carrau.lat, $rootScope.carrau.long);
    $scope.destinationLocation = new google.maps.LatLng($rootScope.carrau.lat, $rootScope.carrau.long);

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

    var allRouteData = commonServices.getAction('index_with_clients/' + $scope.id);
    var routeSummariesData = commonServices.getAction('route_summary/' + $scope.id);
    var allData = $q.all([allRouteData,routeSummariesData]);
    allData.then(
      function (result) {
        $scope.route = result[0].data;
        $scope.routeSummaries = result[1].data;
        if($scope.route.status == 'IN_TRANSIT'){
          //Recorrido comienza con ubicación del camión
          $scope.originLocation = new google.maps.LatLng($scope.route.lat, $scope.route.long);
        }
        for (var i = 0; i < $scope.route.clients.length; i++) {
          if(i < 7 && ($scope.route.clients[i].route_client_status == 'IN_TRANSIT' || $scope.route.clients[i].route_client_status == 'PENDING')){
            $scope.waypts.push({
                location:$scope.route.clients[i].lat + ',' + $scope.route.clients[i].long,
                stopover:true
            });
          }
          $scope.markers.push({
              marker: {
                lat: $scope.route.clients[i].lat,
                lng: $scope.route.clients[i].long
              },
              client: $scope.route.clients[i]
          });
        }
        $rootScope.$broadcast("calculateRoute");
        $rootScope.$broadcast("hideLoadingModal");
      },
      function (error) {
        $location.url('/500');
        $rootScope.$broadcast("hideLoadingModal");
      }
    );

    //INICIALIZO MAPA
    $scope.initialize = function() {
      $scope.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
      var latlng = new google.maps.LatLng($rootScope.carrau.lat,$rootScope.carrau.long);
      var myOptions = {
        zoom: 7,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      $scope.directionsDisplay.setMap($scope.map);
    };
    $scope.init = function(){
      $scope.initialize();
    };

    //FUNCION PARA CALCULAR LA RUTA ENTRE CIUDADES
    $scope.calcRoute = function(){
        var request = {
            origin: $scope.originLocation,
            destination: $scope.destinationLocation,
            optimizeWaypoints:true,
            waypoints: $scope.waypts,
            travelMode: google.maps.TravelMode.DRIVING
        };
        $scope.directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              //ESTABLECER ORDEN SUGERIDO DE LOS MARCADORES
              // for (var y = 0; y < result.routes[0].waypoint_order.length; y++) {
              //   $scope.markers[y+1].position = result.routes[0].waypoint_order[y]+1;
              // }
              $scope.directionsDisplay.setDirections(result);
              $scope.addMarkers();
            }
        });
    };

    //ACTUALIZO UBICACIÓN DEL TRANSPORTISTA
    $scope.updateDispatcherMarker = function(){
      commonServices.getAction("/get_dispatcher_location/" + $scope.route.id).then(
        function(result){
          var LatLng = new google.maps.LatLng(result.data.latitude, result.data.longitude);
          $scope.dispatcherMarker.setPosition(LatLng);
        },
        function(error){
          console.log('ERROR: No se pudo obtener ubicación actual - ' + error);
        }
      );
    };

    //AGREGO MARCADORES
    $scope.addMarkers = function() {
      for (var j = 0; j < $scope.markers.length; j++) {
        var iconUrl;
        if(j === 0){
          iconUrl = 'images/carrauMarker.png';
        }else{
          switch ($scope.markers[j].client.route_client_status) {
            case 'PENDING':
              iconUrl = 'images/pendingMarker.png';
              break;
            case 'IN_TRANSIT':
              iconUrl = 'images/inTransitMarker.png';
              break;
            case 'DELIVERED':
              iconUrl = 'images/deliveredMarker.png';
              break;
            case 'NOT_DELIVERED':
              iconUrl = 'images/notDeliveredMarker.png';
              break;
          }
        }
        $scope.mapMarkers[j] = new google.maps.Marker({
          position: $scope.markers[j].marker,
          map: $scope.map,
          clickable: true,
          icon: iconUrl
        });
        $scope.showInfoWindow(j);
      }
      var truckMarker = {
        lat: $scope.route.lat,
        lng: $scope.route.long
      }
      $scope.dispatcherMarker = new google.maps.Marker({
        position: truckMarker,
        map: $scope.map,
        clickable: false,
        icon: 'images/truck.png'
      });
      $timeout(function () {
        $scope.$broadcast('setDispatcherLocation');
      },1000);
    };

    //CONSULTO UBICACION DEL TRANSPORTISTA CADA 10 SEGUNDOS
    $scope.$on('setDispatcherLocation', function (event) {
      $interval($scope.updateDispatcherMarker, 10000);
    });

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

    $rootScope.$on("calculateRoute",function(e){
        $scope.calcRoute();
    });

    $scope.redirectToHistoryRoute = function(){
  		$location.url('/historyRoute/' + $scope.id);
  	};

    $scope.refreshRoute = function(){
      var refreshData = commonServices.getAction('index_with_clients/' + $scope.id);
      refreshData.then(
        function (result) {
          $scope.markers = [];
          $scope.waypts = [];
          $scope.deleteMarkers();
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
          $scope.route = result.data;
          if($scope.route.status == 'IN_TRANSIT'){
            //Recorrido comienza con ubicación del camión
            $scope.originLocation = new google.maps.LatLng($scope.route.lat, $scope.route.long);
          }
          for (var i = 0; i < $scope.route.clients.length; i++) {
            if(i < 7 && ($scope.route.clients[i].route_client_status == 'IN_TRANSIT' || $scope.route.clients[i].route_client_status == 'PENDING')){
              $scope.waypts.push({
                  location:$scope.route.clients[i].lat + ',' + $scope.route.clients[i].long,
                  stopover:true
              });
            }
            $scope.markers.push({
                marker: {
                  lat: $scope.route.clients[i].lat,
                  lng: $scope.route.clients[i].long
                },
                client: $scope.route.clients[i]
            });
          }
          $rootScope.$broadcast("calculateRoute");
        }
      );
  	};

    $scope.deleteMarkers = function(){
      for (var i = 0; i < $scope.mapMarkers.length; i++) {
        $scope.mapMarkers[i].setMap(null);
      }
      $scope.mapMarkers = [];
  	};

  }
]);
