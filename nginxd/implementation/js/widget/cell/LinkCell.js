(function(app) {
    app.widget('LinkCell', function() {
        return app.view({
            template: [
                '{{#is status "up"}}',
                '<span class="{{up.icon}} green"></span>',
                '{{else}}',
                '<span class="{{down.icon}} red"></span>',
                '{{/is}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    status: this.rowModel.get(this.columnModel.get('name')),
                }));
            }
        });
    });
})(Application);