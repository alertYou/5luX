(function() {
	if(document.referrer === 'order/order.html') {
		window.location.replace('/cart/cart.html');
	}
})()
var total = parseInt($.query.get('total'));
$('.total').text(total);
var time = 0;
setInterval(function() {
	time = parseInt($('.time').text());
	$('.time').text(--time);
	if(time === 0)
		window.location.replace('/order/order.html?click=2');
}, 1000)
$('.tip').on('click', function() {
	window.location.replace('/order/order.html?click=2');
})