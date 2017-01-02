;
(function(app) {
	app.failCommon = function(jqXHR, textStatus, errorThrown) {


		if (401 === jqXHR.status) {
			location.href = "/login.html";
		} else {
			if (jqXHR.responseJSON && jqXHR.responseJSON.msg) {
				//TODO: for the double Notify
				// app.trigger("app:notify", {
				// 	type: "confirm",
				// 	msg: jqXHR.responseJSON.msg,
				// });
				alert(jqXHR.responseJSON.msg);
			} else {
				app.trigger("app:notify", {
					type: "error",
					msg: jqXHR.statusText,
				});
			}
		}
	}
})(Application);
