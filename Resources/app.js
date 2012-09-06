//include StackMob & credentials module
var credentials = require('credentials').C;
var stackmob = require('stackmob-module.min');

//create StackMob Client
var client = new stackmob.Client(credentials.STACKMOB_APP_NAME, credentials.STACKMOB_PUBLIC_KEY, credentials.STACKMOB_PRIVATE_KEY, credentials.STACKMOB_USER_OBJECT_NAME);

// Setup twitter
var twitter = new stackmob.OAuth.Twitter({
    consumerKey : credentials.TWITTER_CONSUMER_KEY,
    consumerSecret : credentials.TWITTER_CONSUMER_SECRET
});


// ===============================================================
// Get all User(s) that have a zip code value and sort results by
// the zip field ascending
// ===============================================================
client.get({
    className : 'user',
    params : {
        "zip[gt]" : " "
    },
    success : function(data) {
        // Process the users
        Ti.API.info("list user(s) " + JSON.stringify(data));
        Ti.API.info("list user(s) " + data.text);
    },
    error : function(data) {
        Ti.API.info("list user(s) error " + JSON.stringify(JSON.parse(data.text)));
    },
    "headers" : {
        "X-StackMob-OrderBy" : "zip:asc",
        "Range": "objects=0-1"
    }
});


//
// Login to twitter if not authenticated
if(twitter.signedIn() === false) {
    twitter.authenticate(//
    function() {
        alert('success: signed into twitter');
    }, function() {
        alert('fail: please try again');
    });
} else {
    Ti.API.info("twitter dump TwitterOAuthTokenKey: " + Ti.App.Properties.getString('TwitterOAuthTokenKey'));
    Ti.API.info("twitter dump TwitterOAuthTokenSecret: " + Ti.App.Properties.getString('TwitterOAuthTokenSecret'));
}

Ti.API.info("twitter dump " + JSON.stringify(twitter));
client.login({
    'username' : "aaron-B1FBD26C-89B1-49E3-B4C4-F319493324DB",
    'password' : "password",
    success : function(data) {
        Ti.API.info("login " + JSON.stringify(data));
    },
    error : function(data) {
        Ti.API.error("ERROR:login " + JSON.stringify(JSON.parse(data.text)));
    }
});

function linkUserAfterLogin() {
    client.linkUserWithTwitter({
        success : function(data) {
            Ti.API.info("linkUserWithTwitter " + JSON.stringify(JSON.parse(data.text)));
            //
            client.twitterStatusUpdate({
                "message" : "test message from clearlyinnovative #stackmob #appcelerator module " + new Date()
            });

        },
        error : function(data) {
            Ti.API.error("ERROR:linkUserWithTwitter " + JSON.stringify(JSON.parse(data.text)));
        }
    });
}

function doTheRest() {

    // ===============================================================

    // Get all User(s) near location
    // 1 Broadway, New York, NY 10004, USA, the coordinates are
    // [ -74.0140920, 40.7049475, 0 ]
    // ===============================================================
    var distance_in_radians = 200 / 3963;
    // 10 miles
    client.get({
        className : 'user',
        params : {
            "location[near]" : -74.0140920 + "," + 40.7049475 + "," + distance_in_radians //lon,lat,distance (radians)
        },
        success : function(data) {
            Ti.API.info("list user(s) " + JSON.stringify(JSON.parse(data.text)));

        },
        error : function(data) {
            Ti.API.error("ERROR " + JSON.stringify(JSON.parse(data.text)));
        },
        "headers" : {
            "X-StackMob-OrderBy" : "zip:asc"
        }
    });

    client.getNear({
        className : 'user',
        params : {
            lon : -74.0140920,
            lat : 40.7049475,
            dist : 200 / 3963 // can also do this dist_miles, and we will calc radians
        },
        success : function(data) {
            Ti.API.info("getNear " + JSON.stringify(JSON.parse(data.text)));

        },
        error : function(data) {
            Ti.API.error("ERROR: getNear " + JSON.stringify(JSON.parse(data.text)));
        },
        "headers" : {
            "X-StackMob-OrderBy" : "zip:asc"
        }
    });

    client.getWithin({
        className : 'user',
        params : {
            bottomLeft : {
                lon : -74.0140920,
                lat : 40.7049475,
            },
            topRight : {
                lon : -74.0140920,
                lat : 40.7049475,
            },
            dist : 200 / 3963 // can also do this dist_miles, and we will calc radians
        },
        success : function(data) {
            Ti.API.info("getNear " + JSON.stringify(JSON.parse(data.text)));

        },
        error : function(data) {
            Ti.API.error("ERROR: getNear " + JSON.stringify(JSON.parse(data.text)));
        },
        "headers" : {
            "X-StackMob-OrderBy" : "zip:asc"
        }
    });
}