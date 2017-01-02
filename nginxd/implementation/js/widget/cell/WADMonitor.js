(function(app) {
    app.widget('EnableMonitorCell', function() {
        return app.view({
            template: [
                '{{#is status true}}',
                '<tr><td><img src="themes/project/img/icon/st_ok.gif" class="img-responsive" alt="Responsive image"></td><td>Enabled</td></tr>',
                '{{else}}',
                '<tr><td><img src="themes/project/img/icon/st_na.gif" class="img-responsive" alt="Responsive image"></td><td>Disabled</td></tr>',
                '{{/is}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    target_id: this.rowModel.get(this.idField),
                    status: this.rowModel.get(this.columnModel.get('name')),
                    status_text: this.rowModel.get('status_text'),
                }));
            }
        });
    });
})(Application);
