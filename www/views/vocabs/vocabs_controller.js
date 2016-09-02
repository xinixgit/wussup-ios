angular.module('controllers.vocabs', [])

.controller('VocabsCtrl', function($scope, $rootScope, $ionicModal, $http, DefService, UserServices, WebService) {   
    var wordMap = DefService.getInstance().getWordMap();
    $scope.wordMap = wordMap;    
    $rootScope.vocabs.wordCount = MapUtil.length(wordMap);
    
    initSearchModal($scope, $ionicModal, DefService);
    initConfirmDeleteModal($scope, $ionicModal, $rootScope, $http, DefService, UserServices, WebService);
})

.controller('WordsDetailCtrl', function($scope, $state, $stateParams, $ionicPopup, $ionicModal, $http, DefService, WebService) {
    var wordKey = $stateParams.wordKey;
    $scope.wordInfo = DefService.getInstance().getWordInfo(wordKey);
    
    if($scope.wordInfo){
        var dateString = DateUtil.toDateString($scope.wordInfo.nextReviewTime);
        $scope.wordInfoExtra = {
            'nextReviewTime': dateString
        };
    } else {
        $state.go('tab.vocabs');
    }
    
    $scope.goBack = function(){
        $state.go('tab.vocabs');
    }
    
    initEditDefModal($scope, $ionicModal, $http, DefService, WebService);
});

function initEditDefModal($scope, $ionicModal, $http, DefService, WebService){
    $scope.edited = {
        def: $scope.wordInfo.def,
        example : $scope.wordInfo.example
    };
    
    $ionicModal.fromTemplateUrl('views/vocabs/modals/word_details_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.editDefModal = modal;
    });
    
    $scope.showEditDefModal = function() {
        $scope.editDefModal.show(); 
    }; 
    
    $scope.updateInfo = function(){
        if ($scope.edited.def && (($scope.edited.def != $scope.wordInfo.def)
                                    || ($scope.edited.example != $scope.wordInfo.example))) {
            $scope.wordInfo.def = $scope.edited.def;
            $scope.wordInfo.example = $scope.edited.example;
            
            DefService.getInstance().updateWordInfo($scope.wordInfo);

            // Update Def on Server.
            var postData = {
                action: 'update_def',
                info: JsonUtil.toJson($scope.wordInfo, false)
            };
            
            WebService.postSecureService($http, '/secure/activity', postData, function(data){
                if(!data.query) {
                    $scope.error.showAlertModal(data.error);
                }
            }, function(err){
                console.log(err);
            }); 
        }   

        $scope.exitModal();
    }
    
    $scope.exitModal = function(){
        $scope.editDefModal.hide();   
    }
    
    /*
     * Destroy modal when exit, so everything stays fresh!
     */
    $scope.$on('$destroy', function() {
        $scope.editDefModal.remove();
    });
};


function initSearchModal($scope, $ionicModal, DefService){
    $scope.search = {
        keyword: '',
        result: {}
    };
    
    var prev = {
        search: '',
        result: []
    };
    
    $scope.clearSearch = function(){
        $scope.search.keyword = '';   
        $scope.searchKeywordChanged();
    }
    
    $scope.searchKeywordChanged = function(){
        var filtered = {};
        var allWords = $scope.wordMap;
        var q = DefService.getInstance().getDBWordKey($scope.search.keyword);
        
        if(q.trim() == ''){
            $scope.search.result = {};
            return;
        }
        
        if(prev.search && StringUtil.startWith(q, prev.search)){
            allWords = prev.result;
        }
        
        angular.forEach(allWords, function(val, key){
            if(StringUtil.contains(key, q)){
                this[key] = val;   
            }            
        }, filtered);
        
        prev.search = q;
        prev.result = filtered;
        
        $scope.search.result = filtered;
    };
      
    $ionicModal.fromTemplateUrl('views/vocabs/modals/vocabs_search_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.searchModal = modal;
    });
    
    $scope.showSearchModal = function() {
        $scope.searchModal.show();
    }; 
    
    $scope.exitModal = function(){
        $scope.searchModal.hide();   
    }

    $scope.$on('$destroy', function() {
        $scope.searchModal.remove();
    });
};

function initConfirmDeleteModal($scope, $ionicModal, $rootScope, $http, DefService, UserServices, WebService){
    var clearDelete = function() {
        $scope.delete = {};
    };

    clearDelete();
    
    $ionicModal.fromTemplateUrl('views/vocabs/modals/confirm_delete_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.confirmDelModal = modal;
    });    
    
    $scope.removeConfirmed = function(confirmed) {
        if(confirmed && $scope.delete.word){
            DefService.getInstance().removeWord($scope.delete.wordkey);

            // Remove from server as well if user signed in
            if(UserServices.isSignedIn()){
                var postData = {
                    action: 'del_def',
                    query: $scope.delete.word,
                    query_def: $scope.delete.def
                };
                
                WebService.postSecureService($http, '/secure/activity', postData, function(data){
                    console.log(data);
                }, function(err){
                    console.log(err);
                });            
            }

            $rootScope.vocabs.wordCount = MapUtil.length($scope.wordMap);           
            clearDelete();
        }
        
        $scope.confirmDelModal.hide();  
    };
    
    $scope.confirmDelete = function(e, info) {
        e.preventDefault();
        $scope.delete.wordkey = info.wordKey;
        $scope.delete.word = info.word;
        $scope.delete.def = info.def;

        $scope.confirmDelModal.show();
    };

    $scope.$on('$destroy', function() {
        $scope.confirmDelModal.remove();
    });
};