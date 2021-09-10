if(!Cookies.get('token')) {
	window.location.href = '/login/login.html';
}
function getAddressAll(){
	$.ajax({
		url: '/address/list',
		headers: {Authorization: Cookies.get('token')},
		success: function(res){
			if(res.code !== 200) {
				return;
			}
			if(!res.data.length) {
				$('.content-wrapper').addClass('address-no');
			} else {
				$('.content-wrapper').removeClass('address-no');
				$('.address-wrapper').html(getAddressStr(res.data));
				$('span.btn-modeify').on('click', function(e) {
					modeify(e);
				})
			}
		}
	})
}
getAddressAll();
// 渲染地址信息
function getAddressStr(address) {
	var htmlStr = '';
	address.forEach(function(item) {
		var phone = item.receivePhone.slice(0, 3) + '****' + item.receivePhone.slice(8, 12);
		htmlStr += `
			<div class="" data-id="${item.id}">
				<div class="address-detail">
					<div class="name-wrapper">
						<span class="name">${item.receiveName}</span>
						<p class="phone">${phone}</p>
					</div>
					<div class="address">
						<span class="isdefault-tip" style="display: ${item.isDefault ? 'block' : 'none' };">默认</span>
						<p>${item.receiveRegion} ${item.receiveDetail}</p>
					</div>
				</div>
				<span class="btn-modeify">
					<img src="/images/icon_edit_gray.png" alt="" />
				</span>
			</div>
		`;
	});
	return htmlStr;
}
// 点击添加
$('.add-address').on('click', function() {
	$('.container').css('display', 'none');
	$('.add-address-wrapper').css('display', 'flex');
	$('form')[0].reset();
	$('input.id').val(0);
})
// 点击编辑
function modeify(e) {
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
		if(!receiveName && !receivePhone && !receiveRegion && !receiveDetail) {
			layer.msg('请完整填写内容！');
			return;
		}
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
							$('.container').css('display', 'flex');
							$('.add-address-wrapper').css('display', 'none');
							getAddressAll();
							$(item).replaceWith(getAddressAll(addressModeify));
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
					// $('.container').css('display', 'flex');
					// $('.add-address-wrapper').css('display', 'none');
					// $('.address-wrapper').appendTo(getAddressStr(addressModeify));
					// setTimeout(getAddressAll(), 10);
					setTimeout(getAddressAll(), 10);
					$('.container').css('display', 'flex');
					$('.add-address-wrapper').css('display', 'none');
					
				}
			})
		}
	})
// 返回
$('.header-wrapper>span>img').on('click', function() {
	window.location = document.referrer;
})
// 获取指定商品的信息
// function getProductDetail(id) {
// 	var product = '';
// 	setTimeout(function() {
// 		$.ajax({
// 			url: '/address/model/' + id,
// 			headers: {Authorization: Cookies.get('token')},
// 			success: function(res){
// 				product = res;
// 				console.log(product)
// 				return product;
// 			}
// 		})
// 		return product;
// 	})
// }