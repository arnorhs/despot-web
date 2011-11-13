

$(function(){

		$('form.search').submit(function(){
			debugger;
			$.ajax({
				type: 'GET',
				url: '/search',
				data: {
					q: $('input.q',this).val()
				},
				dataType: 'html',
				success: function (data) {
					$('#tracklist ul').html(data).show();
				}
			});
			return false;
		});
});












