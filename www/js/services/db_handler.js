var localStorageHandler = (function(){
    var localStorage = window.localStorage;
    
    return {
        save: function(key, obj){
            var objJson = JsonUtil.toJson(obj);
            localStorage[key] = objJson;
            window.localStorage = localStorage;
        },
        
        get: function(key){
            var objJson = localStorage[key];
            if(objJson == null){
                return null;    
            }
            
            return JsonUtil.fromJson(objJson);
        }
    };  
})();


/**
 * Provides different impl. of DB handler
 * to caller.
 */
angular.module('service.db_handler', [])
.factory('DBHandler', function() {
    return {
        getHandler: function(){
            return localStorageHandler;   
        }
    };
});