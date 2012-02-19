(function(window, undefined) {
    var $q, doingSearch = false, timer,
        idleDelay = 1500, lastSearch = '',
        minimumSearchLength = 2,
        ignoreKeys = [32, 8, 13, 39, 37, 38, 40, 16, 18, 17, 224, 9, 46];

    function nextTrack() {
        $ajaxPost('/playback/next',{
            success: function (data) {
                $('#song-queue ul li:first').remove();
            }
        });
    }

    function getActiveSearchTerm () {
        return $q.val().replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    // loads the list of stuff in the queue
    function fetchRemoteQueue () {
        $ajaxGet('/queue', {
            success: function (data) {
                displayQueue(data);
            },
            error: function () {
                alert("Fuck, something's wrong.");
            }
        });
    }

    function addToQueue(spotify_id) {
        $ajaxPost('/queue/add', {
            data: {
                spotify_id: spotify_id
            },
            success: function (data) {
                displayQueue(data);
            },
            error: function () {
                alert("Oops! We're having problems adding to queue. Try again later");
            }
        });
    }

    function displayQueue(data) {
        $('#song-queue ul').append(data);
    }

    function prepareTracks ($obj) {
        $('span.add-to-queue',$obj).click(function(){
            var spotify_id = $(this).closest('li.track').find('.song a').attr('href');
            addToQueue(spotify_id);
        });
    }

    function doSearch (search) {

        // prevent us from doing two ajax requests at the same time
        if (doingSearch || search.length < 1) return false;
        if (search == lastSearch) return false;
        lastSearch = search;
        doingSearch = true;
        $q.addClass('spinner');
        $ajaxGet('/search', {
            data: {
                q: search
            },
            success: function (data) {
                $('#intro').hide();
                if (data.length < 1) {
                    $('#tracklist').prepend('<h3 class="error">No songs found</h3>').find('ul').html('').show();
                    return;
                } else {
                    $('#tracklist').find('.error').remove();
                    var $tracklist = $('#tracklist').find('ul').html(data).end().show();
                }
                prepareTracks($tracklist);
                doingSearch = false;
                $q.removeClass('spinner');
                document.location.hash = encodeURIComponent(search);
            },
            error: function () {
                var $tracklist = $('#tracklist').find('ul').html("<li>Oops.. search didn't go very well.. try again later. Sorry.").end().show();
                doingSearch = false;
            }
        });
    }

    $(function(){
        $q = $('input.q');
        $q.focus().select();
        if (document.location.hash.length > 0) {
            $q.val(decodeURIComponent(document.location.hash.replace(/#/,'')));
        }
        if (getActiveSearchTerm().length > 2) {
            doSearch(getActiveSearchTerm());
        }

        var doingSearch = false;
        $q.keyup(function(e){

            clearTimeout(timer);

            // only search if we have enough stuff and they key pressed was a key..
            if ([13,32].indexOf(e.keyCode) != -1) {
                doSearch(getActiveSearchTerm());
            } else if (getActiveSearchTerm().length < minimumSearchLength) {
                if (getActiveSearchTerm().length < minimumSearchLength) {
                    $('#tracklist').hide();
                    $('#intro').show();
                    document.location.hash = '';
                }
            } else {
                // almost instant search.. waits a few ms
                (function(searchTerm){
                    timer = setTimeout(function(){
                        doSearch(searchTerm);
                    },idleDelay);
                })(getActiveSearchTerm());
            }
        });

        // load the queue
        fetchRemoteQueue();

        $('#playback-next').click(function(e) {
            e.preventDefault();
            nextTrack();
        });
    });


    // Lazy short-hand functions for ajax requests - returns whatever $.ajax returns
    function _ajax (type) {
        return function (url,options) {
            return $.ajax( $.extend({}, {type: type, url: url, dataType:'html'}, options) );
        };
    }
    var $ajaxGet = _ajax('GET'), $ajaxPost = _ajax('POST');

})(window);
