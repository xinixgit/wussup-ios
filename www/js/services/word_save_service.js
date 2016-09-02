/*
 * This service provides APIs to add a new word/def pair into local db.
 */

angular.module('service.wordsave', ['service.db_handler'])
.factory('WordSaveService', function(DBHandler) {
    var DEF_SERVICE_DB_KEY = "savedWords";
    
    var handler = DBHandler.getHandler();
    var wordList = handler.get(DEF_SERVICE_DB_KEY) || [];
    
    var updateDB = function(){
        wordList = wordList || [];
        handler.save('savedWords', wordList);
    }; 
    
    return {
        addWord: function(word){
            wordList.push(word);
            updateDB();
        },
        
        removeWord: function(word2del){
            var idx = ArrayUtil.removeElement(wordList, word2del);   
            if(idx >= 0){
                updateDB();
            }
        },
        
        getList: function(){
            return wordList;   
        }
    }
});