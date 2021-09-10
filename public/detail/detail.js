// 根据id获取商品详情
var pid = $.query.get('pid');
var avatar = '',
	model = '',
	price = 0;
$.ajax({
	url: '/product/model/' + pid,
	success: function(res) {
		// console.log(res);
		pid = res.data.id;
		avatar = res.data.avatar;
		model = res.data.name;
		price = res.data.price;
		$('.banner>.swiper-wrapper').html(getBanner(res.data.bannerImgs));
			new Swiper ('.banner',{
				autoplay: 1000,
				loop: true,
				pagination: {
					el: '.banner>.swiper-pagination',
					type: 'fraction'
				}
			})
		$('.content').prepend(getMessage(res.data));
		$('.rate>div>span').text(res.data.rate);
		$('.detail-content').html(getOtherImages(res.data.otherImgs));
	}
})
// 渲染banner
function getBanner(img) {
	var img = img.split(','),
		htmlStr = '';
	img.forEach(function(item) {
		htmlStr += `
			<img class="swiper-slide" src="${item}" alt="" />
		`;
	})
	return htmlStr;
}
// 渲染商品的价格等信息
function getMessage(item) {
	return `
		<div class="price-wrapper">
			<div class="price">￥<span>${item.price}</span><div>特价</div></div>
			<img src="/images/icon_product_unfavor.png" alt="" />
		</div>
		<p class="price-used">￥<span>${item.price + 700}</span></p>
		<div class="name-wrapper">
			<img src="/images/tag_self_new.png" alt="" />
			<h5 class="name">${item.name}</h5>
		</div>
		<div class="brief">${item.brief}</div>
	`;
}
// 渲染商品详情
function getOtherImages(img) {
	var img = img.split(','),
		htmlStr = '';
	img.forEach(function(item) {
		htmlStr += `
			<img src="${item}" alt="" />
		`;
	})
	return htmlStr;
}

function addCart(count) {
	$.ajax({
		type: 'post',
		url: '/cart/add',
		headers: { Authorization: Cookies.get('token') },
		data: { pid, count },
		success: function(res){
			// console.log(res)
			if(res.code === 199)
				layer.open({
					content: `${res.msg}`,
					style: 'color:#FFF; border:none;' ,//自定风格,
					time: 2
				});
			if(res.code === 401 )
				window.location.href = '/login/login.html';
		}
	})
}
function modeifyCoun() {
	setTimeout(function() {
		$.ajax({
			url: '/cart/total',
			headers: {Authorization: Cookies.get('token')},
			success: function(res) {
				if(res.code !== 200 ) {
					// 应该提示系统错误
					$('.btn-cart .product-count').css('display', 'none');
					return;
				}
				if(res.data === 0) {
					$('.btn-cart .product-count').css('display', 'none');
					return;
				}
				$('.btn-cart .product-count').css('display', 'block')
				$('.btn-cart .product-count').text(res.data);
			}
		})
	}, 100)
	
}
modeifyCoun();
// 滚动固定定位
// var scroll = null;
// imagesLoaded($('.content-wrapper')[0], function() {
// 		scroll = new IScroll($('.content-wrapper')[0], {
// 			// scrollY: true,
// 			// deceleration: 0.003,	// 阻尼系数
// 			// bounce: false,			// 关闭边界回弹
// 			probeType: 2,			// 开启滚动监听
// 			// click: true
// 		});
// 		// scroll.refresh();
// 		scroll.on('scroll', function() {
// 			console.log(scroll.startY);
// 			// isTriggerLoadMore = scroll.maxScrollY - scroll.y === 0
				
// 		});
// 		scroll.on('scrollEnd', function() {
			
