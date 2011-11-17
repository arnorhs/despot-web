/*
 * GET /
 * index page (home page)
 */

var http = require('http'),
	util = require('util'),
	redis = require('redis');

// just a handy function for the console
function x (v) {
	return util.inspect(v, false, null);
}

exports.index = function(req, res){
	res.render('index', {});
};

exports.search = function(req, res) {

	var httpRequest = http.get({
		host: 'ws.spotify.com',
		port: 80,
		path: '/search/1/track.json?q='+req.query.q
	}, function(httpRes) {
		var d = '';
		httpRes.addListener('data', function (chunk) {
			d = d + chunk;
		});
		httpRes.addListener('end', function () {
			
			var tracks = JSON.parse(d).tracks, tracklist = [], track;
			
			for (var i in tracks) {
				track = tracks[i];
				tracklist.push({
					'trackname': track.name,
					'spotifyurl': track.href,
					'artistname': track.artists[0].name
				});
			}
			res.partial('search-results', { tracklist: tracklist })

		});
	}).on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

};

exports.playback_next = function(req, res) {

	redisClient = redis.createClient();
    redisClient.on('error',function(err,res){
        console.log('Redis error: ',err);
    });
    redisClient.rpush("despot:commands", "NEXT");
    redisClient.quit();
    res.send('ok');

};

exports.queue_add = function(req, res) {

    console.log(req.body);
	redisClient = redis.createClient();
    redisClient.on('error',function(err,res){
        console.log('Redis error: ',err);
    });
    redisClient.rpush("despot:queue", req.body.spotify_id);
    redisClient.quit();
    res.partial('queue-list', {queue:[req.body.spotify_id]});

};

exports.queue = function(req, res) {

	redisClient = redis.createClient();
    redisClient.on('error',function(err,res){
        console.log('Redis error: ',err);
    });
    redisClient.lrange("despot:queue", "0", "-1", function (err,obj) {
        if (!obj) obj = [];
        redisClient.quit();
        res.partial('queue-list', {queue:obj});
    });

};

