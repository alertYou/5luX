function debounce(fun, time) {
	var lock = false;
	return function(e) {
		if(lock) return;
		lock = true;
		setTimeout(function() {lock = false;}, time);
		fun.call(this, e);
	};
}