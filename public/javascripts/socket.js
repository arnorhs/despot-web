function Socket(options) {
  this.bind(options);
}

Socket.prototype.bind = function(options) {
  var socket = io.connect('/');

  socket.on('added', function (data) {
    D.lookup(data.uri, {
      success: function (data) {
        options.added && options.added(data.track);
      }
    });
  });

  socket.on('playing', function (data) {
    D.lookup(data.uri, {
      success: function (data) {
        options.playing && options.playing(data.track);
      }
    });
  });

  socket.on('volume', function (data) {
    options.playing && options.volume(data.level);
  });
};
