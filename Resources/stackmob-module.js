Ti.include('jsOAuth-1.3.1.min.js');

//Public client interface
function Client(applicationName, publicKey, privateKey, userObject) {
    this.STACKMOB_APP_NAME = applicationName;
    this.STACKMOB_PUBLIC_KEY = publicKey;
    this.STACKMOB_PRIVATE_KEY = privateKey;
    this.STACKMOB_USER_OBJECT_NAME = userObject || "user";
    this.ENDPOINT = 'http://stackmob.mob1.stackmob.com/api/0/' + applicationName + '/';

    this.oauth = OAuth({
        consumerKey : publicKey,
        consumerSecret : privateKey
    });

    Ti.API.debug(JSON.stringify(this));

};

exports.Client = Client;
exports.OAuth = OAuth;

//Parse API endpoint

/*
 * Make an authenticated client request.  Argument hash:
 *
 * url: url endpoint to hit
 * method: HTTP method to use
 * params (optional): A JavaScript object to JSON-serialize (PUT/POST only)
 * success (optional): a function to be called on a successful request
 * error (optional): a function to be called on a server error
 */
Client.prototype.request = function(args) {
    var that = this, headers = {};
    headers = extend(headers, args.headers);

    if(args.method === 'PUT' || args.method === 'POST') {
        headers = extend(headers, {
            'Content-Type' : 'application/json'
        });
    }
    var options = {
        'method' : args.method,
        'headers' : headers,
        'url' : that.ENDPOINT + args.action,
        'data' : (args.method === 'PUT' || args.method === 'POST') ? JSON.stringify(args.params) : args.params,
        'success' : function(data) {
            var response = JSON.stringify(data);
            //Ti.API.debug(String.format('success: %s - %s', args.action, response));
            if(args.success !== undefined) {
                args.success(data);
            }
        },
        'failure' : function(data) {
            var response = JSON.stringify(data);
            Ti.API.error(String.format('fail: %s - %s', args.action, response));
            if(args.error !== undefined) {
                args.error(data)
            }
        }
    }
    that.oauth.request(options);

};
/*
 * Create a StackMob object.  Argument hash:
 *
 * className: string name of the StackMob class
 * object: The object to save
 * success: function to call on success
 * error: function to call on error
 *
 */
Client.prototype.create = function(args) {
    this.request({
        action : args.className,
        method : 'POST',
        params : args.params,
        success : args.success,
        error : args.error,
        headers : args.headers
    });
};
/*
 * Get a StackMob object.  Argument hash:
 *
 * className: string name of the StackMob class
 * objectId: The object ID of the object you're getting, no id will return all
 * success: function to call on success
 * error: function to call on error
 *
 */
Client.prototype.linkUserWithTwitter = function(args) {
    this.request({
        action : ((args.className || 'user') + "/linkUserWithTwitter"),
        method : 'GET',
        params : {
            tw_ts : Ti.App.Properties.getString('TwitterOAuthTokenSecret'),
            tw_tk : Ti.App.Properties.getString('TwitterOAuthTokenKey')
        },
        success : args.success,
        error : args.error,
        headers : args.headers
    });
};
/*
 * Get a StackMob object.  Argument hash:
 *
 * className: string name of the StackMob class
 * objectId: The object ID of the object you're getting, no id will return all
 * success: function to call on success
 * error: function to call on error
 *
 */
Client.prototype.twitterStatusUpdate = function(args) {
    this.request({
        action : ((args.className || 'user') + "/twitterStatusUpdate"),
        method : 'GET',
        params : {
            tw_st : args.message
        },
        success : args.success || args.success,
        error : args.error || args.error,
        headers : args.headers || args.headers
    });
};
/*
 * Get a StackMob object.  Argument hash:
 *
 * className: string name of the StackMob class
 * objectId: The object ID of the object you're getting, no id will return all
 * success: function to call on success
 * error: function to call on error
 *
 */
