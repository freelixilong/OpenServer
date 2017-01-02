;
(function(app) {
	app.widget('GridStringHeaderCell', function() {
		return app.view({
			initialize: function(options) {
				this.columnModel = options.columnModel;
			},
			onShow: function() {
				this.$el.html(this.columnModel.get("label"));
			}
		});
	});
})(Application);