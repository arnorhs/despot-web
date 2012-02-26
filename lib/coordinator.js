function Coordinator(redis, socket) {
  this._redis     = redis;
  this._websocket = socket;

  this.bind();
}

Coordinator.prototype.bind = function() {
  this._redis.subscribe('despot:events');

  var self = this;
  this._redis.on('message', function(channel, message) {
    if (channel === 'despot:events') {
      var tokens = message.split(' ');

      switch (tokens[0]) {
        case 'ADDED':
          self.notifyAdded(tokens[1]);
          break;
        case 'PLAYING':
          self._currentTrackUri = tokens[1];
          self.notifyPlaying(tokens[1]);
          break;
        case 'VOLUME':
          self._currentVolume = tokens[1];
          self.notifyVolume(tokens[1]);
          break;
      }
    }
  });

  this._websocket.on('connection', function (socket) {
    if (self._currentTrackUri) {
      self.notifyPlaying(self._currentTrackUri);
    }

    if (self._currentVolume) {
      self.notifyVolume(self._currentVolume);
    }
  });
}

Coordinator.prototype.notifyPlaying = function(uri) {
  this._websocket.emit('playing', {
    uri: uri
  });
}

Coordinator.prototype.notifyAdded = function(uri) {
  this._websocket.emit('added', {
    uri: uri
  });
}

Coordinator.prototype.notifyVolume = function(level) {
  this._websocket.emit('volume', {
    level: level
  });
}

exports.Coordinator = Coordinator;
