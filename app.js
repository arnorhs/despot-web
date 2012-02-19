
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    despot = require('./lib/despot'),
    stylus = require('stylus');

var app = module.exports = express.createServer()

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(despot.redisClient());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'your secret here' }));
    app.use(stylus.middleware({ src: __dirname + '/public' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.get('/search', routes.search);
app.get('/queue', routes.queue);
app.post('/queue/add', routes.queue_add);
app.post('/playback/next', routes.playback_next);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
