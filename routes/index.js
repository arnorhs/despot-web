/*
 * GET /
 * index page (home page)
 */

var http = require('http'),
    xml2js = require('xml2js'),
	util = require('util');

function x (v) {
	console.log(util.inspect(v, false, null))
}

exports.index = function(req, res){

	res.render('index', {});

};

exports.search = function(req, res){

	var httpRequest = http.get({
		host: 'ws.spotify.com',
		port: 80,
		path: '/search/1/track?q=peanut+butter+jelly+time'
	}, function(httpRes) {
		var d = '';
		httpRes.addListener('data', function (chunk) {
			d = d + chunk;
		});
		httpRes.addListener('end', function (hvad) {
			var parser = new xml2js.Parser();
		
			parser.parseString(d, function (err, result) {
				var tracklist = [], track;
				for (var i in result.track) {
					track = result.track[i];
					tracklist.push({
						'trackname': track.name,
						'spotifyurl': track['@'].href,
						'artistname': track.artist.name
					});
				};
				
				res.partial('search', { tracklist: tracklist })
			});
		});
	}).on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

};
