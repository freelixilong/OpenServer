(function(app) {
	app.widget('LogHeaderCell', function() {
		return app.view({
			initialize: function(options) {
				this.columnModel = options.columnModel;
			},
			onShow: function() {
				var label = this.columnModel.get('label');
				var name = this.columnModel.get('name');
				this.$el.html('<span action="showFilter" key="' + name + '" ><img style="cursor:pointer;" src="themes/project/img/icon/filter-grey.gif">' + label + '</span>');
			},
			actions: {
				showFilter: function($btn) {
					var key = $btn.attr('key');
					app.currentContext.deviceContent.currentView.deviceContent.currentView.trigger('view:show-filter', key);
				}
			}
		});
	});
})(Application);