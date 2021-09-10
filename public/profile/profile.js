// 判断是否登录
if(!Cookies.get('name')) {
	$('.container').on('click' ,function() {
		layer.open({
			content: `
					<div class="layer-container">
						<h4 class="layer-title">声明 与政策</h4>
						<p>欢迎您来到小米有品！</p>
						<div class="layer-content">
							我们依据最新法律法规要求，制定并更新了<span>《隐私政策》</span>、<span>《小米有品用户协议》</span>以及<span>《小米帐号使用协议》</span>。
						</div>
						<p>您需阅读并同意相关政策条款方可进行登录。</p>
					</div>
			`,
			btn: ['同意', '不同意'],
			yes: function(index){
				window.location.href = '/login/login.html';
				layer.close(index);
			}
		})
		
	})
} else {
		var name = Cookies.get('name');
		$('.header>p').text(name);
		$('.quit').css('display', 'flex');
		$('.address>ul>li:nth-child(1)').on('click', function() {
			window.location.href = '/address/address.html';
		});
		$('.quit').on('click', function() {
			Cookies.remove('name');
			window.location.replace('/profile/profile.html');
		})
		$('.order')
		.on('click', '.order-header', function() {
			window.location.href = '/order/order.html';
		})
		.on('click', '.order-content>ul>li:nth-child(1)', function() {
			window.location.href = '/order/order.html?click=1';
		})
		.on('click', '.order-content>ul>li:nth-child(2)', function() {
			window.location.href = '/order/order.html?click=2';
		})
		.on('click', '.order-content>ul>li:nth-child(3)', function() {
			window.location.href = '/order/order.html?click=5';
		})
		.on('click', '.order-content>ul>li:nth-child(4)', function() {
			window.location.href = '/order/order.html?click=4';
		})
}
