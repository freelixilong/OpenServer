/*
	Log Level Field Cell widget
	Author: KaiLiu
*/

(function(app) {

	app.widget('LogLevelCell', function() {
		return app.view({
			template: [
				'<span class="log_severity_level log_severity_{{level}}"></span>'
			],

			initialize: function(options) {
				this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;
			},

			onShow: function() {
				var levelStr = this.rowModel.get(this.columnModel.get('name'));
				this.trigger('view:render-data', {level: levelStr});
			}

		});
	});

}) (Application);