angular.module('seqariApp').controller('mapCtrl', ['$scope', 'commonServices', function ($scope, commonServices) {

    //ARRAY DE CIUDADES A MOSTRAR
    $scope.cities = [
        {
            city : 'Montevideo',
            desc : 'La gran capital',
            lat : -34.890497,
            long : -56.114054
        },
        {
            city : 'Sarandí del Yí',
            desc : 'Pueblo con vacas y ovejas',
            lat : -33.338080,
            long : -55.630668
        },
        {
            city : 'Villa Serrana',
            desc : 'Traigan alfajores',
            lat : -34.320921,
            long : -54.985759
        }
    ];

    $scope.waypts = [];
    $scope.waypts.push({
        location:"-34.320921,-54.985759",
        stopover:true
    });

    //$scope.bounds = new google.maps.LatLngBounds();
    //$scope.markers = [];
    //$scope.infoWindow = new google.maps.InfoWindow();
    $scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: false});

    //OBJETOS DE ORIGEN Y DESTINO
    $scope.origin = new google.maps.LatLng($scope.cities[0].lat, $scope.cities[0].long);
    $scope.destination = new google.maps.LatLng($scope.cities[1].lat, $scope.cities[1].long);
    $scope.destination1 = new google.maps.LatLng($scope.cities[2].lat, $scope.cities[2].long);
    $scope.destinationIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=D|FF0000|000000';
    $scope.originIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=O|FFFF00|000000';
    //$scope.geocoder = new google.maps.Geocoder();

    //OPCIONES DEL MAPA
    $scope.mapOptions = {
        center: new google.maps.LatLng(-33.8887456, -55.8683931),
        zoom: 7,
        scaleControl: true,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };


    function initialize() {
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
        zoom: 8,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),
            myOptions);
}
google.maps.event.addDomListener(window, "load", initialize);

//    $scope.map = new google.maps.Map(document.getElementById('map'), $scope.mapOptions);
//    $scope.directionsDisplay.setMap($scope.map);

    //FUNCION PARA CALCULAR LA RUTA ENTRE CIUDADES
    $scope.calcRoute = function(){
        var request = {
            origin:$scope.origin,
            destination:$scope.destination,
            optimizeWaypoints:true,
            waypoints: $scope.waypts,
            travelMode: google.maps.TravelMode.DRIVING
        };
        $scope.directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                $scope.directionsDisplay.setDirections(response);
            }
        });
    };

    //FUNCION PARA CALCULAR DISTANCIAS ENTRE CIUDADES
    $scope.calculateDistances = function(){
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [$scope.origin],
            destinations: [$scope.destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, callback);
    };

    function callback(response, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
            alert('Error was: ' + status);
        } else {
            var origins = response.originAddresses;
            var destinations = response.destinationAddresses;
            var outputDiv = document.getElementById('outputDiv');
            outputDiv.innerHTML = '';
            $scope.deleteOverlays();

            for (var i = 0; i < origins.length; i++) {
                var results = response.rows[i].elements;
                //$scope.addMarker(origins[i], false, $scope.cities[0]);
                for (var j = 0; j < results.length; j++) {
                    //$scope.addMarker(destinations[j], true, $scope.cities[1]);
                    outputDiv.innerHTML += '<b>ORIGEN: </b>' + origins[i] + ' | <b>DESTINO: </b>' + destinations[j] +
                    ' | <b>DISTANCIA: </b>' + results[j].distance.text + ' | <b>TIEMPO ESTIMADO: </b>' + results[j].duration.text;
                }
            }
        }
    }

    //AGREGAR UN MARCADOR DETERMINADO EN EL MAPA
    /*$scope.addMarker = function(location, isDestination, info){
        var icon;
        if (isDestination) {
            icon = $scope.destinationIcon;
        } else {
            icon = $scope.originIcon;
        }
        $scope.geocoder.geocode({'address': location}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                $scope.bounds.extend(results[0].geometry.location);
                $scope.map.fitBounds($scope.bounds);
                var marker = new google.maps.Marker({
                    map: $scope.map,
                    position: results[0].geometry.location,
                    title: info.city,
                    icon: icon
                });

                //CONTENIDO DE LOS MARCADORES AL HACERLE CLICK
                marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';

                google.maps.event.addListener(marker, 'click', function(){
                    $scope.infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                    $scope.infoWindow.open($scope.map, marker);
                });

                $scope.markers.push(marker);

            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    };*/

    //BORRA LOS MARCADORES
    $scope.deleteOverlays = function(){
        for (var i = 0; i < $scope.markers.length; i++) {
            $scope.markers[i].setMap(null);
        }
        $scope.markers = [];
    };

    //ABRE LOS CUADROS EN CADA MARCADOR
    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    };

    //CALCULO DISTANCIAS DESDE UN INICIO
    $scope.calculateDistances();
    $scope.calcRoute();

}]);
