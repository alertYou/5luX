var $loginForm = $('form.login').Validform({
	tiptype: 3
});
$('input').focus(function() {
	$(this).css('border', '1px solid #0f77ff')
});
$('input').blur(function() {
	$(this).css('border', '1px solid transparent')
});
$('button.btn-login').on('click', function() {
	if(!$loginForm.check(false)) return;
	// 发送ajax，进行请求
	$.ajax({
		type: 'post',
		url: '/user/login_pwd',
		data: {
			name: $('input.name').val().trim(),
			pwd: $('input.pwd').val().trim()
		},
		success: function(res) {
			if(res.code !== 200) {
				 layer.msg(res.msg);
				return;
			}
			Cookies.set('token', res.data);
			Cookies.set('name', $('input.name').val().trim());
			window.location.replace(document.referrer || '/home/index.html');
		}
	})
})
$('.header-left').on('click', function() {
		var i = layer.open({
			type: 1,
			area: ['100%', '100%'],
			content: `<div class="language">
					<span><img src="/images/return.png" /></span>
					<dl>
						<dt>选择语言</dt>
						<dd>中文(简体)</dd>
						<dd>中文(繁体)</dd>
						<dd>English</dd>
					</dl>
				</div>`,
			anim: 2,
			shade: [0.5, '#000'],
			title: null,
			closeBtn: 0,
			offset: 'b',
			style: 'position:fixed; bottom:0; left:0; width: 100%; height: 200px; padding:10px 0; border:none;'
		});
		$('.language>span').on('click', function() {
			layer.close(i);
	  });
})
// 点击手机号登录
$('.toggle-wrapper .phone-login').on('click', function() {
	$('.user-name').toggleClass('show');
	$('.user-phone').toggleClass('show');
	$(this).parent().css('display', 'none').next().css('display', 'flex');
})
// 点击立即注册
$('.toggle-wrapper>ul>li:nth-child(3)').on('click', function() {
	$('div.logon').css('display', 'block');
	$('div.login').css('display', 'none');
})
$('.toggle-wrapper>div>p:nth-child(2)').on('click', function() {
	$('div.logon').css('display', 'block');
	$('div.login').css('display', 'none');
})
// 点击用户名密码
$('.toggle-wrapper>div>p:nth-child(1)').on('click', function() {
	$('.user-name').toggleClass('show');
	$('.user-phone').toggleClass('show');
	$(this).parent().css('display', 'none').prev().css('display', 'flex');
})
// $('.toggle-wrapper').on('click', function() {
// 	layer.msg('暂无此功能！');
// })
$('.footer>ul>li>i').on('click', function() {
	layer.msg('暂无此功能！');
})
$('.header-right').on('click', function() {
	layer.msg('暂无此功能！');
})

var $logonForm = $('form.logon').Validform({
	tiptype: 3
});
// 判断用户名是否存在
$('form.logon>.name>input').blur(function() {
	$.ajax({
		url: '/user/check_name/' + $(this).val(),
		success: function(res) {
			if(res.data === 1) {
				layer.msg('该用户名已被使用', function(){
				//关闭后的操作
				});
			}
		}
	})
})
// 判断手机号
$('form.logon>.phone>input').blur(function() {
	$.ajax({
		url: '/user/check_phone/' + parseInt($(this).val()),
		success: function(res) {
			if(res.data === 1) {
				layer.msg('该手机号已被注册', function(){
				//关闭后的操作
				});
			}
		}
	})
})
// 点击注册按钮
$('button.btn-logon').on('click', function() {
	var name = $('.logon .name>input').val(),
		phone = parseInt($('.logon .phone>input').val()),
		pwd = $('.logon .pwd-wrapper>input').val();
	$.ajax({
		type: 'post',
		url: '/user/register',
		data: {
			name, pwd, phone
		},
		success: function(res) {
			if(res.code === 200) {
				layer.msg('注册成功', function(){
				//关闭后的操作
				});
			$('div.logon').css('display', 'none');
			$('div.login').css('display', 'block');
			}
		}
	})
})
// 注册返回
$('.logon-header>img').on('click', function() {
	$('div.logon').css('display', 'none');
	$('div.login').css('display', 'block');
})