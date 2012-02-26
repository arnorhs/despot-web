/*
 * GET /
 * index page (home page)
 */

var util = require('util')
    ,redis = require('redis')
    ,step = require('step')
    ,spotify = require('../lib/despot/spotify')

// just a handy function for the console
function x (v) {
	return util.inspect(v, false, null);
}

exports.index = function(req, res){
	res.render('index', {});
};

exports.search = function(req, res) {

    var searchQuery = req.query.q.trim();
    console.log('Searching for: ', searchQuery);
    if (!!searchQuery.match(/^spotify:track:[a-zA-Z0-9]+$/)) {
        res.send('');
        return;
    }
    step(
        function searchRedis () {
            var next = this;
            // Try to retrieve the current search results form the redis server
            // for ultra speed
            req.redisClient.hget("search_cache",searchQuery, function (err,searchResultsFromCache) {
                if (err) {
                    console.log('error: ',err);
                    next();
                }
                if (searchResultsFromCache === null) {
                    // stepping on startAPIRequest
                    next();
                } else {
                    var tracklistFromCache = spotify.searchResultsFromJSON(searchResultsFromCache)
                    if (!tracklistFromCache || tracklistFromCache === null) {
                        console.log('search results from searchResultsFromJSON were empty');
                        res.send('');
                        return;
                    }
                    res.partial('search-results', { tracklist: tracklistFromCache})
                };
            });
        },
        function startAPIRequest () {
            // If we can't find the search results from redis, we will try to
            // get them from spotify
            spotify.api.searchTrack(searchQuery, function (err,searchResults) {
                if (err) {
                    console.log('error: ',err);
                }
                // save the results to redis before we return, so next identical
                // search will be super fast.. or should I say "redis fast"
                req.redisClient.hset("search_cache",searchQuery,searchResults);
                tracks = spotify.searchResultsFromJSON(searchResults);
                // tracks = spotify.filterTracksByTerritory(tracks);
                res.partial('search-results', { tracklist: tracks})
            }).on('error', function(e) {
                console.log('problem with spotify request: ' + e.message);
            });
        }
    );
};

exports.playback_next = function(req, res) {

    req.redisClient.rpush("despot:commands", "NEXT");
    res.send('ok');

};

exports.playback_volume = function(req, res) {

    req.redisClient.rpush("despot:commands", "VOLUME "+req.body.volume);
    console.log('Volume set to '+req.body.volume);
    res.send('ok');

};

exports.queue_add = function(req, res) {

    var spotify_id = req.body.spotify_id;
    // add it to the queue
    req.redisClient.rpush("despot:queue", spotify_id);
    req.redisClient.publish("despot:events", "ADDED " + spotify_id);
    res.send(200);
    // retrieve meta data
    // If we can't find the search results from redis, we will try to
    // get them from spotify
    spotify.api.lookupTrack(spotify_id, function (err,track) {
        if (!track) {
            res.send('');
            console.log('error: ',err,' -- track: ', track);
            return;
        }
        req.redisClient.hset("spotify_track_meta",spotify_id,track);
    }).on('error', function(e) {
        console.log('problem with spotify request: ' + e.message);
        res.partial('ajax-error', {queue:[req.body.spotify_id]});
    });


};

exports.queue = function(req, res) {

    req.redisClient.lrange("despot:queue", "0", "-1", function (err,arr) {
        if (arr === null || err) {
            res.send('')
            console.log('Queue empty: ',err);
            return;
        }
        req.redisClient.hmget("spotify_track_meta",arr,function(err,arr){
            if (!arr || err) {
                res.send('');
                console.log(err);
                return;
            }
            for (var i in arr) {
                arr[i] = spotify.trackMetaFromJSON(arr[i]);
            }
            res.partial('queue-list', {queue:arr});
        });
    });

};

