angular.module('seqariApp').config(['$routeProvider',
  function ($routeProvider) {

    $routeProvider = $routeProvider.when('/webUsers',
      {
        templateUrl: 'app/webUser/webUsers.html',
        controller: 'webUserCtrl',
        title: 'Gestionar usuarios web'
      }
    );

    $routeProvider = $routeProvider.when('/clients',
      {
        templateUrl: 'app/client/clients.html',
        controller: 'clientCtrl',
        title: 'Gestionar clientes'
      }
    );

    $routeProvider = $routeProvider.when('/dispatchers',
      {
        templateUrl: 'app/dispatcher/dispatchers.html',
        controller: 'dispatcherCtrl',
        title: 'Gestionar transportistas'
      }
    );

    $routeProvider = $routeProvider.when('/orders',
      {
        templateUrl: 'app/order/orders.html',
        controller: 'orderCtrl',
        title: 'Listado de pedidos'
      }
    );

    $routeProvider = $routeProvider.when('/routes',
      {
        templateUrl: 'app/route/routes.html',
        controller: 'routesCtrl',
        title: 'Listado de recorridos'
      }
    );

    $routeProvider = $routeProvider.when('/historyRoutes',
      {
        templateUrl: 'app/route/historyRoutes.html',
        controller: 'historyRoutesCtrl',
        title: 'Histórico de recorridos'
      }
    );

    $routeProvider = $routeProvider.when('/dailyReports',
      {
        templateUrl: 'app/report/dailyReports.html',
        controller: 'dailyReportCtrl',
        title: 'Reportes del día'
      }
    );

    $routeProvider = $routeProvider.when('/businessReports',
      {
        templateUrl: 'app/report/businessReports.html',
        controller: 'businessReportCtrl',
        title: 'Reportes de negocio'
      }
    );

  }
]);
