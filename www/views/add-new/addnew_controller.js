var AddNewCtrlUtil = {
    makePhrase: function(phrase){
        phrase = phrase.trim().toLowerCase();
        if(Util.isEmptyString(phrase)){
            return phrase;
        }
        
        if(!StringUtil.contains(phrase, ' ')){
            return phrase.charAt(0).toUpperCase() + phrase.slice(1);
        }
        
        var newPhrase = '';
        var words = phrase.split(' ');
        
        for(var i=0; i<words.length; i++){
            var wd = words[i];
            if(!Util.isEmptyString(wd)){
                newPhrase += wd.charAt(0).toUpperCase() + wd.slice(1);
                if(i < words.length - 1) {
                    newPhrase += ' ';
                }                   
            }
        }   

        return newPhrase;
    },
    
    getScopeSearchObject: function(){
        return {
                word: '',   
                def: '',
                example: '',
                existingInfo: null,
                existingInfoServer: null,
                error: ''
            };   
    }
};

angular.module('controllers.addnew', [])
.controller('AddNewCtrl', function($scope, $rootScope, $state, $stateParams, $ionicModal, $http, DefService, WordSaveService, WebService, UserServices) {
    $scope.search = AddNewCtrlUtil.getScopeSearchObject();
    $scope.search.word = $stateParams.newWord;
    
    var resetSearchFields = function(){
        $scope.search = {};
    };

    $scope.addNewDef = function(){
        var newWord = AddNewCtrlUtil.makePhrase($scope.search.word);
        var def = $scope.search.def;
        if(Util.isEmpty(newWord) || Util.isEmpty(def)){
            $scope.error.showAlertModal('Word or Definition is empty!');
            return;
        }        
        
        /*
         * Check if word is not already in user's vocab.
         */
        $scope.search.existingInfo = DefService.getInstance().getWordInfo(newWord);     

        if($scope.search.existingInfo){
            $scope.error.showAlertModal('Word already exists in your vocabulary!');
            return;
        }
        
        var example = $scope.search.example;        
        var info = DefService.getInstance().saveNewWord(newWord, def, example);      
        resetSearchFields();
        
        /*
         *  Generate new activity event.
         */
        if(UserServices.isSignedIn()){
            var postData = {
                action: 'add_def',
                info: JsonUtil.toJson(info, false)
            };
            
            WebService.postSecureService($http, '/secure/activity', postData, function(data){
                console.log(data);
            }, function(err){
                console.log(err);
            });            
        }
        

        $rootScope.vocabs.wordCount += 1;
        $state.go('tab.vocabs-detail', {wordKey:info.wordKey});
    };
    
    /*
     * We don't check word input continuously anymore, since
     * it may disrupt user from what he's doing, if he has a
     * term in vocab that is a substring of what he wants to
     * enter.
     */
    $scope.searchWordChanged = function(){
        $scope.search.existingInfo = false;
    };
    
    initSaveWordModal($scope, $ionicModal, WordSaveService);   
    initSearchDefModal($scope, $ionicModal, $http, DefService, WebService);
});

/*
 * All definitions for Save Word Modal
 */
function initSaveWordModal($scope, $ionicModal, WordSaveService) {
    $ionicModal.fromTemplateUrl('views/add-new/modals/saved_word_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.savedWordModal = modal;
    });
    
    $scope.showSavedWordModal = function() {
        $scope.savedWordModal.show();
    };
    
    $scope.exitModal = function(){
        $scope.savedWordModal.hide();   
    };
    
    $scope.sw = {
        savedWordList: WordSaveService.getList()         
    };
    
    $scope.saveWord = function() {
        var word = AddNewCtrlUtil.makePhrase($scope.search.word);
        if(Util.isEmpty(word)){
            $scope.search.error = 'Word is empty!';
            return;
        } 
        
        if(!ArrayUtil.hasElement($scope.sw.savedWordList, word)){
            WordSaveService.addWord(word);
            // This automatically syncs with $scope.sw.wordList
        }

        $scope.search = AddNewCtrlUtil.getScopeSearchObject();    
    };
    
    $scope.savedWordClicked = function(savedWord){
        $scope.search.word = savedWord;
        WordSaveService.removeWord(savedWord);

        $scope.exitModal();
    };       

    $scope.removeSavedWord = function(flashWord) {
        WordSaveService.removeWord(flashWord);
    };
};


/*
 * All definition for Search Def Modal
 */
function initSearchDefModal($scope, $ionicModal, $http, DefService, WebService) {
    $scope.defsearch = {};
    
    $ionicModal.fromTemplateUrl('views/add-new/modals/search_def_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.searchDefModal = modal;
    });
    
    $scope.showSearchDefModal = function() {
        $scope.searchDefModal.show();
    };
    
    $scope.exitSearchDefModal = function(){
        $scope.searchDefModal.hide();   
    };
    
    $scope.defsearch.searchKeywordChanged = function(){
        
    };
    
    $scope.defsearch.clearSearch = function() {
        $scope.search.word = '';  
    };   
    
    $scope.defsearch.query = function(){
        clearResult();
        
        var newWord = AddNewCtrlUtil.makePhrase($scope.search.word);
        
        /*
         * Check if this word already exists.
         */
        var wordExist = DefService.getInstance().getWordInfo(newWord);               
        if(wordExist){
            $scope.exitSearchDefModal();
            $scope.error.showAlertModal('Word already exists in your vocabulary!');
            return;
        }
        
        WebService
            .getRequest(
            $http, 
            "/search?query=" + newWord,
            function(data){
                if(data && data.def){
                    $scope.defsearch.deflist = data.def;
                } else {
                    $scope.error.showAlertModal('Sorry, not able to find definition for word "' + newWord + '".');
                }
            },
            function(err){
                console.log(err);
                $scope.error.showAlertModal('Failed to search for definition of word "' + newWord + '".');
            }
        );
    };
    
    $scope.defsearch.addNew = function(def){
        $scope.search.def = def;
        clearResult();
        
        $scope.exitSearchDefModal();
        $scope.addNewDef();
    };
    
    var clearResult = function() {
        $scope.defsearch.deflist = [];       
    }
}




/*
 * This modal is for debug purposes only.
 */
function initDebugModal($scope, $ionicModal, DefServices){
    $ionicModal.fromTemplateUrl('views/add-new/modals/debug_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.debugModal = modal;
    });
    
    $scope.showDebugModal = function() {
        $scope.debugModal.show();
//        executeFix();
    };
    
    $scope.exitDebugModal = function(){
        $scope.debugModal.hide();   
    }

    $scope.$on('$destroy', function() {
        $scope.debugModal.remove();
    });    

    $scope.debug = {
        currentDate: DateUtil.newDate(),
        wordMap: {} 
    }
    
    var executeFix = function(){
        var wordMap = DefServices.getInstance().getWordMap();
        
        angular.forEach(wordMap, function(val, key){
            var reviewDate = val.nextReviewTime;
            var addDate = val.addDate;
            
            if((reviewDate.length > 8 || reviewDate > 20151231) && 
                (addDate.length > 8 || addDate > 20151231)){
                val.nextReviewTime = DateUtil.ms2DateStr(reviewDate);
                val.addDate = DateUtil.ms2DateStr(addDate);
                DefServices.getInstance().updateWordInfo(val);     
            }
            
            $scope.debug.wordMap[key] = val;
        }, []);        
    }
};