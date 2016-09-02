var Util = {
    isEmpty: function(obj){
        if(!obj)
            return true;
        
        if(obj.length){
            return obj.length == 0;   
        }
        
        var keys = Object.keys(obj);
        return (!keys || keys.length == 0);
    },
    
    isEmptyString: function(str){
        return (!str || Util.isEmpty(str.trim()));        
    },
    
    // growHeight: function(elemId, minHeight){
    //     var elem = document.getElementById(elemId);  
        
    //     elem.style.height = '1px';
    //     var scrollHeight = elem.scrollHeight;
    //     var adjust2Height = scrollHeight + 2;
        
    //     if(minHeight && (adjust2Height < minHeight)){
    //         adjust2Height = minHeight;   
    //     }
        
    //     elem.style.height = adjust2Height + 'px';
    // }
};


/*
 * JSON UTIL, WHICH REQUIRES ANGULAR LIB
 */
var JsonUtil = (function(){
	var getAngular = function(){
		if(typeof angular == 'undefined') {
			console.error('JsonUtil requires AngularJS lib.');
			return null;
		}

		return angular;
	};

	return {
		toJson: function(obj, pretty) {
			return getAngular().toJson(obj, pretty);
		},

		fromJson: function(json) {
			return getAngular().fromJson(json);
		}
	}
})();


var DateUtil = (function(){
    var toFullNumber = function(num){
        if(num >= 10)
            return num;
        
        return ('0' + num);
    };
    
    var date2String = function(dateObj){
        var yr = dateObj.getFullYear();
        var mth = dateObj.getMonth() + 1;
        var dt = dateObj.getDate();

        return ('' + yr + toFullNumber(mth) + toFullNumber(dt));
    };
    
    var string2Date = function(dateStr){
        var yr = dateStr.substring(0, 4);
        var mth = dateStr.substring(4, 6);
        var dt = dateStr.substring(6, 8);
        
        return new Date(yr, mth-1, dt, 0, 0, 0, 0);
    };

	return {
		newDate: function(){
			return date2String(new Date());
    	},

    	addDay: function(dateStr, day) {
      		if(day == 0)
        	   return date;

            var date = string2Date(dateStr);
      		date.setTime(date.getTime() + day * 86400000);
      		return date2String(date);
    	},
        
        toDateString: function(dateStr){
            return (dateStr.substring(4, 6) + '/' + dateStr.substring(6, 8) + '/' + dateStr.substring(0, 4));   
        },
        
        toFullString: function(dateStr){
            return string2Date(dateStr).toString();   
        },
        
        ms2DateStr: function(millis){
            var milInt = parseInt(millis);
            return date2String(new Date(milInt));
        }
	};
})();

var StringUtil = (function(){
	var escapeRegExp = function(str){
		return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	};

	return {
		replaceAll: function(str, find, replace){
			return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
		},
        
        startWith: function(str, s){
            return str.indexOf(s) == 0;   
        },
        
        contains: function(s1, s2){
            return (s1.indexOf(s2) >= 0);   
        }
	};
})();


// UTILS FOR ALL COMMON JAVASCRIPT FUNCTIONS
var ArrayUtil = {
	appendToArray: function(arr, elem) {
		arr.push(elem);
	},

	insertToIdx: function(arr, elem, idx) {
		arr.splice(idx, 0, elem);	
	},

	removeIdx: function(arr, idx) {
		return arr.splice(idx, 1)[0];
	},
        
    removeFirst: function(arr){
        return ArrayUtil.removeIdx(arr, 0);
    },
        
    removeLast: function(arr){
        return ArrayUtil.removeIdx(arr, arr.length-1);   
    },
    
    makeCopy: function(arr){
        return arr.slice(0);  
    },
    
    shuffle: function(arr){
        var rtn = ArrayUtil.makeCopy(arr);
        var ctr = arr.length;
        var tmp, idx;
        
        while(ctr > 0){
            idx = Math.floor(Math.random() * ctr);
            ctr--;
            
            var tmp = rtn[ctr];
            rtn[ctr] = rtn[idx];
            rtn[idx] = tmp;
        }
        
        return rtn;
    },
    
    hasElement: function(arr, elem){
        return (arr && arr.indexOf(elem) >= 0);   
    },
    
    removeElement: function(arr, elem){
        if(arr){
            var idx = arr.indexOf(elem);
            if(idx >= 0){
                ArrayUtil.removeIdx(arr, idx); 
                return idx;
            }
        }
        
        return -1;
    },
    
    merge: function(arr1, arr2){
        for(var i=0; i<arr2.length; i++){
            var elem = arr2[i];
            arr1.push(elem);
        }
        
        return arr1;
    },
    
    isEmpty: function(arr){
        return (!arr || arr.length == 0);   
    }
};

var MapUtil = {
	getKeys: function(map) {
		return Object.keys(map)
	},

	removeKey: function(map, key) {
		delete map[key];
	},

	length: function(map) {
		return MapUtil.getKeys(map).length;
	},

	// You can use "for (var k in map)..." directly to iterate map object.
	toMapEntryArray: function(map) {
		var mapEntrys = [];
		for(var key in map) {
			var value = map[key];
			mapEntrys.push({
				'key': key,
				'val': value 
			});
		}

		return mapEntrys;
	}
};

var Iterator = function(array, oldIter) {
	var arrayIter;

	if(oldIter) {
		arrayIter = oldIter;
	} else {
		arrayIter = (function(){
			var arr = [];
			var currIdx = -1;

			var init = function(array){
				arr = array;
				currIdx = -1;
			};

			var hasNextInternal = function(){
				return (currIdx + 1) < arr.length;
			};

			var getNextInternal = function(){
				currIdx++;
				if(currIdx >= arr.length) {
					return null;
				}

				return arr[currIdx];
			};

			return {
				create: function(arr) {
					init(arr);
				},

				hasNext: function(){
					return hasNextInternal();
				},

				next: function(){
					return getNextInternal();
				}
			}
		})();
	}

	arrayIter.create(array);
	return arrayIter;
};

var FileUtil = {
    fileApiSupported: function(window){
        return (window.File && window.FileReader && window.FileList && window.Blob);
    },
    
    readFile: function(fileLoc){
        var request = new XMLHttpRequest();
		request.open("GET", fileLoc, false);
		request.send(null);
		var fileText = request.responseText;

		return fileText;
    }   
};