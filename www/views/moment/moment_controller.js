angular.module('controllers.moment', [])
.controller('MomentCtrl', function($scope, $ionicModal, $state, $http, UserServices, WebService, ActiService, DefService) {
    $scope.auth = {};
    $scope.settings = {};
    $scope.follow = {};
    $scope.following = {};
    
    initAuthenModal($scope, $ionicModal, $state, $http, UserServices, WebService, ActiService, DefService);
    initSettingsModal($scope, $ionicModal);
    initFollowModal($scope, $ionicModal, $http, UserServices, WebService);
    initFollowingModal($scope, $ionicModal, $http, UserServices, WebService);

    $scope.showSettings = function(){
        $scope.settings.showModal();
    }

    $scope.addWord = function(word) {
        $state.go('tab.addnew', {newWord:word});
        return;
    }

    var signOutUser = function(){
        DefService.signOut();
        UserServices.signOut();
    }

    $scope.signOut = function(){
        var callback = function(){
            var url = '/user?action=signout&username=' + UserServices.getUsername();
            WebService.getRequest($http, url, function(data){
                if(data.username != null){
                    signOutUser();

                    $scope.settings.hideModal();
                    $state.go('tab.addnew');
                }
            }, function(err){
                console.log(err); 
            });
        };

        // Sync Def before signout.
        syncDef($http, DefService, WebService, callback); 
    }
});

function initFollowModal($scope, $ionicModal, $http, UserServices, WebService){
    $ionicModal.fromTemplateUrl('views/moment/modals/follow_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.follow.modal = modal;
    });    
    
    $scope.follow.hideModal = function() {
        clearContent();
        $scope.follow.modal.hide();  
    };
    
    $scope.follow.showModal = function() {
        $scope.follow.modal.show();
    };

    $scope.$on('$destroy', function() {
        $scope.follow.modal.remove();
    });
    
    // CUSTOMIZED METHODS
    $scope.follow.findUser = function(){
        $scope.follow.userList = [];
        
        var searchedUser = $scope.follow.searchedUser;
        if(!searchedUser){
            return;
        }
        
        WebService.getRequest($http, '/user?action=search_user&name=' + searchedUser, function(data){           
            if(data && data.username){
                var user = {
                    isFriend: false,
                    username: data.username
                };
                
                var friendList = UserServices.getFriendList();
                user.isFriend = ArrayUtil.hasElement(friendList, user.username);
                $scope.follow.userList = [user];   
            }
        }, function(err){
            console.log(err);  
        }); 
    };
    
    $scope.follow.followUser = function(username){
        var postData = {
            action: 'follow_user',
            friend_name: username
        };
        
        WebService.postSecureService($http, '/secure/activity', postData, function(data){
            if(data && data.friend_name){
                var frdList = UserServices.getFriendList();
                frdList.push(data.friend_name);
                UserServices.setFriendList(frdList);
                
                $scope.follow.hideModal();   
                $scope.following.showModal();
            }
            
        }, function(err){
            console.log(err);
        });
    };
    
    var clearContent = function(){
        $scope.follow.userList = [];
        $scope.follow.searchedUser = '';
    };
};

function initFollowingModal($scope, $ionicModal, $http, UserServices, WebService){
    $ionicModal.fromTemplateUrl('views/moment/modals/following_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.following.modal = modal;
    });    
    
    $scope.following.hideModal = function() {
        $scope.following.modal.hide();  
    };
    
    $scope.following.showModal = function() {
        $scope.following.modal.show();
    };

    $scope.$on('$destroy', function() {
        $scope.following.modal.remove();
    });

    // CUSTOMIZED METHODS
    $scope.following.unfollow = function(username){
        var postData = {
            action: 'unfollow_user',
            friend_name: username
        };
        
        WebService.postSecureService($http, '/secure/activity', postData, function(data){
            if(data && data.error){
                $scope.error.showAlertModal(data.error);
            }
        }, function(err){
            console.log(err);
        });
        
        var frdList = $scope.following.followingList;
        ArrayUtil.removeElement(frdList, username);               
        
        $scope.following.followingList = frdList;
        UserServices.setFriendList(frdList);
    };

    // Update currently following list.
    $scope.following.followingList = UserServices.getFriendList();
};

function initSettingsModal($scope, $ionicModal){
    $ionicModal.fromTemplateUrl('views/moment/modals/settings_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.settings.modal = modal;
    });    
    
    $scope.settings.hideModal = function() {
        $scope.settings.modal.hide();  
    };
    
    $scope.settings.showModal = function() {
        $scope.settings.modal.show();
    };

    $scope.$on('$destroy', function() {
        $scope.settings.modal.remove();
    });
};

