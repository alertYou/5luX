var id = $.query.get('id'),
	addressId = 0,
	account = 0,
	ids = [];
	if(id.length > 1){
		ids = id.split(',');
	} else {
		ids[0] = id;
	}
// 获取订单信息
$.ajax({
	type: 'post',
	url: '/cart/list_ids',
	headers: {Authorization: Cookies.get('token')},
	data: { ids },
	success: function(res) {
		// console.log(res)
		if(res.code !== 200) {
			return;
		}
		$('.product-content').html(getProduct(res.data));
		$('.now-total-wrapper').append(getPrice(res.data));
	}
})
// 获取初始地址信息
$.ajax({
	url: '/address/get_default',
	headers: {Authorization: Cookies.get('token')},
	success: function(res) {
		if(res.code !== 200) return;
		$('.address-wrapper').prepend(getAddress(res.data));
	}
})

// 渲染商品信息
function getProduct(products) {
	var htmlStr = '';
	products.forEach(function(item) {
		htmlStr += `
			<div class="product">
				<img src="${item.avatar}" alt="" />
				<div class="product-detail">
					<div class="name-wrapper">
						<p><span>特价</span>${item.name}</p>
					</div>
					<div class="price-count">
						<div class="price-wrapper">
							<div>￥<span class="price">${item.price}</span>.00<p>￥<span class="price-used">${item.price + 300}</span>.00</p></div>
							<span class="count-wrapper">×<span class="count">${item.count}</span></span>
						</div>
						<div class="guarantee">7天无理由退货</div>
					</div>
				</div>
			</div>
		`;
	})
	return htmlStr;
}
// 渲染价格信息
function getPrice(prices) {
	var price = 0;
	prices.forEach(function(item) {
		price += item.price * item.count;
	})
	$('.tatol').text(price - 500);
	account = price - 500;
	return `
		<div class="total-wrapper">
			<p>商品总价</p>
			<span>￥<span>${price}</span></span>
		</div>
		<div class="freight">
			<p>运费</p>
			<span>+￥0.00</span>
		</div>
		<div class="activity">
			<p>活动优惠</p>
			<span>-￥<span>${500}</span>.00</span>
		</div>
	`;
}
// 渲染地址
function getAddress(address) {
	// console.log(address);
	if(address === null) return `<div></div>`;
	var phone = address.receivePhone.slice(0, 3) + '****' + address.receivePhone.slice(8, 12);
	return `
		<div data-id="${address.id}">
			<span class="name">${address.receiveName}</span>
			<span class="phone">${phone}</span>
			<p class="address">${address.receiveRegion} ${address.receiveDetail}</p>
		</div>
	`;
}
// 点击切换地址按钮
$('.address-wrapper').on('click', function() {
	$.ajax({
		url: '/address/list',
		headers: {Authorization: Cookies.get('token')},
		success: function(res) {
			if(res.code !== 200) return;
			var address = layer.open({
				type: 1,
				content: '<div class="address-container">' + getAddresses(res.data) + '</div><div class="footer"><button class="add-address">+&nbsp;添加地址</button></div>',
				title: ['选择地址', 'text-align: center; background-color: #FFF; border-radius: 3vw 3vw 0 0; padding: 0; font-size: 4vw; font-weight: 550; border-bottom: none; overflow: hidden;'],
				anim: 2,
				area: ['100%', '65%'],
				offset: 'b',
				style: 'position:fixed; bottom:0; left:0; width: 100%; height: 200px; padding:10px 0; border:none;'
			});
			// 地址添加
			$('.add-address').on('click', function() {
				$('.container').css('display', 'none');
				$('.add-address-wrapper').css('display', 'flex');
				$('form')[0].reset();
				$('input.id').val(0);
				layer.close(address);
			})
			replace();
			replaceAddress(address);
			asdf();
		}
	})
})

