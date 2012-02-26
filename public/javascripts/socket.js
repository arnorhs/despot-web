function Socket(options) {
  this._options = options;
  this.bind();
}

Socket.prototype.bind = function() {
  var socket = io.connect('http://localhost'),
      self   = this;

  socket.on('playing', function (data) {
    D.lookup(data.uri, {
      success: function (data) {
        self._options.playing && self._options.playing(data.track);
      }
    });
  });

  socket.on('volume', function (data) {
    self._options.playing && self._options.volume(data.level);
  });
}