Client.prototype.login = function(args) {
    this.request({
        action : ((args.className || 'user') + "/login"),
        method : 'GET',
        params : {
            'username' : args.username,
            'password' : args.password
        },
        success : args.success,
        error : args.error,
        headers : args.headers
    });
};
/*
 * Get a StackMob object.  Argument hash:
 *
 * className: string name of the StackMob class
 * objectId: The object ID of the object you're getting, no id will return all
 * success: function to call on success
 * error: function to call on error
 *
 */
Client.prototype.get = function(args) {
    this.request({
        action : args.className + ((args.objectId) ? '/' + args.objectId : ''),
        method : 'GET',
        params : args.params,
        success : args.success,
        error : args.error,
        headers : args.headers
    });
};
/*
 * Get a StackMob object.  Argument hash:
 *
 * className: string name of the StackMob class
 * objectId: The object ID of the object you're getting, no id will return all
 * success: function to call on success
 * error: function to call on error
 *
 */
Client.prototype.getNear = function(args) {
    var p = {
        "location[near]" : args.params.lon + "," + args.params.lat + "," + (args.params.dist_miles ? args.params.dist_miles / 3963 : args.params.dist)
    };
    this.request({
        action : args.className,
        method : 'GET',
        params : p,
        success : args.success,
        error : args.error,
        headers : args.headers
    });
};
/*
 * Get a StackMob object.  Argument hash:
 *
 * className: string name of the StackMob class
 * objectId: The object ID of the object you're getting, no id will return all
 * success: function to call on success
 * error: function to call on error
 *
 */
Client.prototype.getWithin = function(args) {
    var d, p = {};
    // distance
    d = (args.params.dist_miles ? args.params.dist_miles / 3963 : args.params.dist);

    // set coordinates, account for bounding box with if statement
    if(args.params.lon !== null && args.params.lat) {
        p = {
            "location[near]" : args.params.lon + "," + args.params.lat + "," + d
        };
    } else {
        p = {
            "location[within]" : args.params.bottomLeft.lon + "," + args.params.bottomLeft.lat + "," + args.params.topRight.lon + "," + args.params.topRight.lat + "," + d
        };
    }
    this.request({
        action : args.className,
        method : 'GET',
        params : p,
        success : args.success,
        error : args.error,
        headers : args.headers
    });
};
/*
 * Update a StackMob object.  Argument hash:
 *
 * className: string name of the StackMob class
 * objectId: The object ID of the object you're updating
 * object: the fields on the object you would like to update
 * success: function to call on success
 * error: function to call on error
 *
 */
Client.prototype.update = function(args) {
    this.request({
        action : args.className + '/' + encodeURIComponent(args.objectId),
        method : 'PUT',
        params : args.params,
        success : args.success,
        error : args.error,
        headers : args.headers
    });
};
/*
 * Delete a StackMob object.  Argument hash:
 *
 * className: string name of the StackMob class
 * objectId: The object ID of the object you're deleting
 * success: function to call on success
 * error: function to call on error
 *
 */
Client.prototype.remove = function(args) {
    this.request({
        action : args.className + '/' + args.objectId,
        method : 'DELETE',
        success : args.success,
        error : args.error,
        headers : args.headers
    });
};

exports.base64FromFile = function(f) {
    var isAndroid = (Titanium.Platform.osname == 'android');
    var content = f.read();
    if(isAndroid) {
        return String.format("Content-Type: %s\nContent-Transfer-Encoding: base64\n\n%s", content.mimeType, content.toBase64());
    } else {
        var utils = require('com.clearlyinnovative.utils');
        return String.format("Content-Type: %s\nContent-Transfer-Encoding: base64\n\n%s", content.mimeType, utils.base64encode(content));
    }
};
// Create Global "extend" method
var extend = function(obj, extObj) {
    if(arguments.length > 2) {
        for(var a = 1; a < arguments.length; a++) {
            extend(obj, arguments[a]);
        }
    } else {
        for(var i in extObj) {
            obj[i] = extObj[i];
        }
    }
    return obj;
};
//
//
//

/**
 * Twitter
 *
 * @constructor
 * @param options {object}
 *      consumerKey {string} appliction's consumer key
 *      consumerSecret {string} appliction's consumer secret
 */
