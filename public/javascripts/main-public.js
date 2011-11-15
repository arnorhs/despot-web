

$(function(){

		$('form.search').submit(function(){
			$.ajax({
				type: 'GET',
				url: '/search',
				data: {
					q: $('input.q',this).val()
				},
				dataType: 'html',
				success: function (data) {
					$('#tracklist').find('ul').html(data).end().show();
				}
			});
			return false;
		});
});