// 全部地址渲染
function getAddresses(addresses) {
	var htmlStr = '';
	addresses.forEach(function(item){
		var phone = item.receivePhone.slice(0, 3) + '****' + item.receivePhone.slice(8,12);
		htmlStr += `
			<div class="address-wrap" data-id="${item.id}">
				<div class="address-2">
					<span class="checkbox"></span>
					<div class="name-wrapper">
						<div>
							<div>
								<span class="name-2">${item.receiveName}</span>
								<span class="isdefault" style="display: ${item.isDefault ? 'inline-block' : 'none'}">默认</span>
							</div>
							<span class="phone-wrapper">${phone}</span>
						</div>
						<p>${item.receiveRegion} ${item.receiveDetail}</p>
					</div>
				</div>
				<img src="/images/edit.png" alt="" />
			</div>
		`;
	})
	return htmlStr;
}
// 更换地址勾选复选框
function replace() {
	$('.address-wrap').find('span.checked').removeClass('checked');
	$('.address-wrap').each(function(i, item) {
		if($(item).attr('data-id') === $('.address-wrapper>div').attr('data-id'))
			$(item).find('span.checkbox').addClass('checked');
	})
}
// 更换地址单击新地址
function replaceAddress(address) {
	$('.address-wrap').on('click', function() {
		$('.address-wrap').find('span.checked').removeClass('checked');
		var id = $(this).attr('data-id');
		getInitialAddress(id);
		$(this).find('span.checkbox').addClass('checked');
		layer.close(address);
	})
}
// 获取指定地址的详细信息
function getInitialAddress(id) {
	
	$.ajax({
		url: '/address/model/' + id,
		headers: {Authorization: Cookies.get('token')},
		success: function(res) {
			if(res.code !== 200) return;
			console.log(res)
			$('.address-wrapper>div').replaceWith(getAddress(res.data));
		}
	})
}
// 点击提交按钮
//生成订单
$('.footer>button').on('click', function() {
	var addressId = parseInt($('.address-wrapper>div').attr('data-id'));
	$.ajax({
		type: 'post',
		url: '/order/confirm',
		headers: {Authorization: Cookies.get('token')},
		data: { ids, account, addressId },
		success: function(res) {
			if(res.code !== 200) return;
			var number = res.data;
			window.location.replace(`/pay/pay.html?number=${number}`);
		}
	})
})
// 点击返回
$('.header>span>img').on('click', function() {
	window.location.href = document.referrer;
})
// 立即购买过来
if(!$.query.get('id')) {
		// return;
	var pid = $.query.get('pid'),
		count = $.query.get('count'),
		obj = {},
		arr = [];
	$.ajax({
		url: '/product/model/' + pid,
		success: function(res) {
			if(res === 199)
				window.location.href = '/logion/logion.html';
			obj = res.data;
			obj.count = count;
			arr[0] = obj;
			$('.product-content').html(getProduct(arr));
			$('.now-total-wrapper').append(getPrice(arr));
		}
	})
}


// 点击编辑
function asdf() {
	$('.address-wrap>img').on('click' ,function modeify(e) {
		$('p.remove-address').css('display', 'block');
		$('.container').css('display', 'none');
		$('.add-address-wrapper').css('display', 'flex');
		var id = parseInt($(e.delegateTarget).parent().attr('data-id'));
		$.ajax({
			url: '/address/model/' + id,
			headers: {Authorization: Cookies.get('token')},
			success: function(res){
				if(res.code !== 200) return;
				$('input.id').val(res.data.id);
				$('input.receive-name').val(res.data.receiveName);
				$('input.receive-phone').val(res.data.receivePhone);
				$('input.receive-region').val(res.data.receiveRegion);
				$('input.receive-detail').val(res.data.receiveDetail);
				$('.is-default').toggleClass('yes-default', Boolean(res.data.isDefault));
			}
		})
	})
}


