(function(app) {
    app.widget('PaddingOracleProtectionUrlCell', function() {
        return app.view({
            template: [
                '{{#is url true}}',
                '<tr><td><img src="themes/project/img/icon/icon_yes.gif" class="img-responsive" alt="Responsive image"></td></tr>',
                '{{else}}',
                '<tr><td><img src="themes/project/img/icon/icon_no.gif" class="img-responsive" alt="Responsive image"></td></tr>',
                '{{/is}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    url: this.rowModel.get(this.columnModel.get('name')),
                }));
            }
        });
    });
    app.widget('PaddingOracleProtectionParameterCell', function() {
        return app.view({
            template: [
                '{{#is parameter true}}',
                '<tr><td><img src="themes/project/img/icon/icon_yes.gif" class="img-responsive" alt="Responsive image"></td></tr>',
                '{{else}}',
                '<tr><td><img src="themes/project/img/icon/icon_no.gif" class="img-responsive" alt="Responsive image"></td></tr>',
                '{{/is}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    parameter : this.rowModel.get(this.columnModel.get('name')),
                }));
            }
        });
    });
    app.widget('PaddingOracleProtectionCookieCell', function() {
        return app.view({
            template: [
                '{{#is cookie true}}',
                '<tr><td><img src="themes/project/img/icon/icon_yes.gif" class="img-responsive" alt="Responsive image"></td></tr>',
                '{{else}}',
                '<tr><td><img src="themes/project/img/icon/icon_no.gif" class="img-responsive" alt="Responsive image"></td></tr>',
                '{{/is}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    cookie: this.rowModel.get(this.columnModel.get('name')),
                }));
            }
        });
    });
})(Application);
