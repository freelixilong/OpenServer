/*
 @author qxyang
 @create 2015.03.04
*/

(function(app) {
	app.widget('NamehrefCell', function() {
		return app.view({
			template: [
				'<a href="javascript:void(0);" action="gridAction" event_name="view" target_id={{id}}>{{name}}</a>',
			],
			initialize: function(options) {
				this.columnModel = options.columnModel;
				this.rowModel = options.rowModel;
			},
			onShow: function() {
				this.trigger('view:render-data', this.rowModel.toJSON());
			},
		});
	});
})(Application);
