(function() {
	if(document.referrer === '/orde/order.html') {
		$('.content').html('<p class="tips">支付已失效！马上返回购物车</p>');
		setTimeout(function() {
			window.location.replace('/cart/cart.html');
		},2000)
		return;
	}
	var id = $.query.get('number');
	// 付款方式切换
	$('span.checkbox').on('click', function() {
		if($(this).hasClass('checked')) return;
		$('span.checked').removeClass('checked');
		$(this).addClass('checked');
	})
	$.ajax({
		url: '/order/account/' + id,
		headers: {Authorization: Cookies.get('token')},
		success: function(res) {
			if(res.code !== 200) return;
			$('.total').text(res.data);
		}
	})
// 倒计时
	var milliseconds = 600000,
		minutes = 0,
		secound = 0;
	setInterval(function() {
		milliseconds -= 1000;
		minutes = Math.floor(milliseconds / 60000);
		secound = Math.floor(milliseconds /1000 %60);
		$('.time').text(`00:0${minutes}:${secound < 10 ? 0 : ''}${secound}`);
		if(secound < 0)
			window.location.replace('/fail/fail.html');
	}, 1000)
	// 点击返回按钮
	$('.header>span>img').on('click', function() {
		layer.open({
			content: '您的订单还未支付确认返回吗？',
			btn: ['是', '否'],
			yes: function(index){
					// console.log(id);
				// $.ajax({
				// 	url: '/order/cancel/' + id,
				// 	headers: {Authorization: Cookies.get('token')},
				// 	success: function(res) {
				// 		if(res.code !== 200) return;
						layer.close(index);
						window.location.replace('/order/order.html');
					// }
				// })
				},
			
		});
	})
	// 点击确认
	$('.footer>button').on('click', function() {
		$.ajax({
			url: '/order/pay/' + id,
			headers: {Authorization: Cookies.get('token')},
			success: function(res) {
				if(res.code !== 200) return;
				var total = $('.total-wrapper>div>span.total').text();
				window.location.replace(`/success/success.html?total=${total}`);
			}
		})
	})
})();