// 		});
// })
// 点击返回
$('.header-wrapper>.btn-return').on('click', function() {
	window.location.href = document.referrer;
})
// 点击选择件数
$('.count-wrapper').on('click', function() {
	var countLayer = layer.open({
		type: 1,
		content: `<div class="count-detail-layer">
			<div class="count-detail-content-layer">
				${getCountLayer()}
			</div>
			<div class="footer-layer">
				<div class="footer-layer1">
					<button>加入购物车</button>
					<button>立即购买</button>
				</div>
				<div class="footer-layer2">
					<button>确认</button>
				</div>
			</div>
		</div>`,
		anim: 'up',
		style: 'position:fixed; bottom:0; left:0; width: 100%; height: 75%; padding:10px 0; border:none;'
	});
	// 关闭弹窗
	$('.product-detail-right-layer>div:nth-child(1)>img').on('click', function() {
	layer.close(countLayer);
	})
	// 减
	$('.count-layer-wrapper>div>button:first-child').on('click', function() {
		var count = parseInt($(this).next().text());
		if(count === 1) {
			$(this).attr('disabled', 'disabled').children().attr('src', '/images/sub_count_disable_icon.png');
			return;
		}
		count--;
		$(this).next().text(count).next().removeAttr('disabled').children().attr('src', '/images/add_count_enable_icon.png');
		$('span.count').text(count);
	})
	// 加
	$('.count-layer-wrapper>div>button:last-child').on('click', function() {
		var count = parseInt($(this).prev().text());
		if(count === 5) {
			$(this).attr('disabled', 'disabled').children().attr('src', '/images/add_count_disable_icon.png');
			return;
		}
		count++;
		$(this).prev().text(count).prev().removeAttr('disabled').children().attr('src', '/images/sub_count_enable_icon.png');
		$('span.count').text(count);
	})
	$('.footer-layer>button:nth-child(1)').on('click', function() {
		var count = $('.count-layer-wrapper>div>span.count').text();
		addCart(count);
		modeifyCoun();
		layer.close(countLayer);
	})
	$('.footer-layer>button:nth-child(2)').on('click', function() {
		var count = parseInt($('.count-layer-wrapper>div>span.count').text());
		addCart(count);
		modeifyCoun();
		layer.close()
	})
	// 点击立即购买
	$('.footer-layer>.footer-layer1>button:nth-child(2)').on('click', function() {
		var count = parseInt($('.count-layer-wrapper>div>span.count').text());
		window.location.href = `/order_conform/order_conform.html?pid=${pid}&count=${count}`;
	})
	$('.footer-layer>.footer-layer2>button').on('click', function() {
		layer.close();
	})
})
// 点击加入购物车
$('.btn-addcart').on('click', function() {
	$('.count-wrapper').click();
	$('.footer-layer>.footer-layer1').css('display', 'none').next().css('display', 'flex').children().on('click', function() {
		var count = parseInt($('.count-layer-wrapper>div>span.count').text());
		addCart(count);
		modeifyCoun();
		// location.reload(countLayer);
	});
})
// 渲染弹出选择数量窗口
function getCountLayer() {
	var reg = /(.+)\s(.+)/;
	var mode = reg.exec(model)[2];
	return `
		<div class="product-detail-layer">
			<img src="${avatar}" alt="" />
			<div class="product-detail-right-layer">
				<div><img src="/images/close_circle_grey_new.png" alt="" /></div>
				<div>￥<span class="price-layer">${price}</span>.00</div>
				<div>已选:<span></span>×<span class="count">1</span></div>
			</div>
		</div>
		<div class="model">
			<p>型号</p>
			<span>${mode}</span>
		</div>
		<div class="count-layer-wrapper">
			<p>数量</p>
			<div>
				<button disabled><img src="/images/sub_count_disable_icon.png" alt="" /></button>
				<span class="count">1</span>
				<button><img src="/images/add_count_enable_icon.png" alt="" /></button>
			</div>
		</div>
	`;
}
// 配送地址
$.ajax({
	url: '/address/get_default',
	headers: {Authorization: Cookies.get('token')},
	success: function(res) {
		if(res.code !== 200) return;
		// console.log(res)
		if(res.data === null) {
			$('.address>input').val('北京市 市辖区 东城区 东华门街道');
		} else {
			$('.address>input').val(res.data.receiveRegion);
		}
		
	}
})
$('.btn-wrapper>div>button:nth-child(2)').on('click', function() {
		$('.count-wrapper').click();
		$('.footer-layer>.footer-layer1').css('display', 'none').next().css('display', 'flex').children().on('click', function() {
			var count = parseInt($('.count-layer-wrapper>div>span.count').text());
			window.location.href = `/order_conform/order_conform.html?pid=${pid}&count=${count}`;
		});
	})

// 小米图标去首页
$('.cart-wrapper>.logo').on('click', function() {
	window.location.href = '/home/index.html';
})

// imagesLoaded($('.isscroll')[0], function() {
	
// })

setTimeout(function() {
	var height = $('.price-wrapper').offset().top;
	var h = $('.header-wrapper').height();
	var j = $('.content').offset().top - h;
	var myScroll = new IScroll($('.isscroll')[0], {
		scrollbars: 'custom',
		deceleration: 0.003,	// 阻尼系数
		bounce: false,			// 关闭边界回弹
		probeType: 2,
	});
	debounce(myScroll.on('scroll', function() {
		var scrolling = Math.abs(myScroll.y);
		i = (scrolling / j);
		$(".header-title").css('opacity', `${i}`);
		$('.header-wrapper').css('background', `rgba(255, 255, 255, ${i})`);
		if(i >= 1) {
			$('.header-wrapper>span.btn-return').addClass('show');
			$('.header-wrapper>span.btn-more').addClass('show');
		} else {
			$('.header-wrapper>span.btn-return').removeClass('show');
			$('.header-wrapper>span.btn-more').removeClass('show');
		}
		if($('.guarantee').offset().top + $('.guarantee').height() >=0) {
			$('.header-title>li:nth-child(1)').addClass('active').siblings().removeClass('active');
		} else if($('.rate-wrapper').offset().top + $('.rate-wrapper').height() >= 0) {
			$('.header-title>li:nth-child(2)').addClass('active').siblings().removeClass('active');
		} else if($('.detail-content').offset().top + $('.detail-content').height() >= 0) {
			$('.header-title>li:nth-child(3)').addClass('active').siblings().removeClass('active');
		} else {
			$('.header-title>li:nth-child(4)').addClass('active').siblings().removeClass('active');
		}
	}),400)
	
}, 150)
