;
(function(app) {
	app.onSetCookie = function(options) {
		document.cookie = options.key + '=' + options.value;
	};
	app.onDeleteCookie = function(key) {
		document.cookie = key + '=';
	};
})(Application);