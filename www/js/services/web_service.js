angular.module('service.web', ['service.user'])
.factory('WebService', function(UserServices) {
    var svrAddr = SystemConfig.server.url;
    
    var sendRequest = function($http, reqContext, reqData, respCallback, errCallback, reqType) {
        var req = {
            method: reqType,
            url: (svrAddr + reqContext),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: reqData,
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            }
        };

        $http(req).success(function(respData, status, headers, config){
            respCallback(respData);
        }).error(function(error, status, headers, config){
            errCallback(error);
        });
    };

	return {        
        postRequest: function($http, reqContext, postData, respCallback, errCallback){
            sendRequest($http, reqContext, postData, respCallback, errCallback, 'POST');   
        },
        
        getRequest: function($http, reqContext, respCallback, errCallback){
            sendRequest($http, reqContext, {}, respCallback, errCallback, 'GET');   
        },
        
        postSecureService: function($http, reqContext, postData, respCallback, errCallback) {
            var username = UserServices.getUsername();
            var secureToken = UserServices.getSecureToken();
            
            postData.username = username;
            postData.secure_token = secureToken;
            
            sendRequest($http, reqContext, postData, respCallback, errCallback, 'POST');
        },
        
        getSecureService: function($http, reqContext, respCallback, errCallback){
            var username = UserServices.getUsername();
            var secureToken = UserServices.getSecureToken();
            
            reqContext += '&username=' + username + '&secure_token=' + secureToken;
            sendRequest($http, reqContext, {}, respCallback, errCallback, 'GET');   
        }
    };
});