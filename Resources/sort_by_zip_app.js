//include StackMob & credentials module
var credentials = require('credentials').C;
var stackmob = require('stackmob-module.min');

//create StackMob Client
var client = new stackmob.Client(credentials.STACKMOB_APP_NAME, credentials.STACKMOB_PUBLIC_KEY, credentials.STACKMOB_PRIVATE_KEY, credentials.STACKMOB_USER_OBJECT_NAME);

// this will dump out the objects I have created for this sample
client.get({
    className : 'listapi',
    success : function(data) {
        Ti.API.info('listapi ' + JSON.stringify(JSON.parse(data.text)));
    }
});

// ===============================================================
//
// Get all User(s)
//
// ===============================================================
client.get({
    className : 'user',
    params : {
        //"zip[gt]" : " "
    },
    success : function(data) {
        Ti.API.info("list user(s) " + JSON.stringify(JSON.parse(data.text)));
    },
    error : function(data) {
        Ti.API.info("list user(s) " + JSON.stringify(JSON.parse(data.text)));
    },
    "headers" : {
        "X-StackMob-OrderBy" : "zip:asc"
    }
});

if(false) {
    // ===============================================================
    //
    // POST add PHOTO and associate it to the user we just created
    //
    // ===============================================================
    var doUserCreatedSuccess = function(data) {

        var f = Ti.Filesystem.getFile("3f34141.jpg");
        var jsonData = JSON.parse(data.text);
        var params = {
            'data' : stackmob.base64FromFile(f),
            'user' : jsonData.username,
            'caption' : "test movie caption " + jsonData.username
        };
        client.create({
            className : 'photo',
            params : params,
            success : function(data) {
                Ti.API.info("create photo " + JSON.stringify(JSON.parse(data.text)));
                doPhotoDump(data);
            }
        });
    };
    // ===============================================================
    //
    // Create a User
    //
    // ===============================================================
    client.create({
        className : 'user',
        params : {
            "username" : 'aaron-' + Ti.Platform.createUUID(),
            "password" : "password"
        },
        success : function(data) {
            Ti.API.info("create user " + JSON.stringify(JSON.parse(data.text)));
            doUserCreatedSuccess(data);
        }
    });

    // ===============================================================
    //
    // Get Photo we created and expand it so show the relationship
    // between the user and the photo we created
    //
    // ===============================================================
    var doPhotoDump = function(data) {
        var jsonData = JSON.parse(data.text);
        var params = {
            _expand : '1'
        };
        client.get({
            className : 'photo',
            objectId : jsonData.photo_id,
            params : params,
            success : function(data) {
                Ti.API.info("doPhotoDump " + JSON.stringify(JSON.parse(data.text)));
            }
        });
    };
}