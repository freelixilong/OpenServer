/*
 @author zqqiang
 @create 2014.07.21
*/

(function(app) {
    app.widget('ServerPolicyStatusCell', function() {
        return app.view({
            template: [
                '{{#is status "run"}}',
                '<img src="themes/project/img/icon/st_ok.gif" class="img-responsive" alt="Responsive image">',
                '{{else}}',
                '<img src="themes/project/img/icon/st_na.gif" class="img-responsive" alt="Responsive image">',
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