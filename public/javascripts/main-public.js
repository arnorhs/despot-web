(function(window, undefined) {
	var $q, doingSearch = false, timer,
		ignoreKeys = [32, 8, 13, 39, 37, 38, 40, 16, 18, 17, 224, 9, 46];

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
				$('#tracklist').find('ul').html(data).end().show();
				doingSearch = false;
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
		
		var doingSearch = false;
		$q.keyup(function(e){

			// only search if we have enough stuff and they key pressed was a key..
			if ($q.val().length < 3 || ignoreKeys.indexOf(e.keyCode) != -1 || e.metaKey === true) {
				return;
			}
				
			// almost instant search.. waits a few ms
			clearTimeout(timer);
			timer = setTimeout(function(){
				doSearch();
			},500);
		});
	});


})(window);









