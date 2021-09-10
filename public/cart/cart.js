// 去登陆 || 去首页
if(!Cookies.get('name')) {
	$('.not-logon>div').text('去登陆').on('click', function() {
		window.location.href = '/login/login.html';
	})
	$('.cater-list-wrapper').css('display', 'none');
	$('.header>div>div').css('visibility', 'hidden');
} else {
	$.ajax({
		type : 'post',
		url: '/cart/list',
		headers: {Authorization: Cookies.get('token')},
		success: function(res) {
			if(!res.data) {
				$('.header>div>div').css('visibility', 'hidden');
				$('.not-logon>div').text('去首页逛逛').on('click', function() {
					window.location.href = '/home/index.html';
				})
			} else {
				tilte(res);
				var liStr = '';
				function getHtmlli(detail) {
					return `
						<li data-pid="${detail.pid}" data-id="${detail.id}" data-cid="${detail.cid}">
							<span data-pid="${detail.pid}" class="checkbox"></span>
							<span data-pid="${detail.pid}" class="checkbox-del"></span>
							<img src="${detail.avatar}" alt="" />
							<div class="product-detail">
								<p class="product-name">${detail.name}</p>
								<div class="product-price-wrapper">
									<span class="price-wrapper">￥<span class="price">${detail.price}</span>.00</span>
									<span class="product-count-wrapper">
										<button class="decrease" ${detail.count=== 1 ? 'disabled' : ""}><i class="iconfont icon-jian"></i></button>
										<input class="product-count" type="text" value="${detail.count}" />
										<button class="increase" ${detail.count=== 5 ? 'disabled' : ""}><i class="iconfont icon-jia"></i></button>
									</span>
								</div>
							</div>
						</li>
					`;
				}
				var detail = res.data,
					total = 0;
				detail.forEach(function(item) {
					liStr += getHtmlli(item);
					total += item.price * item.count;
				})
				setTimeout(function() {
					$('ul.similar-list').html(liStr);
				},100);
				$('.header>div>div').css('visibility', 'visible');
				$('.not-logon').css('display', 'none');
				$('.cater-list-wrapper').css('display', 'flex');
			}
			increase(detail);
			remove(res);
		}
	})
}
function increase(detail) {
	$('.cater-list-wrapper')
	// 减
	.on('click', 'button.decrease', function() {
		var id = parseInt($(this).closest('li').attr('data-id'));
		$.ajax({
			type: 'post',
			url: '/cart/decrease/' + $(this).closest('li').attr('data-id'),
			headers: {Authorization: Cookies.get('token')},
			success: function(res){
				if(res.code !== 200) return;
				var count = --detail.find(function(item) {
					return item.id === id;
				}).count;
				if(count === 1) {
					$(this).attr('disabled', 'disabled');
				}
				$(this).siblings('.product-count').val(count);
				$(this).next().next().attr('disabled', false);
			}.bind(this)
		})
		updataTotal();
		getSumUp();
	})
	// 加
	.on('click', 'button.increase', function() {
		var id = parseInt($(this).closest('li').attr('data-id'));
		$.ajax({
			type: 'post',
			url: '/cart/increase/' + $(this).closest('li').attr('data-id'),
			headers: {Authorization: Cookies.get('token')},
			success: function(res){
				if(res.code !== 200) return;
				var count = ++detail.find(function(item) {
					return item.id === id;
				}).count;
				if(count === 5) {
					$(this).attr('disabled', 'disabled');
				}
				$(this).siblings('.product-count').val(count);
				$(this).prev().prev().attr('disabled', false);
			}.bind(this)
		})
		updataTotal();
		getSumUp();
	})
	// 结算选择按钮
	.on('click', 'span.checkbox', function() {
		// 判断点的是商品还是商品组
		if($(this).parent().hasClass('cater-list-title')) {
			$(this).toggleClass('checked').parent().next().find('span.checkbox').toggleClass('checked', $(this).hasClass('checked'));
		} else {
			$(this).toggleClass('checked');
			if(!$(this).parents('ul.similar-list').find('span.checkbox:not(".checked")').length) {
				$(this).parents('ul.similar-list').prev().children('span.checkbox').addClass('checked');
				
			}else {
				$(this).parents('ul.similar-list').prev().children('span.checkbox').removeClass('checked');
			}
		}
		listCheckbox();
		updataTotal();
		getSumUp();
	}).bind(detail)
	// 删除选择按钮
	.on('click', 'span.checkbox-del', function() {
		// 判断点的是商品还是商品组
		if($(this).parent().hasClass('cater-list-title')) {
			$(this).toggleClass('checked').parent().next().find('span.checkbox-del').toggleClass('checked', $(this).hasClass('checked'));
		} else {
			$(this).toggleClass('checked');
			if(!$(this).parents('ul.similar-list').find('span.checkbox-del:not(".checked")').length) {
				$(this).parents('ul.similar-list').prev().children('span.checkbox-del').addClass('checked');
			}else {
				$(this).parents('ul.similar-list').prev().children('span.checkbox-del').removeClass('checked');
			}
		}
		listCheckboxDel();
		updataTotal();
		getSumUp();
	}).bind(detail);
}

