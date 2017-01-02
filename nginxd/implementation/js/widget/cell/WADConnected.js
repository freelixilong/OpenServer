(function(app) {
    app.widget('ConnectedCell', function() {
        return app.view({
            template: [
                '{{#is status true}}',
                '<img src="themes/project/img/icon/connect_green.gif" class="img-responsive" alt="Responsive image">',
                '{{else}}',
                '<img src="themes/project/img/icon/connect_red.gif" class="img-responsive" alt="Responsive image">',
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
