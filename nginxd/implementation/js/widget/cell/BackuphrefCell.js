/*
 @author qxyang
 @create 2015.03.04
*/
(function(app) {
	app.widget('BackuphrefCell', function() {
		return app.view({
			template: [
				'{{#if canBackupList}}',
				'<a href="javascript:void(0);" action="gridAction" event_name="backuplist" target_id={{id}}>{{totalBackup}}</a>',
				'{{else}}',
				'{{totalBackup}}',
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
