angular.module("seqariApp").directive('accessError',
  function () {
    return {
      restrict: 'A',
      transclude: true,
      templateUrl: 'app/common/error/accessError.html'
    };
  }
);
