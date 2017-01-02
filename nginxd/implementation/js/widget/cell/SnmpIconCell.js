(function(app) {
    app.widget('SnmpIconCell', function() {
        return app.view({
            template: [
                '{{#is status true}}',
                '<i class="fa fa-check-circle fa-lg green"></i>',
                '{{else}}',
                '<i class="fa fa-times-circle fa-lg gray"></i>',
                '{{/is}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    status: this.rowModel.get(this.columnModel.get('name')),
                }));
            }
        });
    });
})(Application);