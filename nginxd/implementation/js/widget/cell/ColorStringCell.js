(function(app) {
	app.widget('ColorStringCell', function() {
		return app.view({
			template: [
				'{{#is color 1}}',
				'<span style="color:green">{{string}}</span>',
				'{{/is}}',

				'{{#is color 2}}',
				'<span style="color:yellow">{{string}}</span>',
				'{{/is}}',

				'{{#is color 3}}',
				'<span style="color:red">{{string}}</span>',
				'{{/is}}',
			],
			initialize: function(options) {
				this.columnModel = options.columnModel;
				this.rowModel = options.rowModel;
			},
			onShow: function() {
				this.trigger('view:render-data', {
					color: this.rowModel.get('color'),
					string: this.rowModel.get(this.columnModel.get('name')),
				});
			}
		});
	});
})(Application);