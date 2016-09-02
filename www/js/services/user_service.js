angular.module('service.user', ['service.db_handler'])
.factory('UserServices', function(DBHandler){
    
    var USER_DB_KEY = 'user_service';
    /*
     * Handler for DB access
     */
    var handler = DBHandler.getHandler();
    
    var userObj = handler.get(USER_DB_KEY) || {};
    
    var sync = function() {
        handler.save(USER_DB_KEY, userObj);          
    };
    
    return {        
        isSignedIn: function() {
            return (userObj && 
                        userObj.username && 
                            userObj.secureToken);            
        },
        
        setUsername: function(username) {
            userObj.username = username;
            sync();
        },
        
        getUsername: function() {
            return userObj.username;
        },
        
        setSecureToken: function(secureToken) {
            userObj.secureToken = secureToken;
            sync();
        },
        
        getSecureToken: function() {
            return userObj.secureToken;   
        },
        
        setFriendList: function(friendList) {
            userObj.friendList = friendList;
            sync();
        },
        
        getFriendList: function(){
            return (userObj.friendList || []);   
        },

        signOut: function(){
            userObj = {};
            sync();
        }
    }
    
});