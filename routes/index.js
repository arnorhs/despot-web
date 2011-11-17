/*
 * GET /
 * index page (home page)
 */

var http = require('http')
    ,util = require('util')
    ,redis = require('redis')
    ,step = require('step')

// just a handy function for the console
function x (v) {
	return util.inspect(v, false, null);
}

// Parses a JSON search results string into tracks...
function searchResultsFromJSON (str) {
    var tracks = JSON.parse(str).tracks, tracklist = [], track;
    
    for (var i in tracks) {
        track = tracks[i];
        tracklist.push({
            'trackname': track.name,
            'spotifyurl': track.href,
            'artistname': track.artists[0].name
        });
    }

    return tracklist;
}

exports.index = function(req, res){
	res.render('index', {});
};

exports.search = function(req, res) {

    var searchQuery = req.query.q.trim();
    console.log("Searching for ",searchQuery);

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
                    res.partial('search-results', { tracklist: searchResultsFromJSON(obj) })
                };
            });
            
        },
        function startAPIRequest () {

            // If we can't find the search results from redis, we will try to
            // get them from spotify
            var httpRequest = http.get({
                host: 'ws.spotify.com',
                port: 80,
                path: '/search/1/track.json?q='+searchQuery
            }, this ).on('error', function(e) {
                console.log('problem with request: ' + e.message);
            });
        },
        function handleAPIRequest (httpRes) {
            var d = '';
            httpRes.addListener('data', function (chunk) {
                d = d + chunk;
            });
            httpRes.addListener('end', function () {

                // save the results to redis before we return, so next identical
                // search will be super fast.. or should I say "redis fast"
                req.redisClient.set("search:cache:"+searchQuery,d);

                res.partial('search-results', { tracklist: searchResultsFromJSON(d) })

            });
        }
    );

};

exports.playback_next = function(req, res) {

    req.redisClient.rpush("despot:commands", "NEXT");
    res.send('ok');

};

exports.queue_add = function(req, res) {

    req.redisClient.rpush("despot:queue", req.body.spotify_id);
    res.partial('queue-list', {queue:[req.body.spotify_id]});

};

exports.queue = function(req, res) {

    req.redisClient.lrange("despot:queue", "0", "-1", function (err,obj) {
        if (!obj) obj = [];
        res.partial('queue-list', {queue:obj});
    });

};