// 事件委托表单页面
$('.add-address-wrapper')
	// 返回地址页面
	.on('click', '.add-header>span>img', function() {
		$('.container').css('display', 'flex');
		$('.add-address-wrapper').css('display', 'none');
	})
	// 默认地址
	.on('click', '.btn-default', function() {
		// var id = parseInt($('input.id').val());
		// $(this).addClass('checked').prev().css('background-color', 'rgb(180, 115, 31)').prev().css({'background-color': 'rgb(0, 150, 136)','left': '6vw'});
		$(this).toggleClass('checked').parent().toggleClass('yes-default');
	})
	// 删除
	.on('click', '.remove-address', function() {
		var aa = layer.open({
		title: [
			'提示',
			'background-color:#FFF; color:#333; font-size:4vw; text-align:center;padding: 0;border-bottom:none;'
		],
		anim: 'up',
		closeBtn: 0,
		content: '您确定要删除这个地址吗？',
		btn: ['取消', '确认'],
		yes: function(index, layero){
			layer.close(aa);
		},
		btn2: function(index, layero){
			$.ajax({
				url: '/address/remove/' + $('input.id').val(),
				headers: {Authorization: Cookies.get('token')},
				success: function(res) {
					if(res.code !== 200) {
						return;
					}
					setTimeout(getAddressAll(), 10);
					$('.container').css('display', 'flex');
					$('.add-address-wrapper').css('display', 'none');
				}
			})
			}
		});
	})
	// 保存
	.on('click', '.add-footer>button', function() {
		var id = parseInt($('input.id').val()),
			receiveName = $('input.receive-name').val().trim(),
			receivePhone = $('input.receive-phone').val().trim(),
			receiveRegion = $('input.receive-region').val().trim(),
			receiveDetail = $('input.receive-detail').val().trim(),
			isDefault = $('input.btn-default').hasClass('checked');
		// 判断是新增还是修改
		if(id) {
			if(isDefault) {
				$.ajax({
					url: '/address/set_default/' + id,
					headers: {Authorization: Cookies.get('token')},
					success: function(res) {
						if(res.code !== 200) {
							return;
						}
						// 提示成功
						// console.log($('address-wrapper span.isdefault-tip'));
						// $('address-wrapper span.isdefault-tip').css('display', 'none');
							$('.container').css('display', 'flex');
							$('.add-address-wrapper').css('display', 'none');
							$('.address-wrapper>div').each(function(i, item) {
								if(parseInt($(item).attr('data-id')) === id) {
									$(item).siblings().each(function(i, item) {
										$(item).find('span.isdefault-tip').css('display', 'none');
									})
									$(item).find('span.isdefault-tip').css('display', 'block');
								}
							})
					}
				})
			}
			$.ajax({
				type: 'post',
				url: '/address/update',
				headers: {Authorization: Cookies.get('token')},
				data: { id, receiveName, receivePhone, receiveRegion, receiveDetail },
				success: function(res) {
					if(res.code !== 200) return;
					// 提示成功
					// 减少请求
					// setTimeout(getAddressAll(), 10);
					
					var addressModeify = [{id: id, receiveName: receiveName, receivePhone: receivePhone, receiveRegion: receiveRegion, receiveDetail: receiveDetail, isDefault: isDefault}];
					$('.address-wrapper>div').each(function(i, item) {
						// parseInt($(item).attr('data-id'));
						if(parseInt($(item).attr('data-id')) === id) {
							$(item).replaceWith(getAddressAll(addressModeify));
							$('.container').css('display', 'flex');
							$('.add-address-wrapper').css('display', 'none');
						}
					})
				}
			})
		} else {
			$.ajax({
				type: 'post',
				url: '/address/add',
				headers: {Authorization: Cookies.get('token')},
				data: { receiveName, receivePhone, receiveRegion, receiveDetail },
				success: function(res) {
					if(res.code !== 200) return;
					// 提示成功
					if(isDefault) {
						$('address-wrapper span.isdefault-tip').css('display', 'none');
					}
					id = res.data;
					var addressModeify = [{id: id, receiveName: receiveName, receivePhone: receivePhone, receiveRegion: receiveRegion, receiveDetail: receiveDetail, isDefault: isDefault}];
					// $('.address-wrapper').appendTo(getAddressStr(addressModeify));
					$('.container').css('display', 'flex');
					$('.add-address-wrapper').css('display', 'none');
					// setTimeout(getAddressAll(), 10);
					
				}
			})
		}
	})
