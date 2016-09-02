angular.module('controllers.review', [])
.controller('ReviewCtrl', function($scope, $ionicModal, DefService, ReviewServices, UserServices) {
    $scope.viewControl = {
        defButtonVisible: false,
        noReviewVisible: false,
        defVisible: false,
        disableShowDefButton: false,
        wordCount: 0
    };
    
    var updateWordInfo = function(info){
        var nextIntv = ReviewServices.getNextIntv(info.currReviewIntv);
        info.currReviewIntv = nextIntv;
        
        var nextReviewTime = DateUtil.addDay(DateUtil.newDate(), nextIntv);
        info.nextReviewTime = nextReviewTime;
  
        DefService.getInstance().updateWordInfo(info);        
    };
    
    var wordMap = DefService.getInstance().getWordMap();
    var reviewWordList = ReviewServices.getReviewWordList(wordMap);
    
    $scope.getNextReviewedWord = function(passed){
        var currInfo = $scope.info;
        if(currInfo){
            ArrayUtil.removeFirst(reviewWordList);
            
            if(passed){
                updateWordInfo(currInfo);   
            } else {
                reviewWordList.push(currInfo);
            }
        }

        $scope.viewControl.wordCount = reviewWordList.length; 
        
        if(!reviewWordList || reviewWordList.length == 0) {
            $scope.viewControl.noReviewVisible = true;
            $scope.viewControl.defButtonVisible = false;
            $scope.viewControl.defVisible = false;
            $scope.viewControl.wordCount = 0;

            $scope.info = null;
            return;
        }
 
        $scope.info = reviewWordList[0];        
        $scope.viewControl.defButtonVisible = true;
        $scope.viewControl.defVisible = false;
        $scope.viewControl.disableShowDefButton = false;
    };
    
    $scope.showDefinition = function(){
        $scope.viewControl.defButtonVisible = false;
        $scope.viewControl.defVisible = true;
    }
    
    // Call to get first word
    $scope.getNextReviewedWord();
});