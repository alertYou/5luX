
// 获取全部订单
function confirm() {
	$.ajax({
		url: '/order/list_all',
		headers: {Authorization: Cookies.get('token')},
		success: function(res) {
			if(res.code !== 200) {
				return;
				}
			$('.product-wrapper').html(productW(res.data));
			btnAll();
		}
	})
}

// 渲染外部
function productW(product) {
	var state = 0,
		htmlStr = '',
		content = '',
		time = '',
		count = product.length;
	product.forEach(function(product) {
		// console.log(product);
		time = product.orderTime;
		state = product.pay;
		stateTip =  ifTime(time).indicator === 0 ? '待付款' : state === 1 ? '已支付' : '已取消' ;
		content = productContent(product.details);
		htmlStr += `
			<div class="product" data-id="${product.orderId}" data-addressId="${product.addressId}">
				<div class="product-header">
					<span>
						<img src="/images/logo_ypjingxuan.png" alt="" />
						<span>有品精选</span>
					</span>
					<p>${stateTip}</p>
				</div>
				<div class="product-content">
					${content}
					<div class="total">共<span>${count}</span>件商品，总金额￥<span>${product.account}</span>.00</div>
					<div class="btn-wrapper ${state || ifTime(time).indicator ? '' : 'cancel-wrapper'}">
						<div class="cancel">剩余支付时间<span class="time"></span><p>${ifTime(time).time}</p></div>
						<button class="go-pay">去支付</button>
						<div class="remove">删除订单</div>
						<button class="again">再次购买</button>
					</div>
				</div>
			</div>
		`;
	})
	return htmlStr;
}
// 渲染商品信息
function productContent(product) {
	var htmlStr = '',
		count = 0,
		total = 0,
		type = '',
		name = '';
	var reg = /(.+)\s(.+)/;
	product.forEach(function(product) {
		name = reg.exec(product.name)[1];
		type = reg.exec(product.name)[2];
		htmlStr += `
			<div class="product-detail" data-id="${product.id}" data-count="${product.count}">
				<img src="${product.avatar}" alt="" />
				<div class="name-wrapper">
					<div class="name">
						<p>${name}</p>
						<span>${type}</span>
					</div>
					<div class="count-wrapper">
						<p class="price-wrapper">￥&nbsp;<span>${product.price}</span>.00</p>
						<p class="count">×<span>${product.count}</span></p>
					</div>
				</div>
			</div>
		`;
	})
	return htmlStr;
}
// 判断是否支付时间过期
function ifTime(time) {
	var date = new Date(),
		nYear = date.getFullYear(),
		nMonth = date.getMonth()+1,
		nDay = date.getDate(),
		nHours = date.getHours(),
		nMin = date.getMinutes(),
		nSeconds = date.getSeconds(),
		ntime = nHours * 3600000 + nMin * 60000 + nSeconds * 1000,
		indicator = 0,
		iftimer = {};
		reg = /(\d{4})\-(\d{2})\-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/;
	var year = parseInt(reg.exec(time)[1]),
		month = parseInt(reg.exec(time)[2]),
		day = parseInt(reg.exec(time)[3]),
		hours = parseInt(reg.exec(time)[4]),
		min = parseInt(reg.exec(time)[5]) + 10,
		seconds = parseInt(reg.exec(time)[6]),
		timer = hours * 3600000 + min * 60000 + seconds * 1000;
	if(nYear > year || nMonth > month || nDay > day || ntime > timer)
		iftimer.indicator = 1;
	iftimer.time = timer - ntime;
		// console.log(nYear,nMonth,nDay,ntime);
		// console.log(year,month,day,timer);
	return iftimer;
}
// 倒计时
var timer = setInterval(function countDown() {
	$('.cancel-wrapper span.time').each(function(i, item) {
		var time = parseInt($(item).next().text());
		time -= 1000;
		// console.log(time)
		minutes = Math.floor(time / 60000);
		secound = Math.floor(time /1000 %60);
		$(this).text(`00:0${minutes}:${secound < 10 ? 0 : ''}${secound}`).next().text(time);
		if(parseInt($(this).next().text()) <= 0) {
			var id = $(this).closest('.product').attr('data-id');
			$.ajax({
				url: '/order/cancel/' + id,
				headers: {Authorization: Cookies.get('token')},
				success: function(res) {console.log(res)
					if(res.code !== 200) return;
				}
			})
			$(this).parent().parent().removeClass('cancel-wrapper');
			$('ul.nav>li:nth-child(2)').onclick();
		}
			
	})
}, 1000);
if(!$('.cancel-wrapper')) {
	clearInterval(timer);
}
// 点击全部
$('ul.nav>li:nth-child(1)').on('click', function() {
	$('.no-orders').css('display', 'none');
	$('ul.nav>li>a.active').removeClass('active');
	$(this).children().addClass('active');
	confirm();
})
// 待付款
$('ul.nav>li:nth-child(2)').on('click', function() {
	$('.no-orders').css('display', 'none');
	$('ul.nav>li>a.active').removeClass('active');
	$(this).children().addClass('active');
	$.ajax({
		url: '/order/list_unpay',
		headers: {Authorization: Cookies.get('token')},
		success: function(res) {
			if(res.code !== 200) {
				return;
				}
			$('.product-wrapper').html(productW(res.data));
			btnAll();
			if(res.data.length === 0) {
				$('.no-orders').css('display', 'flex');
				$('.no-orders>p').text('目前没有待付款订单哦~');
			}
		}
	})
})
// 待收货
$('ul.nav>li:nth-child(3)').on('click', function() {
	$('.no-orders').css('display', 'none');
	$('ul.nav>li>a.active').removeClass('active');
	$(this).children().addClass('active');
	$.ajax({
		url: '/order/list_pay',
		headers: {Authorization: Cookies.get('token')},
		success: function(res) {
			if(res.code !== 200) {
				return;
				}
			$('.product-wrapper').html(productW(res.data));
			btnAll();
		}
	})
})
// 退款
$('ul.nav>li:nth-child(4)').on('click', function() {
	$('ul.nav>li>a.active').removeClass('active');
	$(this).children().addClass('active');
	$('.product-wrapper').html('');
	$('.no-orders').css('display', 'flex');
	$('.no-orders>p').text('目前没有退货订单哦~');
})
// 已收货
$('ul.nav>li:nth-child(5)').on('click', function() {
	$('ul.nav>li>a.active').removeClass('active');
	$(this).children().addClass('active');
	$('.product-wrapper').html('');
	$('.no-orders').css('display', 'flex');
	$('.no-orders>p').text('目前没有已收获订单哦~');
})

