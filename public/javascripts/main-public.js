(function(window, undefined) {
    var $q, doingSearch = false,
        keystrokeDelay = 350,
        minimumSearchLength = 2,
        ignoreKeys = [32, 8, 13, 39, 37, 38, 40, 16, 18, 17, 224, 9, 46];

    function nextTrack() {
        $.ajax({
            url: '/playback/next',
            type: 'POST',
            success: function (data) {
                $('#song-queue ul li:first').remove();
            }
        });
    }

    function fetchRemoteQueue () {
        // load the queue
        $.ajax({
            url: '/queue',
            type: 'GET',
            dataType: 'html',
            success: function (data) {
                // inset queue here...
                displayQueue(data);
            },
            error: function () {
                alert("Oops! We're having problems fetching the current queue of songs.. :S");
            }
        });
    }

    function addToQueue(spotify_id) {
        $.ajax({
            url: '/queue/add',
            type: 'POST',
            dataType: 'html',
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

        doingSearch = true;
        // the search term to look for
        $q.addClass('spinner');
        $.ajax({
            type: 'GET',
            url: '/search',
            data: {
                q: search
            },
            dataType: 'html',
            success: function (data) {
                $('#intro').hide();
                var $tracklist = $('#tracklist').find('ul').html(data).end().show();
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
        if ($q.val().length > 2) {
            doSearch($q.val());
        }

        var doingSearch = false;
        $q.keyup(function(e){

            // only search if we have enough stuff and they key pressed was a key..
            if ([13,32].indexOf(e.keyCode) != -1) {
                doSearch($q.val());
            } else if ($q.val().length < minimumSearchLength) {
                if ($q.val().length < minimumSearchLength) {
                    $('#tracklist').hide();
                    $('#intro').show();
                    document.location.hash = '';
                }
                return;
            }
        });

        // load the queue
        fetchRemoteQueue();

        $('#playback-next').click(function(e) {
            e.preventDefault();
            nextTrack();
        });
    });
})(window);
