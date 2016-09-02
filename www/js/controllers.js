/**
 * index.html controllers are implemented here.
 */
angular.module('starter.controllers', ['starter.services', 'controllers.addnew', 'controllers.vocabs', 'controllers.review', 'controllers.moment'])



/*
 * OverlordController which controls everything living
 * in this universe.
 */
.controller('OverlordController', function($scope, $rootScope, $ionicModal, $ionicPlatform, ActiService){
    $rootScope.vocabs = {
        wordCount: 0  
    };
    
    // Error Message Alert Modal
    $scope.error = {};
    initAlertModal($scope, $ionicModal);
    
    // Setup review notification
    $ionicPlatform.ready(function() {
        if (window.cordova) {
            document.addEventListener("deviceready", function() {
                window.plugin.notification.local.onadd = app.onReminderAdd;
            }, false);
            
            alert('device ready');
        }
    });
});

function initAlertModal($scope, $ionicModal){
    $scope.error.msg = '';
    
    $ionicModal.fromTemplateUrl('templates/alert_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.error.alertModal = modal;
    });    
    
    $scope.error.hideAlertModal = function() {
        $scope.error.alertModal.hide();  
    };
    
    $scope.error.showAlertModal = function(errMsg) {
        $scope.error.msg = errMsg;
        $scope.error.alertModal.show();
    };

    $scope.$on('$destroy', function() {
        $scope.error.alertModal.remove();
    });
};