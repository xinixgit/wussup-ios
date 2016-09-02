/*
 * This service provides APIs to add a new word/def pair into local db.
 */

angular.module('service.def', ['service.db_handler', 'service.user'])
.factory('DefService', function(DBHandler, UserServices) {
    var DB_KEY_PREFIX = "def_service_";
    var handler = DBHandler.getHandler();

    var instMap = {};

    var createInstance = function(username){
        var instance = (function(username){
            var DB_KEY = DB_KEY_PREFIX + username;
            var defObj;

            var json = handler.get(DB_KEY);
            defObj = JsonUtil.fromJson(json);
            if(!defObj || !defObj.defMap) {
                defObj = {
                    defMap: {},
                    lastSync: 0
                };
            }

            function getWordKey(word) {
                var key = StringUtil.replaceAll(word, ' ', '').toLowerCase();
                key = StringUtil.replaceAll(key, "'", "");
                
                return key;
            };

            function updateDB(){
                var json = JsonUtil.toJson(defObj);
                handler.save(DB_KEY, json);
            };   
            
            return {
                saveNewWord: function(word, def, example) {
                    var todayStr = DateUtil.newDate();
                    var wordKey = getWordKey(word);
                    
                    var info = {
                        'wordKey': wordKey,
                        'word': word,
                        'def': def,
                        'example': (example || ''),
                        'currReviewIntv': 1,
                        'nextReviewTime' : DateUtil.addDay(todayStr, 1),
                        
                        // Added Date
                        'addDate': todayStr
                    };

                    defObj.defMap[wordKey] = info;
                    updateDB();
                    
                    return info;
                },

                removeWord: function(wordKey){
                    MapUtil.removeKey(defObj.defMap, wordKey);
                    updateDB();
                },

                updateWordInfo: function(info) {
                    defObj.defMap[info.wordKey] = info;
                    updateDB();
                },

                getWordInfo: function(word) {
                    var wordKey = getWordKey(word);
                    return defObj.defMap[wordKey];
                },

                getWordMap: function(){
                    return defObj.defMap;
                },
                
                getDBWordKey: function(word){
                    return getWordKey(word);    
                },

                signOut: function(){
                    var keys = MapUtil.getKeys(defObj.defMap);

                    // This automatically updates what shows up on UI, but we don't save it in DB.
                    angular.forEach(keys, function(key, idx){
                        MapUtil.removeKey(defObj.defMap, key);
                    });
                },

                getLastSync: function(){
                    return defObj.lastSync;
                },

                setLastSync: function(syncTime) {
                    defObj.lastSync = syncTime;
                    updateDB();
                },

                isFirstSync: function(){
                    return (defObj.lastSync == 0);
                }
            }
        }(username));

        instMap[username] = instance;
        return instance;
    };

    return {
        getInstance: function() {
            var username = UserServices.getUsername() || 'sys_default';
            var instance = instMap[username];
            if(!instance) {
                instance = createInstance(username);
            }

            return instance;
        },

        signOut: function(){
            var username = UserServices.getUsername();
            var instance = instMap[username];

            if(username && instance) {
                instance.signOut();
                MapUtil.removeKey(instMap, username);
            }
        }
    } 

});