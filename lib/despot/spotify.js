var http = require('http')
    ,util = require('util')


var generateSpotifyJSONParser = function (root) {
    return function (str) {
        try {
            var parsed = JSON.parse(str);
        } catch (err) {
            return null;
        }
        return exports.trackObjToFriendly(parsed[root]);
    };
};
// Parses a JSON track meta information into a track object
exports.trackMetaFromJSON = generateSpotifyJSONParser('track');
// Parses a JSON search results string into an array of track object...
exports.searchResultsFromJSON = generateSpotifyJSONParser('tracks');

exports.trackObjToFriendly = function (track) {
    if (util.isArray(track)) {
        var tracks = [];
        for (var i in track) {
            tracks.push(exports.trackObjToFriendly(track[i]));
        }
        return tracks;
    }
    var track = {
        trackname: track.name,
        spotifyurl: track.href,
        artistname: track.artists[0].name
    };
    return track;
}

function spotifyHttpRequest(url,successCallback) {
    return http.get({
        host: 'ws.spotify.com',
        port: 80,
        path: url
    },function (httpRes) {
    
        // don't know if ther's a race condition here.. need to test
        var d = '';
        httpRes.addListener('data', function (chunk) {
            d = d + chunk;
        });
        httpRes.addListener('end', function () {
            // pass null as an error
            successCallback(null, d);
        });
    });
}

// spotify API requests will always return the httpRequest object, so you can
// attach your own error handler etc... although, that might change
exports.api = {
    type: 'json',
    lookupTrack: function (spotifyurl, successCallback) {
        return spotifyHttpRequest('/lookup/1/.'+this.type+'?uri='+spotifyurl, successCallback);
    },
    searchTrack: function (searchQuery, successCallback) {
        return spotifyHttpRequest('/search/1/track.'+this.type+'?q='+searchQuery, successCallback);
    }
};
    
