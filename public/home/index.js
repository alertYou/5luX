new Swiper('.banner', {
	loop: true,
	autoplay: {
		delay: 3000,
		disableOnInteraction: false
	},
	freeMode: false,
	pagination: {
		el: '.banner>.swiper-pagination',
		type: 'bullets'
	},
	// navigation: {
	// 	prevEl: '.banner>.swiper-button-prev',
	// 	nextEl: '.banner>.swiper-button-next'
	// }
});
