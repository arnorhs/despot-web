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
    step(
        function searchRedis () {
            var next = this;
            // Try to retrieve the current search results form the redis server
            // for ultra speed
            req.redisClient.get("search:cache:"+searchQuery, function (err,obj) {
                if (!obj) {
                    // stepping on startAPIRequest
                    next();
                } else {
                    var tracklist = spotify.searchResultsFromJSON(obj) 
                    if (!tracklist) {
                        res.send('');
                        return;
                    }
                    res.partial('search-results', { tracklist: tracklist})
                };
            });
        },
        function startAPIRequest () {
            // If we can't find the search results from redis, we will try to
            // get them from spotify
            spotify.api.searchTrack(searchQuery, function (err,searchResults) {
                // save the results to redis before we return, so next identical
                // search will be super fast.. or should I say "redis fast"
                req.redisClient.set("search:cache:"+searchQuery,searchResults);
                tracks = spotify.searchResultsFromJSON(searchResults);
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

exports.queue_add = function(req, res) {

    var spotify_id = req.body.spotify_id;
    // add it to the queue
    req.redisClient.rpush("despot:queue", spotify_id);
    // retrieve meta data
    // If we can't find the search results from redis, we will try to
    // get them from spotify
    spotify.api.lookupTrack(spotify_id, function (err,track) {
        if (!track) {
            res.send('');
            return;
        }
        req.redisClient.hset("spotify_track_meta",spotify_id,track);
        res.partial('queue-list', {queue:[spotify.trackMetaFromJSON(track)]});
    }).on('error', function(e) {
        console.log('problem with spotify request: ' + e.message);
        res.partial('ajax-error', {queue:[req.body.spotify_id]});
    });


};

exports.queue = function(req, res) {

    req.redisClient.lrange("despot:queue", "0", "-1", function (err,arr) {
        if (!arr) {
            res.send('')
            return;
        }
        req.redisClient.hmget("spotify_track_meta",arr,function(err,arr){
            if (!arr) {
                res.send('');
                return;
            }
            for (var i in arr) {
                arr[i] = spotify.trackMetaFromJSON(arr[i]);
            }
            res.partial('queue-list', {queue:arr});
        });
    });

};

