(function(window, undefined) {
    var $q, doingSearch = false, timer,
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

                // if the search in the intput box has changed, update the search
                if (search != $('input.q').val()) {
                    doSearch($('input.q').val());
                }
            },
            error: function () {
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

            clearTimeout(timer);

            // only search if we have enough stuff and they key pressed was a key..
            if (e.keyCode == 13) {
                doSearch($q.val());
            } else if ($q.val().length < minimumSearchLength || ignoreKeys.indexOf(e.keyCode) != -1 || e.metaKey === true) {
                if ($q.val().length < minimumSearchLength) {
                    $('#tracklist').hide();
                    $('#intro').show();
                }
                return;
            }
            // almost instant search.. waits a few ms
            (function(searchTerm){
                timer = setTimeout(function(){
                    doSearch(searchTerm);
                },keystrokeDelay);
            })($q.val());
        });

        // load the queue
        fetchRemoteQueue();

        $('#playback-next').click(function(e) {
            e.preventDefault();
            nextTrack();
        });
    });
})(window);