OAuth.Twitter = function(options) {
    if(!(this instanceof OAuth.Twitter)) {
        return new OAuth.Twitter(options);
    }

    var properties = Ti.App.Properties;
    var accessTokenKey = properties.hasProperty("TwitterOAuthTokenKey") ? properties.getString("TwitterOAuthTokenKey") : "";
    var accessTokenSecret = properties.hasProperty("TwitterOAuthTokenSecret") ? properties.getString("TwitterOAuthTokenSecret") : "";

    if(!('accessTokenKey' in options)) {
        options.accessTokenKey = accessTokenKey;
        options.accessTokenSecret = accessTokenSecret;
    }

    options.requestTokenUrl = OAuth.Twitter.API_URL + OAuth.Twitter.API_OAUTH_REQUEST_TOKEN;
    options.authorizationUrl = OAuth.Twitter.API_URL + OAuth.Twitter.API_OAUTH_AUTHENTICATE;
    options.accessTokenUrl = OAuth.Twitter.API_URL + OAuth.Twitter.API_OAUTH_ACCESS_TOKEN;
    options.callbackUrl = 'http://bytespider.eu/oauth/';

    this.oauth = new OAuth(options);
};
/** @const */
OAuth.Twitter.API_OAUTH_AUTHORISE = "oauth/authorize";
/** @const */
OAuth.Twitter.API_OAUTH_AUTHENTICATE = "oauth/authenticate";
/** @const */
OAuth.Twitter.API_OAUTH_ACCESS_TOKEN = "oauth/access_token";
/** @const */
OAuth.Twitter.API_OAUTH_REQUEST_TOKEN = "oauth/request_token";

/** @const */
OAuth.Twitter.API_URL = 'https://api.twitter.com/';
/** @const */
OAuth.Twitter.API_UPLOAD_URL = 'https://upload.twitter.com/';
/** @const */
OAuth.Twitter.API_VERSION = '1';
/** @const */
OAuth.Twitter.API_FORMAT = 'json';

/** @const */
OAuth.Twitter.API_VARIFY_CREDENTIALS = '/account/verify_credentials';

/** @const */
OAuth.Twitter.API_HOME_TIMELINE = '/statuses/home_timeline';
/** @const */
OAuth.Twitter.API_USER_TIMELINE = '/statuses/user_timeline';
/** @const */
OAuth.Twitter.API_PUBLIC_TIMELINE = '/statuses/public_timeline';
/** @const */
OAuth.Twitter.API_MENTIONS = '/statuses/mentions';
/** @const */
OAuth.Twitter.API_RETWEETED_BY_ME = '/statuses/retweeted_by_me';
/** @const */
OAuth.Twitter.API_RETWEETS_OF_ME = '/statuses/retweets_of_me';
/** @const */
OAuth.Twitter.API_RETWEETED_TO_USER = '/statuses/retweeted_to_user';
/** @const */
OAuth.Twitter.API_RETWEETED_BY_USER = '/statuses/retweeted_by_user';

/** @const */
OAuth.Twitter.API_STATUS_UPDATE = '/statuses/update';
/** @const */
OAuth.Twitter.API_STATUS_UPDATE_WITH_MEDIA = '/statuses/update_with_media';

/** @const */
OAuth.Twitter.API_TWEET = '/statuses/retweet/';
/** @const */
OAuth.Twitter.API_RETWEET = '/statuses/retweet/';
/** @const */
OAuth.Twitter.API_DESTROY_TWEET = '/statuses/destroy/';

/** @const */
OAuth.Twitter.API_MESSAGES = '/direct_messages';
/** @const */
OAuth.Twitter.API_NEW_MESSAGE = '/direct_messages/new';
/** @const */
OAuth.Twitter.API_MESSAGE = '/direct_messages/';

