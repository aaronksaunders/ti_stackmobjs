//include StackMob & credentials module
var credentials = require('credentials').C;
var stackmob = require('stackmob-module');

//create StackMob Client
var client = new stackmob.Client(credentials.STACKMOB_APP_NAME, credentials.STACKMOB_PUBLIC_KEY, credentials.STACKMOB_PRIVATE_KEY, credentials.STACKMOB_USER_OBJECT_NAME);

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
        var users_array = JSON.parse(data.text);

        // this will iterate through the objects and set
        // the appropriate coordinates for geo location
        processQ(users_array, forwardGeocode);
    },
    error : function(data) {
        Ti.API.info("list user(s) " + JSON.stringify(JSON.parse(data.text)));
    },
    "headers" : {
        "X-StackMob-OrderBy" : "zip:asc"
    }
});

// ===============================================================
// Get geo location and update record
// ===============================================================
forwardGeocode = function(address, callback) {
    var GOOGLE_BASE_URL = 'http://maps.googleapis.com/maps/geo?output=json&q=';
    var xhr = Titanium.Network.createHTTPClient();
    xhr.open('GET', GOOGLE_BASE_URL + escape(address));
    xhr.onload = function() {
        //Ti.API.info(this.responseText);
        var json = JSON.parse(this.responseText);
        Ti.API.info(json + "");

        var point = {
            latitude : json.Placemark[0].Point.coordinates[1],
            longitude : json.Placemark[0].Point.coordinates[0]
        };
        Ti.API.info(point + "");

        callback({
            title : address,
            coords : point
        });
        Ti.API.info('called callback');
    };
    xhr.send();
};
// ===============================================================
// Simple hack to loop through the items and get the correct geo
// coordinates, then we will update the data for the geo queries
// ===============================================================
var queue = {};
queue.queueEventHandler = function(_data) {
    var _data_index = (_data.index | 0 );

    if(_data_index == queue.data_array.length) {
        Ti.App.addEventListener('app:next_item', queue.queueEventHandler);
        return;
    }
    var _object = queue.data_array[_data_index];

    // create address
    var address = _object.address_1 + " " + _object.city + " " + _object.state + " " + _object.zip;

    // get location
    queue.callback(address, function(e2) {
        Ti.API.info(JSON.stringify(e2));

        // update the db record using stackmob
        client.update({
            className : 'user',
            objectId : _object.username,
            params : {
                "location" : {
                    "lon" : e2.coords.longitude,
                    "lat" : e2.coords.latitude
                }
            },
            success : function(data) {
                Ti.API.info("User Updated " + data.text);
            },
            error : function(data) {
                Ti.API.info("list user(s) " + JSON.stringify(JSON.parse(data.text)));
            }
        });

        // get the next element
        Ti.App.fireEvent('app:next_item', {
            "index" : _data_index + 1
        });
    });
};
// ===============================================================
// process the queue items
// ===============================================================

function processQ(_data, _callback) {
    var data_object;
    queue.data_array = _data;
    queue.callback = _callback;

    Ti.App.addEventListener('app:next_item', queue.queueEventHandler);

    Ti.App.fireEvent('app:next_item', {});
};