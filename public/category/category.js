// 发ajax请求一级分类的数据，并动态渲染
$.ajax({
	// 键名是死的，须知每个键的含义	即键名不能写错
	type: "get",
	url: "/category/list/0",
	success: function(res) {
		if(res.code !== 200) {
			return;
		}
		var htmlStr = '';
		res.data.forEach(function(item) {
			htmlStr += `
				<li data-id="${item.id}" data-avatar="${item.avatar}">
					<span>${item.name}<span>
				</li>
			`;
		});
		$('ul.list-main').html(htmlStr).children('li').eq(0).trigger('click');
	}
});
// ul.list-main绑定点击事件实现一级分类切换
$('ul.list-main').on('click', function(e) {
	var $li = e.target.tagName === 'LI' ? $(e.target) : $(e.target).parent();
	if($li.hasClass('active')) return;
	$li.addClass('active').siblings('.active').removeClass('active');
	// 右上图片切换
	$('img.avatar').attr('src', $li.attr('data-avatar'));
	// 请求对应的二级菜单数据并渲染
	$.ajax({
		url: "/category/list/" + $li.attr('data-id'),
		success: function(res) {
			if(res.code !== 200) {
				console.log(res.msg);
				return;
			}
			$('ul.list-sub').empty();
			if(res.data.length) {
				$('p.tip').hide();
				var htmlStr = '';
				res.data.forEach(function(item) {
					htmlStr += `
						<li>
							<a href="/list/list.html?cid=${item.id}&cName=${item.name}">
								<img src="${item.avatar}">
								<p class="ellipsis">${item.name}</p>
							</a>
						</li>
					`;
				});
				$('ul.list-sub').html(htmlStr).show();
			} else {
				$('p.tip').show();
				$('ul.list-sub').hide();
			}
		}
	})
})