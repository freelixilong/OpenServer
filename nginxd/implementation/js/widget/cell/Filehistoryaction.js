/*
 @author tlliu
 @create 2016.01.04
*/
(function(app) {
	app.widget('FilehistoryactionCell', function() {
		return app.view({
			template: [
				'{{displayaction}}',
			],
			initialize: function(options) {
				this.columnModel = options.columnModel;
				this.rowModel = options.rowModel;
			},
			onShow: function() {
                var cellValue = this.columnModel.get("value");
				if(cellValue=="file_mod"){
					this.columnModel.set("value","Changed");
					this.rowModel.set("displayaction","Changed");
				} else if(cellValue=="file_add"){
					this.columnModel.set("value","Added");
					this.rowModel.set("displayaction","Added");
				}
				this.trigger('view:render-data', this.rowModel.toJSON());
			},
		});
	});
})(Application);
