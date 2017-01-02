/*
 @author qxyang
 @create 2015.03.04
*/
(function(app) {
	app.widget('ChangedhrefCell', function() {
		return app.view({
			template: [
				'{{#if canChangedList}}',
				'<a href="javascript:void(0);" action="gridAction" event_name="changelist" target_id={{id}}>{{totalChanged}}</a>',
				'{{else}}',
				'{{totalChanged}}',
				'{{/if}}'
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