// 总金额
function updataTotal() {
	setTimeout(function() {
		$.ajax({
			type : 'post',
			url: '/cart/list',
			headers: {Authorization: Cookies.get('token')},
			success: function(res) {
				var detail = res.data
				var arr = [],
					sum = 0,
					term = '';
				$('ul.similar-list span.checked').each(function(i, item) {
					arr[i] = parseInt($(item).attr('data-pid'));
				})
				arr.forEach(function(item) {
					term = detail.find(function(detail) {
						return item === detail.pid;
					})
					sum += term.price * term.count;
				})
				$('.total').text(sum);
			}
		})
	}, 100)
}
// 复选按钮结算
function listCheckbox() {
	if(!$('.cater-list>li>div.cater-list-title>span.checkbox:not(".checked")').length) {
		$('.cater-settlement-checkbox>span.checkbox').addClass('checked');
	} else {
		$('.cater-settlement-checkbox>span.checkbox').removeClass('checked');
	}
}
// 复选按钮删除
function listCheckboxDel() {
	if(!$('.cater-list>li>div.cater-list-title>span.checkbox-del:not(".checked")').length) {
		$('.cater-settlement-checkbox>span.checkbox-del').addClass('checked');
	} else {
		$('.cater-settlement-checkbox>span.checkbox-del').removeClass('checked');
	}
}
// 全选结算
$('.cater-settlement-checkbox>span.checkbox').on('click', function() {
	$(this).toggleClass('checked');
	$('.cater-list span.checkbox').toggleClass('checked', $(this).hasClass('checked'));
})
// 全选删除
$('.cater-settlement-checkbox>span.checkbox-del').on('click', function() {
	$(this).toggleClass('checked');
	$('.cater-list span.checkbox-del').toggleClass('checked', $(this).hasClass('checked'));
})
// 删除复选框
$('.cater-settlement-checkbox>span.checkbox-del').on('click', function() {
	$(this).toggleClass('checked');
	$('.cater-list span.checkbox-del').toggleClass('checked', $(this).hasClass('checked'));
})
// 编辑切换
$('.header>div>div').on('click', function() {
	// $('span.checked').removeClass('checked');
	$(this).toggleClass('edit');
	$('.cater-list').toggleClass('del');
	$('.similar-list').toggleClass('del');
	$('.cater-settlement-checkbox').toggleClass('del');
	$('.cater-settlement-total-wrapper').toggleClass('money');
})
// 删除
function remove(res) {
	var id = [];
	$('button.btn-remove').on('click', function() {
		$('.similar-list>li span.checked.checkbox-del').each(function(i, item) {
			id[i] = $(item).parent().attr('data-id');
		});
		$.ajax({
			type: 'post',
			url: '/cart/remove',
			data: {
				ids: id
			},
			headers: {Authorization: Cookies.get('token')},
			success: function(res) {
				if(res.code !== 200)
					return;
				$('.similar-list>li span.checked.checkbox-del').each(function(i, item) {
					$(item).parent().remove();
					$('.cater-list>li').each(function(i, item) {
						if($(item).find('.similar-list span.checkbox').length === 0)
							$(item).remove();
					})
				});
				if($('.cater-list>li').length === 0) {
					getToIndex();
				}
			}
		})
	})
}
// 总数量
function getSumUp() {
	setTimeout(function() {
		var sum = 0;
		var ids = []; 
		if(!$('.similar-list span.checked').length) {
			$('.btn-total>p').css('display', 'none');
			return;
		}
		$('.similar-list span.checked').each(function(i, item) {
			ids[i] = parseInt($(item).nextAll('.product-detail').find('.product-count').val());
		})
		ids.forEach(function(item) {
			sum += item;
		})
		$('.btn-total>p').css('display', 'inline-block');
		$('.btn-total>p>span').text(sum);
		
	}, 100)
	}
// 分组渲染
function tilte(res) {
	var cid = [];
	res.data.forEach(function(item,i) {
		cid[i] = item.cid;
	});
	for(var i = cid.length-1; i >= 0; i--) {
		for(var j = i-1; j >= 0; j--) {
			if(cid[i] === cid[j])
			cid.splice(j, 1);
		}
	}
	var listName = [],
		list = {};
	var product = [];
	$.ajax({
		url: '/category/all',
		success: function(res) {
			product = res.data;
			cid.forEach(function(cid, i) {
				list.cid = cid;
				list.name = product.find(function(product){
					return product.id === cid;
				})
				listName[i] = list;
			})
			var htmlStr = '';
			function getHtml(product) {
				return `
					<li data-cid="${product.cid}">
						<div data-id="${product.cid}" class="cater-list-title">
							<span class="checkbox"></span>
							<span class="checkbox-del"></span>
							<p class="title-name">${product.name.name}</p>
						</div>
						<ul class="similar-list">
						</ul>
					</li>
				`;
			}
			if(listName.length === 0) {
				getToIndex();
			}
			listName.forEach(function(item) {
				htmlStr += getHtml(item);
			})
			$('ul.cater-list').html(htmlStr);
		}
	})
}
function getToIndex() {
	$('.header>div>div').css('visibility', 'hidden');
	$('.not-logon>div').text('去首页逛逛').on('click', function() {
		window.location.href = '/home/index.html';
	})
	$('.cater-list-wrapper').css('display', 'none');
	$('.not-logon').css('display', 'block');
}
// 返回
$('.header>div>img').on('click', function() {
	window.location.href = document.referrer;
})
// 结算
$('.btn-total').on('click', function() {
	console.log($('.similar-list span.checked').length)
	if(!$('.similar-list span.checked').length) {
		layer.msg('请勾选商品！');
		return;
	}
	var id = [];
	$('.similar-list span.checked').each(function(i, item) {
		id[i] = parseInt($(item).parent().attr('data-id'));
	})
	window.location.href = `/order_conform/order_conform.html?id=${id}`;
})