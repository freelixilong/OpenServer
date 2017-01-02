/*
 @author zqqiang
 @create 2014.06.18
*/

(function(app) {
	app.widget('HrefCell', function() {
		return app.view({
			template: [
				'{{#if blank}}',
				'<a href="{{url}}" target="_blank">{{name}}</a>',
				'{{else}}',
				'<a action="jumpInlineProfile" href="javascript:void(0);">{{name}}</a>',
				'{{/if}}'
			],
			initialize: function(options) {
				this.columnModel = options.columnModel;
				this.rowModel = options.rowModel;
			},
			onShow: function() {
				this.trigger('view:render-data', this.rowModel.toJSON());
			}
		});
	});
})(Application);