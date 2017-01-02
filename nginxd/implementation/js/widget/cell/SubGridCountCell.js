;
(function(app) {
	app.widget('SubgridcountCell', function() {
		return app.view({
			template: '<span ui="count"></span>',
			initialize: function(options) {
			},
			onShow: function() {
				var that = this;
				var subcontextName = this.options.columnModel.get('maincontextName') + "/" + this.options.rowModel.get(this.options.idField) + "/" + this.options.columnModel.get('subPath');
				app.remote({
					entity: subcontextName,
				}).done(function(data, textStatus, jqXHR) {
					that.ui.count.text(data.length);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					app.failCommon(jqXHR, textStatus, errorThrown);
				});
				
			}
		});
	});
})(Application);