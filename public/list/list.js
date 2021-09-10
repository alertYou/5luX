(function() {
	var cid = parseInt($.query.get('cid')) || 17;
	var cName = $.query.get('cName');
	var name = '';	// 搜索框输入的字符串
	var orderCol = 'price';	// 排序方案：price|rate| sale
	var orderDir = 'asc';	// 排序方向: asc | desc
	var pageSize = 6;		// 每页显示多少条
	var isLoading = false;	// 标识有没有未完成的ajax
	var hasMore = true;		// 标识按当前条件看商品，还有没有更多可以看
	var scroll = null;		// 保存new IScroll的结果
	var isTriggerLoadMore = false;	// 表示在滚动中是否触发了加载更多
	
	$('.header>.top>p.list-title').text(cName);
   function updataTip() {
		if(isLoading)
			$('p.tip').text('————加载中...————');
		else if(isTriggerLoadMore)
			$('p.tip').text('————放手加载更多————');
		else if(hasMore)
			$('p.tip').text('————上拉加载更过————');
		else if($('ul.product-list>li').length === 0)
			$('p.tip').text('————暂无相关商品，敬请期待————');
		else
			$('p.tip').text('————没有更多商品了————')
   }
   function initOrRefreshScroll() {
		imagesLoaded($('.content')[0], function() {
			if(scroll === null) {
				scroll = new IScroll($('.content')[0], {
					deceleration: 0.003,	// 阻尼系数
					bounce: false,			// 关闭边界回弹
					probeType: 2,			// 开启滚动监听
					click: true
				});
				scroll.on('scroll', function() {
					if(isLoading || !hasMore) return;
					if(scroll.maxScrollY - scroll.y === 0) {
						isTriggerLoadMore = scroll.maxScrollY - scroll.y === 0
						updataTip();
					}
				});
				scroll.on('scrollEnd', function() {
					if(isTriggerLoadMore) {
						isTriggerLoadMore = false;
						getData(true);
					}
				});
			} else {
				scroll.refresh();			// 更新滚动
			}
		})
   }
   /*
   	公共函数获取商品数据(
   	1.刚进来				getData()
   	2.orderCol变化		getData()
   	3.orderDir变化		getData()
   	4.上拉加载更多时		getData(true)
   	5.点击搜索按钮时		getData()
   	)
   */
	function getData(isLoadMore = false) {
		isLoading = true;
		updataTip();
		if(!isLoadMore) {
			$('ul.product-list').empty();
			scroll && scroll.scrollTo(0,0,0);
		}
		// 发送ajax请求商品数据
		$.ajax({
			type: 'post',
			url: '/product/list',
			// ES6语法
			data: { name, cid, orderCol, orderDir,
					begin: $('ul.product-list>li').length,
					pageSize},
			success: function(res) {
				if(res.code !== 200)
					return;
				hasMore = res.data.length === pageSize;
				setTimeout(function() {
					var htmlStr = '';
					res.data.forEach(function(item) {
						htmlStr += getHtml(item);
					})
					$(htmlStr).appendTo('ul.product-list');
					initOrRefreshScroll();
					isLoading = false;
					updataTip();
				}, 400)
			}
		});
		function getHtml(detail) {
			return `
				<li>
					<a href="/detail/detail.html?pid=${detail.id}">
						<img src="${detail.avatar}" alt="" />
						<div class="detail-right">
							<h3 class="detail-name">${detail.name}</h3>
							<p class="detail-brief">${detail.brief}</p>
							<span class="detail-total-wrapper">
								￥<span class="detail-total">${detail.price}</span>
							</span>
							<p class="detail-rate-wrapper">
								<span class="detail-rate">${detail.rate}</span>条评论 | 
								已售出<span>${detail.sale}</span>个宝贝
							</p>
						</div>
					</a>
				</li>
			`;
		}
	}
	getData();
	
	// 排序切换
	$('.order-wrapper').on('click', 'li', function(e) {
		if(isLoading) {
			layer.msg('您的操作太频繁了！', {time: 1000, icon: 2});
			return;
		}
		if($(this).hasClass('active')) {
			orderDir = orderDir === "asc" ? "desc" : "asc";
			// console.log($(e.delegateTarget))
			$(e.delegateTarget).children().toggleClass("asc desc");
		} else {
			orderCol = $(this).attr("data-col");
			$(this).addClass('active').siblings('.active').removeClass('active');
		}
		getData();
	})
	
	$.ajax({
		url: '/category/list/1',
		success: function(res){
			var listStr = '';
			res.data.forEach(function(item) {
				listStr += listTitleStr(item);
			})
			$('.header>.title-wrapper>ul').html(listStr);
			new Swiper('.title-wrapper',{
				loop: true,
				slidesPerView : 5.5,
				// slidesPerGroup : 5.5,
			})
			function act() {
				$('.header>.title-wrapper>ul>li').each(function(i, item) {
				$(item).removeClass('act');
				if(parseInt($(item).attr('data-id')) === cid) {
					$(item).addClass('act');
					}
				})
			}
			act();
			$('.header>.title-wrapper>ul>li').on('click', function() {
				cid = parseInt($(this).attr('data-id'));
				cName = $(this).attr('cName');
				act();
				getData();
				$('.header>.top>p.list-title').text(cName);
			})
			
		}
	})
	function listTitleStr(item) {
		return `
			<li class="swiper-slide" data-id="${item.id}" cName="${item.name}">
				<img src="${item.avatar}" alt="" />
				<p>${item.name}</p>
			</li>
		`;
	}
	$('.header>.top>.btn-search').on('click', function() {
		var search = layer.open({
			type: 1,
			title: false,
			content: `
				<div class="search-wrapper">
					<div class="search-top">
						<span></span>
						<div>
							<span></span>
							<div class="swiper-container search-content-wrapper">
								<div class="swiper-wrapper search-content-list">
									<input class="swiper-slide search-list-term" value="电视机" type="text" />
									<input class="swiper-slide search-list-term" value="手机" type="text" />
									<input class="swiper-slide search-list-term" value="月饼限量" type="text" />
									<input class="swiper-slide search-list-term" value="电饭煲" type="text" />
									<input class="swiper-slide search-list-term" value="造梦者" type="text" />
								</div>
							</div>
						</div>
						<button>搜索</button>
					</div>
					<div class="">
						<h3></h3>
					</div>
				</div>`,
			closeBtn: 0,
			anim: 2,
			area: ['100%', '100%']
		})
		new Swiper ('.search-content-wrapper', {
		    direction: 'vertical', // 垂直切换选项
		    loop: true, // 循环模式选项
			autoplay: {
			delay: 3000,//1秒切换一次
			}
		})
		$('.search-top>span').on('click', function() {
			layer.close(search);
		})
	})
	$('.top>.btn-return').on('click', function() {
		window.location.href = document.referrer;
	})
	
})();