function initAuthenModal($scope, $ionicModal, $state, $http, UserServices, WebService, ActiService, DefService) {
    $ionicModal.fromTemplateUrl('views/moment/modals/authen_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.authenModal = modal;
        
        // Show the modal if user's not signed in
        if(!UserServices.isSignedIn()){
            $scope.authenModal.show();
        } else {
            // Still check if user's logged out on server side (like from a different place)
            var username = UserServices.getUsername();            
            var reqContext = '/secure/user?action=search_user&name=' + username;
            
            WebService.getSecureService($http, reqContext, function(data){
                if(data.error && (data.error == "Access denied.")){
                    $scope.authenModal.show();
                    return;
                }
                
                /*
                 * Display activity updates when page is brought up 
                 * and user signed in.
                 */
                displayUpdate(username);
            }, function(error){
                $scope.error.showAlertModal("Network not available at this moment.");
            });
        }
    });
    
    // 
    $scope.exitAuthenModal = function(signedIn){
        $scope.authenModal.hide();   
        if(!signedIn){
            $state.go('tab.addnew');   
        }
    };
    
    /*
     * Customized functions
     */
    $scope.auth.usernameChanged = function(){
        $scope.auth.disableInput = false;   
    }
    
    // Display update for user.
    var displayUpdate = function(username){
        var since = ActiService.getInstance(username).getLastUpdateTimestamp();
        var reqContext = '/secure/activity?action=sync&since=' + since;
        
        WebService.getSecureService($http, reqContext, function(data){
            if(data.error){
                $scope.error.showAlertModal(data.error);
                return;
            }
            
            var newActiList = data.activity_list || [];
            var actiList = ActiService.getInstance(username).addNewActi(newActiList);
            $scope.actiList = actiList;
            
        }, function(err){
            console.log(err);
        });
    };
    
    var saveUserInfo = function(data){
        UserServices.setUsername(data.username);
        UserServices.setSecureToken(data.secure_token);
        UserServices.setFriendList(data.friend_list);
        
        $scope.following.followingList = data.friend_list;
    };
    
    // SIGN IN
    $scope.auth.signIn = function() {
        var username = $scope.auth.username;
        var password = $scope.auth.password;
        
        // Sign the user in
        reqParms = '/user';
        var reqData = {
            action: 'signin',
            username: username,
            password: password
        };
        
        WebService.postRequest($http, reqParms, reqData, function(data){
            if(!data || data.error){
                $scope.error.showAlertModal(data.error);
                return;
            }
            
            saveUserInfo(data);

            if(UserServices.isSignedIn()){
                $scope.exitAuthenModal(true);
            } else {
                $scope.error.showAlertModal("SignIn didn't quite work, please try again.");
                return;
            }
            
            // Sync def after signed in.
            syncDef($http, DefService, WebService);

            var username = UserServices.getUsername();
            displayUpdate(username);
            
        }, function(error){
            console.log(error);
            $scope.error.showAlertModal("The server didn't answer our call, please try again later.");
        });
            
    };
    
    // REGISTER
    $scope.auth.register = function() {
        var username = $scope.auth.username;
        var password = $scope.auth.password;
        
        // Check if user already exists
        var reqParams = '/user?action=search_user&name=' + username;
        WebService.getRequest($http, reqParams, function(data){
            // Username exists
            if(data.username) {
                $scope.error.showAlertModal('Sorry, "' + username + '" has already been taken.');               
                $scope.auth.disableInput = true;
                return;               
            }
            
            registerUser(username, password, function(){
                // If registration successful, display moment updates
                if(UserServices.isSignedIn()){
                    $scope.exitAuthenModal(true);
                } else {
                    $scope.error.showAlertModal("Registration had some error, please try again.");
                    return;
                }
                
                displayUpdate(username);
            });  
            
        }, function(error){
            console.log(error);
            $scope.error.showAlertModal("The server didn't answer our call, please try again.");
        }); 
    };
    
    var registerUser = function(username, password, callback) {
        var postData = {
            action: 'register',
            username: username,
            password: password
        };
        
        WebService.postRequest($http, '/user', postData, function(data){
            saveUserInfo(data);
            callback();

        }, function(error){
            console.log(error);
            $scope.error.showAlertModal("The server didn't answer our call, please try again.");
        });
    };
};

/*
 * Sync Def and init callback func after done.
 */
function syncDef($http, DefService, WebService, callback) {
    var wordMap = DefService.getInstance().getWordMap();
    var lastSyncTime = DefService.getInstance().getLastSync();

    var syncObj = {
        def_sync_map: wordMap,
        def_last_sync_time: lastSyncTime
    };

    var postData = {
        action: 'sync_all_def',
        def_sync_obj: JsonUtil.toJson(syncObj)
    };

    WebService.postSecureService($http, '/secure/activity', postData, function(data){
        var syncObj = data.def_sync_obj;
        var dbDefMap = syncObj.def_sync_map;
        var currSyncTime = syncObj.def_curr_sync_time;

        DefService.getInstance().setLastSync(currSyncTime);

        if(dbDefMap && MapUtil.length(dbDefMap) > 0) {
            var wordMap = DefService.getInstance().getWordMap();
            angular.forEach(dbDefMap, function(defObj, wordKey) {
                wordMap[wordKey] = defObj;
            });
        }

        if(callback) {
            callback();
        }

    }, function(err){
        console.log(err);
    });
};