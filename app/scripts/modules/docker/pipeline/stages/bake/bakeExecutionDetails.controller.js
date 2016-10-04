'use strict';

import detailsSectionModule from '../../../../core/delivery/details/executionDetailsSection.service';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.bake.docker.executionDetails.controller', [
  require('angular-ui-router'),
  detailsSectionModule,
  require('../../../../core/delivery/details/executionDetailsSectionNav.directive.js'),
])
  .controller('dockerBakeExecutionDetailsCtrl', function ($scope, $stateParams, executionDetailsSectionService,
                                                          $interpolate, settings) {

    $scope.configSections = ['bakeConfig', 'taskStatus'];

    let initialized = () => {
      $scope.detailsSection = $stateParams.details;
      $scope.provider = $scope.stage.context.cloudProviderType || 'docker';
      $scope.bakeryDetailUrl = $interpolate(settings.bakeryDetailUrl);
    };

    let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

    initialize();

    $scope.$on('$stateChangeSuccess', initialize);

  });
