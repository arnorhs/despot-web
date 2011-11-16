(function(window, undefined) {
	var $q, doingSearch = false, timer,
		ignoreKeys = [32, 8, 13, 39, 37, 38, 40, 16, 18, 17, 224, 9, 46];

    function next_track() {
        $.ajax({
            url: '/next',
            type: 'POST',
            success: function (data) {
              $('#song-queue ul li:first').remove();
              $('#num-songs').html($('#song-queue ul li').length);
            }
        });
    }

    function add_to_queue(spotify_id) {
        $.ajax({
            url: '/queue/add',
            type: 'POST',
            dataType: 'html',
            data: {
                spotify_id: spotify_id
            },
            success: function (data) {
                update_queue(data);
            }
        });
    }

    function update_queue(data) {
        $('#song-queue ul').append(data);
        $('#num-songs').html($('#song-queue ul li').length);
    }

    function prepareTracks ($obj) {

        $('span.add-to-queue',$obj).click(function(){
            var spotify_id = $(this).closest('li.track').find('.song a').attr('href');
            add_to_queue(spotify_id);
        });

    }

	function doSearch () {

		// prevent us from doing two ajax requests at the same time
		if (doingSearch) return false;
		doingSearch = true;
		// the search term to look for
		var search = $('input.q').val();
		$('#tracklist').find('ul').html('').end().hide();
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


                document.location.hash = encodeURIComponent(search);

				// if the search in the intput box has changed, update the search
				if (search != $('input.q').val()) {
					doSearch();
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
            doSearch();
        }
		
		var doingSearch = false;
		$q.keyup(function(e){

			// only search if we have enough stuff and they key pressed was a key..
			if ($q.val().length < 3 || ignoreKeys.indexOf(e.keyCode) != -1 || e.metaKey === true) {
                if ($q.val().length < 3) {
                    $('#tracklist').hide();
                    $('#intro').show();
                }
				return;
			}
				
			// almost instant search.. waits a few ms
			clearTimeout(timer);
			timer = setTimeout(function(){
				doSearch();
			},500);
		});
        

        // load the queue
        $.ajax({
            url: '/queue',
            type: 'GET',
            dataType: 'html',
            success: function (data) {
                // inset queue here...
                update_queue(data);
            }
        });

    $('#next').click(function(e) {
      e.preventDefault();
      next_track();
    });
	});





})(window);









