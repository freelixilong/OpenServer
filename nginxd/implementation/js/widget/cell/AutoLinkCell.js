(function(app) {
    app.widget('AutoLinkCell', function() {
        return app.view({
            template: [
                '{{#is status "up"}}',
                '<span class="{{up.icon}} green"></span>',
                '{{/is}}',

                '{{#is status "down"}}',
                '<span class="{{down.icon}} red"></span>',
                '{{/is}}',

                '{{#is status "unauth"}}',
                '<span class="{{down.icon}} red"> Unauthorized</span>',
                '{{/is}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
            },
            onShow: function() {
                var entity = this.columnModel.get('entity');
                var that = this;
                app.trigger('app:set-cookie', {
                    key: 'device',
                    value: that.rowModel.get('name')
                });
                app.remote({
                    entity: entity,
                }).done(function(data) {
                    that.trigger('view:render-data', _.extend(that.columnModel.toJSON(), {
                        status: 'up',
                    }));
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status === 420) {
                        that.trigger('view:render-data', _.extend(that.columnModel.toJSON(), {
                            status: 'unauth',
                        }));
                    } else {
                        that.trigger('view:render-data', _.extend(that.columnModel.toJSON(), {
                            status: 'down',
                        }));
                    }
                });
            }
        });
    });
})(Application);