// 按钮合集
function btnAll() {
	btnRemove();
	buyAgain();
	goPay();
}
// 点击删除按钮
function btnRemove() {
	$('.btn-wrapper>.remove').on('click', function() {
		var id = $(this).parent().parent().parent().attr('data-id');
		layer.open({
		    content: '您确定要删除本订单吗？',
			btn: ['确认', '取消'],
			yes: function(index){
				$.ajax({
					url: '/order/remove/' + id,
					headers: {Authorization: Cookies.get('token')},
					success: function(res) {
						if(res.code !== 200) return;
						// console.log($(this))
					}
				})
				$(this).parent().parent().parent().remove();
				layer.close(index);
			}.bind(this)
		});
	})
}
// 点击再次购买
function buyAgain() {
	$('.btn-wrapper>.again').on('click', function() {
		var ids = [],
			aa = {},
			account = 0,
			addressId = 0;
		$(this).parents('.product-content').find('.product-detail').each(function(i, item) {
			aa.id = parseInt($(item).attr('data-id'));
			aa.count = parseInt($(item).attr('data-count'));
			ids[i] = aa;
		})
		ids.forEach(function(item, i) {
			$.ajax({
				type: 'post',
				url: '/cart/add',
				headers: {Authorization: Cookies.get('token')},
				data: {
					pid: item.id,
					count: item.count
				},
				success: function(res) {
					if(res.code !== 200) return;
					 layer.open({
						content: '加购成功！',
						skin: 'msg',
						anim: false,
						time: 1 //2秒后自动关闭
					  });
					setTimeout(function() {
						window.location.href = '/cart/cart.html';
					}, 1500)
				}
			})
		})
	})
}
// 去支付
function goPay() {
	$('.btn-wrapper>.go-pay').on('click', function() {
		var id = $(this).parent().parent().parent().attr('data-id');
		window.location.replace(`/pay/pay.html?number=${id}`);
	})
}
// 返回
$('.header>img').on('click', function() {
	window.location.href = document.referrer;
})
// 跳转展示
if($.query.get('click') === 1)
$('ul.nav>li:nth-child(2)').click();
if($.query.get('click') === 2)
$('ul.nav>li:nth-child(3)').click();
if($.query.get('click') === 4)
$('ul.nav>li:nth-child(4)').click();
if($.query.get('click') === 5)
$('ul.nav>li:nth-child(5)').click();
if(!$.query.get('click'))
confirm();