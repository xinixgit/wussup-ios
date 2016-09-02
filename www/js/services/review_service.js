angular.module('service.review', [])
.factory('ReviewServices', function(){
    var memIntv = {
        1: 2,
        2: 4,
        4: 6,
        6: 10,
        10: 15,
        15: 20,
        20: 30,
        30: 60,
        60: 120,
        120: 120
    };

    return {
        getNextIntv: function(intv) {
            var intvMapKeys = Object.keys(memIntv);        
            for(var i=0; i<intvMapKeys.length; i++){
                var key = intvMapKeys[i];
                if(key > intv){
                    return memIntv[key];
                }
            }

            return 1;
        },

        getReviewWordList: function(wordMap) {
            var reviewWordList = [];            
            var mapByDate = {};
            var timeList = [];
            var now = DateUtil.newDate();
            
            angular.forEach(wordMap, function(value, key){
                var reviewDate = value.nextReviewTime;
                var addDate = value.addDate;
                
                if(reviewDate <= now){
                    if(mapByDate[addDate] == null){
                        mapByDate[addDate] = [];
                        this.push(addDate);   
                    }
                    
                    mapByDate[addDate].push(value);
                }
                
            }, timeList);
            
            if(ArrayUtil.isEmpty(timeList)){
                return [];   
            }
            
            /*
             * Add those words from the same date togeter.
             */
            timeList.sort();
            
            for(var i=0; i<timeList.length; i++){
                var addDate = timeList[i];
                var wordListAtDate = mapByDate[addDate];
                ArrayUtil.merge(reviewWordList, wordListAtDate);   
            }

            return reviewWordList;
        }
    };
});