OAuth.Twitter.UI = (function() {
    var wnd, cancel_button = Titanium.UI.createButton({
        title : "Cancel"
    }), successCallback, failureCallback;
    wnd = Titanium.UI.createWindow({
        title : 'Twitter',
        leftNavButton : cancel_button
    });

    cancel_button.addEventListener('click', function(event) {
        OAuth.Twitter.UI.hide();
        if(failureCallback) {
            failureCallback('cancelled');
        }
    });
    return {
        /**
         * Opens a modal browser pointing to the authentication page
         *
         */
        show : function(url, success, failure) {
            var twitter = this;
            successCallback = success;
            failureCallback = failure;

            var webview = Ti.UI.createWebView({
                autoDetect : [Ti.UI.AUTODETECT_NONE],
                url : url
            });
            wnd.add(webview);

            webview.addEventListener('load', function(event) {
                var url = event.url;
                if(url.indexOf('oauth_verifier') == -1 && url.indexOf('denied') == -1) {
                    return;
                }

                if(url.indexOf('denied') != -1) {
                    OAuth.Twitter.UI.hide();
                    wnd.remove(webview);

                    if(failureCallback) {
                        failureCallback(url);
                    }
                    return;
                }

                if(url.indexOf('oauth_verifier') != -1) {
                    OAuth.Twitter.UI.hide();
                    wnd.remove(webview);

                    if(successCallback) {
                        successCallback(url);
                    }

                    return;
                }
            });

            wnd.open({
                modal : true,
                modalTransitionStyle : Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
                modalStyle : Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
            });
        },
        /**
         * Hide the modal browser pointing to the authentication page
         *
         */
        hide : function() {
            wnd.close();
        }
    };
})();

