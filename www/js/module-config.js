/*
 * Global place for angular modules. First param 'starter' is the module name,
 * second param [] is what other modules are required by current one.
 */
angular.module('starter', ['ionic', 'monospaced.elastic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    
    if (window.StatusBar) {
        StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

    // Abstract State for all tabs.
    .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })

    .state('tab.addnew', {
        url: '/add-new/:newWord',
            views: {
                'tab-addnew': {
                templateUrl: 'views/add-new/addnew_tab.html',
                controller: 'AddNewCtrl'
            }
        }
    })

    .state('tab.vocabs', {
        url: '/vocabs',
            views: {
                'tab-vocabs': {
                templateUrl: 'views/vocabs/vocabs_tab.html',
                controller: 'VocabsCtrl'
            }
        }
    })

    .state('tab.vocabs-detail', {
        url: '/vocab/:wordKey',
            views: {
                'tab-vocabs': {
                templateUrl: 'views/vocabs/word_details.html',
                controller: 'WordsDetailCtrl'
            }
        }
    })

    .state('tab.review', {
        url: '/review',
            views: {
                'tab-review': {
                templateUrl: 'views/review/review_tab.html',
                controller: 'ReviewCtrl'
            }
        }
    })

    .state('tab.moment', {
        url: '/moment',
            views: {
                'tab-moment': {
                templateUrl: 'views/moment/moment_tab.html',
                controller: 'MomentCtrl'
            }
        }
    });

    // Default State
    $urlRouterProvider.otherwise('/tab/add-new/');
});