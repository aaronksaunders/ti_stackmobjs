Ti.include('jsOAuth-1.3.1.min.js');
var oauth, options;
options = {
    consumerKey : 'HELP!!!', //replace this with your public
    consumerSecret : 'HELP!!!' //replace this with your private key
};
oauth = OAuth(options);


/*
//getting a list of what's available in my API
oauth.get('http://stackmob.mob1.stackmob.com/api/0/people_interact/listapi', function(data) {
    Ti.API.debug(JSON.stringify(data));
    //i'm using the chrome console to view the output
});
//GET list of user(s)
oauth.request({
    method : 'GET',
    headers : {
        'Content-Type' : 'application/json'
    },
    url : 'http://stackmob.mob1.stackmob.com/api/0/people_interact/user',
    data : '{}',
    success : function(data) {
        Ti.API.debug(data);
    },
    failure : function(data) {
        Ti.API.error('fail ' + data);
    }
});

//GET one user
var params = {
    username : 'aaron2@clearlyinnovative.com'
};
oauth.request({
    'method' : 'GET',
    'url' : 'http://stackmob.mob1.stackmob.com/api/0/people_interact/user',
    'data' : params,
    'success' : function(data) {
        Ti.API.debug(data);
    }, //again, using chrome
    'failure' : function(data) {
        Ti.API.error('fail ' + data);
    }
});

//POST add user
var params = {
    'username' : 'aaron3@clearlyinnovative.com',
    'password' : 'password'
};
oauth.request({
    'method' : 'POST',
    'headers' : {
        'Content-Type' : 'application/json'
    },
    'url' : 'http://stackmob.mob1.stackmob.com/api/0/people_interact/user',
    'data' : JSON.stringify(params),
    'success' : function(data) {
        Ti.API.debug(data);
    }, //again, using chrome
    'failure' : function(data) {
        Ti.API.error('fail: adduser ' + JSON.stringify(data));
    }
});

*/

//POST add PHOTO
var utils = require('com.clearlyinnovative.utils');
var f = Ti.Filesystem.getFile("3f34141.jpg");
var params = {
    'data' : "Content-Type: image/*\nContent-Transfer-Encoding: base64\n\n" + utils.base64encode(f.read())
};
oauth.request({
    'method' : 'POST',
    'headers' : {
        'Content-Type' : 'application/json'
    },
    'url' : 'http://stackmob.mob1.stackmob.com/api/0/people_interact/photo',
    'data' : JSON.stringify(params),
    'success' : function(data) {
        Ti.API.debug(data);
    }, //again, using chrome
    'failure' : function(data) {
        Ti.API.error('fail: add photo ' + JSON.stringify(data));
    }
});


