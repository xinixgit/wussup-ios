/*
 * Service to manage activities in DB.
 */
angular.module('service.acti', ['service.db_handler'])
.factory('ActiService', function(DBHandler) {
    var DB_KEY_PREFIX = "acti_service_";
    var handler = DBHandler.getHandler();

    var instMap = {};

    var createInstance = function(username){
        var instance = (function(username){
            var DB_KEY = DB_KEY_PREFIX + username;
            var actiList = handler.get(DB_KEY) || [];
            var lastUpdateTimestampe = 0;

            var updateList = function(saveInDB) {
                actiList = sortActiList(actiList);
                lastUpdateTimestampe = actiList.length > 0 ? actiList[0].timestamp : 0;  
                
                if(saveInDB){
                    updateDB();
                }
            };
            
            var sortActiList = function(list){
                list.sort(function(a, b){
                    return b.timestamp - a.timestamp; 
                });
                
                return list;
            };
            
            var updateDB = function() {
                handler.save(DB_KEY, actiList);          
            };
            

            // Init list
            updateList();

            // Public API
            return {
                getList: function(){
                    return actiList;   
                },
                
                addNewActi: function(newList){
                    actiList = ArrayUtil.merge(newList, actiList);           
                    updateList(true);
                    return actiList;
                },
                
                getLastUpdateTimestamp: function(){
                    return lastUpdateTimestampe;
                },

                clearAll: function(){
                    lastUpdateTimestampe = 0;
                    actiList = [];
                    updateList(true);
                }
            }
        }(username));

        instMap[username] = instance;
        return instance;
    };

    return {
        getInstance: function(username) {
            if(!username)
                return null;

            var instance = instMap[username];
            if(!instance) {
                instance = createInstance(username);
            }

            return instance;
        }
    } 
});