OAuth.Twitter.prototype = {

    /**
     * Authenticates a user
     *
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *      username {string} the username to log in as (xAuth Only)
     *      password {string} the password to log in as (xAuth Only)
     */
    authenticate : function(success, failure, options) {
        options = options || {};
        var twitter = this;
        if(!success) {
            throw new Error("Success callback is required in authenticate()");
        }

        if('username' in options && 'password' in options) {
            // xAuth authentication
            var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_OAUTH_ACCESS_TOKEN;

            twitter.oauth.post(url, {
                x_auth_username : options.username,
                x_auth_password : options.password,
                x_auth_mode : 'client_auth'
            }, success, failure);
        } else {
            // normal authentication
            twitter.oauth.fetchRequestToken(function(url) {
                OAuth.Twitter.UI.show(url, function(url) {
                    var querystring = url.substr(url.indexOf("?"));
                    var query = twitter.oauth.parseTokenRequest(querystring);

                    twitter.oauth.setVerifier(query.oauth_verifier);
                    twitter.oauth.fetchAccessToken(function(data) {
                        twitter.storeToken.call(twitter);

                        success(data);
                    }, failure);
                }, failure);
            }, function(data) {
                OAuth.Twitter.UI.hide.call(twitter);
                if(failure) {
                    failure(data);
                }
            });
        }

        return this;
    },
    /**
     * Deauthenticates a user
     */
    deauthenticate : function() {
        this.oauth.setAccessToken(null, null);
        Ti.App.Properties.removeProperty('TwitterOAuthTokenKey');
        Ti.App.Properties.removeProperty('TwitterOAuthTokenSecret');

        return this;
    },
    /**
     * Stores the token from OAuth into permanent storate
     */
    storeToken : function() {
        var accessTokenKey = this.oauth.getAccessTokenKey();
        var accessTokenSecret = this.oauth.getAccessTokenSecret();

        Ti.App.Properties.setString('TwitterOAuthTokenKey', accessTokenKey);
        Ti.App.Properties.setString('TwitterOAuthTokenSecret', accessTokenSecret);
    },
    /**
     * Is the user authenticated?
     */
    //get signedIn ()
    signedIn : function() {
        var hasKey = false;
        var hasSecret = false;

        var properties = Ti.App.Properties;

        if(properties.hasProperty('TwitterOAuthTokenKey')) {
            hasKey = properties.getString('TwitterOAuthTokenKey');
        }

        if(properties.hasProperty('TwitterOAuthTokenSecret')) {
            hasSecret = properties.getString('TwitterOAuthTokenSecret');
        }

        return (hasKey !== false && hasSecret !== false);
    },
    /**
     * Makes a request to varify the authenticated user's credentials
     *
     * @param success {object} callback for a sucessful request
     * @param failure {object} callback for a failed request
     * @param options {object}
     *
     * @see https://dev.twitter.com/docs/api/1/get/account/verify_credentials
     */
    verifyCredentials : function(success, failure, options) {
        options = options || {};
        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VERSION + OAuth.Twitter.API_VARIFY_CREDENTIALS + '.' + OAuth.Twitter.API_FORMAT;

        var allowed_options = {}, defaults = {};
        url += optionsToQueryString(options, allowed_options, defaults);

        this.oauth.getJSON(url, success, failure);

        return this;
    },
    /**
     * Returns the 20 most recent statuses, including retweets if they
     * exist, posted by the authenticating user and the user's they follow.
     *
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *      sinceId {integer} id of the last tweet
     *      count {integer}
     *      page {integer}
     *      maxId {integer}
     *      trimUser {boolean}
     *      includeRetweets {boolean}
     *      includeEntities {boolean}
     *      excludeReplies {boolean}
     *      contributorDetails {boolean}
     *
     * @see https://dev.twitter.com/docs/api/1/get/statuses/home_timeline
     */
    homeTimeline : function(sinceId, success, failure, options) {
        options = options || {};
        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VERSION + OAuth.Twitter.API_HOME_TIMELINE + '.' + OAuth.Twitter.API_FORMAT;

        if(sinceId !== null) {
            options.sinceid = sinceId;
        }

        var allowed_options = {
            'sinceId' : 'since_id',
            'count' : 'count',
            'page' : 'page',
            'maxId' : 'max_id',
            'trimUser' : 'trim_user',
            'includeRetweets' : 'include_rts',
            'includeEntities' : 'include_entities',
            'excludeReplies' : 'exclude_replies',
            'contributorDetails' : 'contributor_details'
        };

        var defaults = {
            'trimUser' : true,
            'includeRetweets' : true,
            'includeEntities' : true,
            'excludeReplies' : false,
            'contributorDetails' : true
        };
        url += optionsToQueryString(options, allowed_options, defaults);

        this.oauth.getJSON(url, success, failure);

        return this;
    },
    /**
     * Returns the 20 most recent statuses posted by the named user
     *
     * @param screenName {string|integer} the screen name or user id of the user
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *      count {integer}
     *      page {integer}
     *      sinceId {integer}
     *      maxId {integer}
     *      trimUser {boolean}
     *      includeRetweets {boolean}
     *      includeEntities {boolean}
     *      excludeReplies {boolean}
     *      contributorDetails {boolean}
     *
     * @see https://dev.twitter.com/docs/api/1/get/statuses/user_timeline
     */
    userTimeline : function(screenName, sinceId, success, failure, options) {
        options = options || {};
        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VERSION + OAuth.Twitter.API_USER_TIMELINE + '.' + OAuth.Twitter.API_FORMAT;

        var userId = parseInt(screenName, 10);
        if(userId == screenName) {
            options.userId = userId;
        } else {
            options.screenName = screenName;
        }

        var allowed_options = {
            'screenName' : 'screen_name',
            'userId' : 'user_id',
            'count' : 'count',
            'page' : 'page',
            'maxId' : 'max_id',
            'trimUser' : 'trim_user',
            'includeRetweets' : 'include_rts',
            'includeEntities' : 'include_entities',
            'excludeReplies' : 'exclude_replies',
            'contributorDetails' : 'contributor_details'
        };

        var defaults = {
            'trimUser' : true,
            'includeRetweets' : true,
            'includeEntities' : true,
            'excludeReplies' : false,
            'contributorDetails' : true
        };
        url += optionsToQueryString(options, allowed_options, defaults);

        this.oauth.getJSON(url, success, failure);

        return this;
    },
    /**
     * Returns the 20 most recent statuses, including retweets if they
     * exist, from non-protected users.
     *
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *      trimUser {boolean}
     *      includeEntities {boolean}
     *
     * @see https://dev.twitter.com/docs/api/1/get/statuses/public_timeline
     */
    /*
    publicTimeline: function (success, failure, options)
    {
    var url = OAuth.Twitter.API_URL +
    OAuth.Twitter.API_VERSION +
    OAuth.Twitter.API_PUBLIC_TIMELINE + '.' +
    OAuth.Twitter.API_FORMAT;

    var allowed_options = {
    'trimUser': 'trim_user',
    'includeEntities': 'include_entities'
    };

    var defaults = {
    'trimUser': true
    'includeEntities': true
    };

    url += optionsToQueryString(options, allowed_options, defaults);

    this.oauth.getJSON(url, success, failure);

    return this;
    },
    */

    /**
     * Returns the 20 most recent mentions (status containing @username) for
     * the authenticating user.
     *
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *      count {integer}
     *      page {integer}
     *      sinceId {integer}
     *      maxId {integer}
     *      trimUser {boolean}
     *      includeRetweets {boolean}
     *      includeEntities {boolean}
     *      contributorDetails {boolean}
     *
     * @see https://dev.twitter.com/docs/api/1/get/statuses/mentions
     */
    mentions : function(success, failure, options) {
        options = options || {};
        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VESRION + OAuth.Twitter.API_MENTIONS + '.' + OAuth.Twitter.API_FORMAT;

        var allowed_options = {
            'count' : 'count',
            'page' : 'page',
            'maxId' : 'max_id',
            'trimUser' : 'trim_user',
            'includeRetweets' : 'include_rts',
            'includeEntities' : 'include_entities',
            'excludeReplies' : 'exclude_replies',
            'contributorDetails' : 'contributor_details'
        };

        var defaults = {
            'trimUser' : true,
            'includeRetweets' : true,
            'includeEntities' : true,
            'excludeReplies' : false,
            'contributorDetails' : true
        };
        url += optionsToQueryString(options, allowed_options, defaults);

        this.oauth.getJSON(url, success, failure);

        return this;
    },
    /**
     * Returns the 20 most recent direct messages sent to the authenticating
     * user.
     *
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *      count {integer}
     *      page {integer}
     *      sinceId {integer}
     *      maxId {integer}
     *      includeEntities {boolean}
     *      skipStatus {boolean}
     *
     * @see https://dev.twitter.com/docs/api/1/get/statuses/mentions
     */
    messages : function(success, failure, options) {
        options = options || {};
        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VESRION + OAuth.Twitter.API_MESSAGES + '.' + OAuth.Twitter.API_FORMAT;

        var allowed_options = {
            'count' : 'count',
            'page' : 'page',
            'maxId' : 'max_id',
            'sinceId' : 'since_id',
            'includeEntities' : 'include_entities',
            'skipStatus' : 'skip_status'
        };

        var defaults = {
            'skipStatus' : true,
            'includeEntities' : true
        };
        url += optionsToQueryString(options, allowed_options, defaults);

        this.oauth.getJSON(url, success, failure);

        return this;
    },
    /**
     * Sends a new direct message to the specified user from the
     * authenticating user
     *
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *      count {integer}
     *      page {integer}
     *      sinceId {integer}
     *      maxId {integer}
     *      includeEntities {boolean}
     *      skipStatus {boolean}
     *
     * @see https://dev.twitter.com/docs/api/1/post/direct_messages/new
     */
    createMessage : function(success, failure, options) {
        options = options || {};
        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VESRION + OAuth.Twitter.API_NEW_MESSAGE + '.' + OAuth.Twitter.API_FORMAT;

        var allowed_options = {
            'userId' : 'user_id',
            'screenName' : 'screen_name',
            'text' : 'text',
            'wrapLinks' : 'wrap_links'
        };

        var defaults = {
            'wrapLinks' : true
        };

        var data = handleOptions(options, allowed_options, defaults);

        this.oauth.post(url, data, function(data) {
            success(JSON.parse(data.text));
        }, failure);
        return this;
    },
    /**
     * Sends a new direct message to the specified user from the
     * authenticating user
     *
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *      count {integer}
     *      page {integer}
     *      sinceId {integer}
     *      maxId {integer}
     *      includeEntities {boolean}
     *      skipStatus {boolean}
     *
     * @see https://dev.twitter.com/docs/api/1/post/direct_messages/new
     */
    showMessage : function(id, success, failure, options) {
        options = options || {};

        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VESRION + OAuth.Twitter.API_MESSAGE + id + '.' + OAuth.Twitter.API_FORMAT;

        var allowed_options = {}, defaults = {};
        url += optionsToQueryString(options, allowed_options, defaults);

        this.oauth.getJSON(url, success, failure);

        return this;
    },
    /**
     * Returns the 20 most recent tweets of the authenticated user that have
     * been retweeted by others.
     *
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *      count {integer}
     *      page {integer}
     *      sinceId {integer}
     *      maxId {integer}
     *      trimUser {boolean}
     *      includeEntities {boolean}
     *
     * @see https://dev.twitter.com/docs/api/1/get/statuses/retweets_of_me
     */
    retweets : function(success, failure, options) {
        options = options || {};
        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VESRION + OAuth.Twitter.API_RETWEETS_OF_ME + '.' + OAuth.Twitter.API_FORMAT;

        var allowed_options = {
            'count' : 'count',
            'page' : 'page',
            'maxId' : 'max_id',
            'trimUser' : 'trim_user',
            'includeEntities' : 'include_entities'
        };

        var defaults = {
            'trimUser' : true,
            'includeEntities' : true
        };
        url += optionsToQueryString(options, allowed_options, defaults);

        this.oauth.getJSON(url, success, failure);

        return this;
    },
    /**
     * Returns the 20 most recent retweets posted by the authenticating
     * user.
     *
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *      count {integer}
     *      page {integer}
     *      sinceId {integer}
     *      maxId {integer}
     *      trimUser {boolean}
     *      includeEntities {boolean}
     *
     * @see https://dev.twitter.com/docs/api/1/get/statuses/retweeted_by_me
     */
    retweetsByMe : function(success, failure, options) {
        options = options || {};
        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VESRION + OAuth.Twitter.API_RETWEETED_BY_ME + '.' + OAuth.Twitter.API_FORMAT;

        var allowed_options = {
            'count' : 'count',
            'page' : 'page',
            'maxId' : 'max_id',
            'trimUser' : 'trim_user',
            'includeEntities' : 'include_entities'
        };

        var defaults = {
            'trimUser' : true,
            'includeEntities' : true
        };
        url += optionsToQueryString(options, allowed_options, defaults);

        this.oauth.getJSON(url, success, failure);

        return this;
    },
    /**
     * Updates the authenticating user's status, also known as tweeting.
     *
     * @param status {string} string of text to use as a status
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *
     * @see https://dev.twitter.com/docs/api/1/post/statuses/update
     */
    tweet : function(status, success, failure, options) {
        options = options || {};
        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VERSION + OAuth.Twitter.API_STATUS_UPDATE + '.' + OAuth.Twitter.API_FORMAT;

        if(!status) {
            throw new Error("Missing 'status' in tweet()");
        }

        options.status = status;

        var allowed_options = {
            'status' : 'status',
            'inReplyTo' : 'in_reply_to_status_id',
            'lat' : 'lat',
            'long' : 'long',
            'place' : 'place_id',
            'displayCoordinates' : 'display_coordinates',
            'trimUser' : 'trim_user',
            'includeEntities' : 'include_entities',
            'wrap_linksinks' : 'wrap_links'
        };

        var defaults = {
            'trimUser' : true,
            'includeEntities' : true,
            'wrapLinks' : true
        };

        var data = handleOptions(options, allowed_options, defaults);

        this.oauth.post(url, data, function(data) {
            success(JSON.parse(data.text));
        }, failure);
        return this;
    },
    /**
     * Updates the authenticating user's status and attaches media for upload.
     *
     * @param status {string} string of text to use as a status
     * @param media {array} array of media to upload
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *
     * @see https://dev.twitter.com/docs/api/1/post/statuses/update_with_media
     */
    tweetWithMedia : function(status, media, success, failure, options) {
        options = options || {};
        var url = OAuth.Twitter.API_UPLOAD_URL + OAuth.Twitter.API_VERSION + OAuth.Twitter.API_STATUS_UPDATE_WITH_MEDIA + '.' + OAuth.Twitter.API_FORMAT;

        if(!('status' in options)) {
            throw new Error("Missing 'status' in tweetWithMedia()");
        }
        if(!('media' in options)) {
            throw new Error("Missing 'status' in tweetWithMedia()");
        }

        options.status = status;
        options.media = media;

        var allowed_options = {
            'status' : 'status',
            'media' : 'media',
            'possiblySensitive' : 'possibly_sensitive',
            'inReplyTo' : 'in_reply_to_status_id',
            'lat' : 'lat',
            'long' : 'long',
            'place' : 'place_id',
            'displayCoordinates' : 'display_coordinates',
            'trimUser' : 'trim_user',
            'includeEntities' : 'include_entities',
            'wrap_linksinks' : 'wrap_links'
        };

        var defaults = {
            'trimUser' : true,
            'includeEntities' : true,
            'wrapLinks' : true
        };

        var data = handleOptions(options, allowed_options, defaults);

        this.oauth.post(url, data, function(data) {
            success(JSON.parse(data.text));
        }, failure);
        return this;
    },
    /**
     * Retweets a tweet.
     *
     * @param id {integer} Id of the tweet to retweet
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *
     * @see https://dev.twitter.com/docs/api/1/post/statuses/retweet/%3Aid
     */
    retweet : function(id, success, failure, options) {
        options = options || {};
        if(!id) {
            throw new Error("Missing 'id' in retweet()");
        }

        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VERSION + OAuth.Twitter.API_RETWEET + id + '.' + OAuth.Twitter.API_FORMAT;

        var allowed_options = {
            'trimUser' : 'trim_user',
            'includeEntities' : 'include_entities'
        };

        var defaults = {
            'trimUser' : true,
            'includeEntities' : truepre
        };

        var data = handleOptions(options, allowed_options, defaults);

        this.oauth.post(url, data, function(data) {
            success(JSON.parse(data.text));
        }, failure);
        return this;
    },
    /**
     * Destroys the status specified by the required ID parameter.
     *
     * @param id {integer} Id of the tweet to delete
     * @param success {function} callback for a sucessful request
     * @param failure {function} callback for a failed request
     * @param options {object}
     *
     * @see https://dev.twitter.com/docs/api/1/post/statuses/destroy/%3Aid
     */
    destroyTweet : function(id, success, failure, options) {
        options = options || {};
        if(!id) {
            throw new Error("Missing 'id' in destroyTweet()");
        }

        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VERSION + OAuth.Twitter.API_DESTROY_TWEET + id + '.' + OAuth.Twitter.API_FORMAT;

        var allowed_options = {
            'trimUser' : 'trim_user',
            'includeEntities' : 'include_entities'
        };

        var defaults = {
            'trimUser' : true,
            'includeEntities' : true
        };

        var data = handleOptions(options, allowed_options, defaults);

        this.oauth.post(url, data, function(data) {
            success(JSON.parse(data.text));
        }, failure);
        return this;
    },
    /**
     * Returns a single status, specified by the id parameter.
     *
     * @see https://dev.twitter.com/docs/api/1/get/statuses/show/%3Aid
     */
    showTweet : function(id, success, failure, options) {
        options = options || {};
        if(!id) {
            throw new Error("Missing 'id' in showTweet()");
        }

        var url = OAuth.Twitter.API_URL + OAuth.Twitter.API_VERSION + OAuth.Twitter.API_TWEET + id + '.' + OAuth.Twitter.API_FORMAT;

        var allowed_options = {
            'trimUser' : 'trim_user',
            'includeEntities' : 'include_entities'
        };

        var defaults = {
            'trimUser' : true,
            'includeEntities' : true
        };

        var data = handleOptions(options, allowed_options, defaults);

        this.oauth.post(url, data, function(data) {
            success(JSON.parse(data.text));
        }, failure);
        return this;
    }
};

function handleOptions(options, allowed_options, defaults) {
    var i, data = {};
    for(i in allowed_options) {
        if(allowed_options.hasOwnProperty(i)) {
            if( i in options) {
                data[allowed_options[i]] = options[i];
            } else {
                if( i in defaults) {
                    data[allowed_options[i]] = defaults[i];
                }
            }
        }
    }

    return data;
}

function optionsToQueryString(options, allowed_options, defaults) {
    var data = handleOptions(options, allowed_options, defaults), query = [], i;
    for(i in data) {
        query.push(i + "=" + data[i]);
    }

    return '?' + query.join("&");
}