// surely we don't want to pollute the gobal namespace
// all the components are defined on this object
D = {};

D.lookup = function(uri, options) {
  $.ajax({
    url: 'http://ws.spotify.com/lookup/1/.json?uri=' + uri,
    success: function(data) {
      options.success && options.success(data);
    },
    error: function(data) {
      options.error && options.error(data);
    }
  });
}

// handles state of the main content area
D.mainContentState = (function (D) {
    return SimpleState({
        intro: {
            on: function () {
                $('#intro').show();
            },
            off: function () {
                $('#intro').hide();
            }
        },
        searchResults: {
            on: function () {
                $('#tracklist').show();
            },
            off: function () {
                $('#tracklist').hide().find('ul').html('');
            }
        },
        error: {
            on: function (errorString) {
                errorString = errorString || "Fuck, something went wrong and we forgot to pass along an error message";
                $('#tracklist').prepend('<h3 class="error">'+errorString+'</h3>').show();
            },
            off: function () {
                $('#tracklist').hide().find('h3.error').remove();
            }
        }
    },'intro');
})(D);

D.search = (function (D) {
    var lastKeyword = '',
        $q,
        minimumSearchLength = 2;

    function getActiveSearchTerm () {
        return $q.val().replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    function doSearch (keyword) {
        // prevent us from doing two ajax requests for the same keyword
        if (keyword == lastKeyword) return false;
        lastKeyword = keyword;
        $q.addClass('spinner');
        D.ajaxGet('/search', {
            data: {
                q: keyword
            },
            success: function (data) {
                $q.removeClass('spinner');
                if (data.length < 1) {
                    D.mainContentState.setState('error','No songs found');
                    return;
                } else {
                    D.mainContentState.setState('searchResults');
                    var $tracklist = $('#tracklist').find('ul').html(data);
                    D.prepare('tracks', $tracklist);
                }
                document.location.hash = encodeURIComponent(keyword);
            },
            error: function () {
                D.mainContentState.setState('error', "Oops.. search didn't go very well.. try again later. Sorry.");
            }
        });
    }
    function init () {
        $q = $('input.q');
        $q.focus().select();
        if (document.location.hash.length > 0) {
            $q.val(decodeURIComponent(document.location.hash.replace(/#/,'')));
        }
        if (getActiveSearchTerm().length > 2) {
            doSearch(getActiveSearchTerm());
        }

        $q.keyup(function(e){
            // only search if we have enough stuff and they key pressed was a key..
            if ([13,32].indexOf(e.keyCode) != -1) {
                doSearch(getActiveSearchTerm());
            } else if (getActiveSearchTerm().length < minimumSearchLength) {
                if (getActiveSearchTerm().length < minimumSearchLength) {
                    D.mainContentState.setState('intro');
                    document.location.hash = '';
                }
            }
        });
    }
    return {
        init: init,
        doSearch: doSearch
    };
})(D);

// utilities and short hand functions
(function (D) {
    // Lazy short-hand functions for ajax requests - returns whatever $.ajax returns
    function _ajax (type) {
        return function (url,options) {
            return $.ajax( $.extend({}, {type: type, url: url, dataType:'html'}, options) );
        };
    }
    $.extend(D,{
        'ajaxGet': _ajax('GET'),
        'ajaxPost': _ajax('POST')
    });
})(D);

D.playback = (function (D) {
    var $volumeButtons;
    function nextTrack () {
        D.ajaxPost('/playback/next',{
            success: function (data) {
                D.queue.removeFirst();
            }
        });
    }
    function volume (volume) {
        D.ajaxPost('/playback/volume',{
            data: { volume: volume }
        });
    }
    return {
        init: function () {
            $volumeButtons = $('button.volume');
            $('#playback-next').click(function(e) {
                e.preventDefault();
                nextTrack();
            });
            $volumeButtons.click(function(e) {
                if ($(this).hasClass('active')) return false;
                $volumeButtons.removeClass('active');
                $(this).addClass('active');
                volume($(this).data('volume'));
            });
        },
        nextTrack: nextTrack,
        volume: volume
    };
})(D);

D.prepare = (function(D) {
    var types = {
        'tracks': function ($obj) {
            $('span.add-to-queue',$obj).click(function(){
                var spotify_id = $(this).closest('li.track').find('.song a').attr('href');
                D.queue.add(spotify_id);
            });
        }
    };
    return function (what,$obj) {
        if (!types[what]) return false;
        return types[what]($obj);
    };
})(D);

D.queue = (function(D) {

    // loads the list of stuff in the queue
    function fetchRemote () {
        D.ajaxGet('/queue', {
            success: function (data) {
                display(data);
            },
            error: function () {
                alert("Fuck, something went wrong when trying to fetch the queue.");
            }
        });
    }

    function add (spotify_id) {
        D.ajaxPost('/queue/add', {
            data: {
                spotify_id: spotify_id
            },
            success: function (data) {
                display(data);
            },
            error: function () {
                alert("Oops! We're having problems adding to queue. Try again later");
            }
        });
    }

    function display(data) {
        $('#song-queue ul').append(data);
    }

    return {
        display: display,
        add: add,
        fetchRemote: fetchRemote,
        removeFirst: function () {
            $('#song-queue ul li:first').remove();
        }
    };

})(D);

$(function(){
    // init searchbox etc
    D.search.init();
    // load the queue
    D.queue.fetchRemote();
    // bind events to skip song etc
    D.playback.init();

    D.socket = new Socket({
      playing: function(track) {
        console.log('new track:', track);
        $('#current-track').text(track.artists[0].name + " - " + track.name);
        $('#playlist li:first').remove();
      },
      volume: function(level) {
        $('button.volume').removeClass('active');
        $('button.volume[data-volume=' + level + ']').addClass('active');
      }
    });
});
