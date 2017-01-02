(function(app) {
    app.widget('LockCell', function() {
        return app.view({
            template: [
                '{{#is status "lock"}}',
                '<i class="fa fa-lock fa-lg red"></i> <span><a action="unlock" href="javascript:void(0);">[UnLock]</a></span>',
                '{{/is}}',

                '{{#is status "unlock"}}',
                '<i class="fa fa-unlock fa-lg green"></i> <span><a action="lock" href="javascript:void(0);">[Lock]</a></span>',
                '{{/is}}',

                '{{#is status "disconnected"}}',
                '<i class="fa fa-exclamation-triangle red"></i> <span>Warning! Gateway can not be connected!</span>',
                '{{/is}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
            },
            onShow: function() {
                var that = this;
                app.remote({
                    entity: 'GatewayLockStatus',
                    _id: 'only',
                    params: {
                        gateway: that.rowModel.get('name'),
                    }
                }).done(function(data) {
                    that.data = data;
                    that.trigger('view:render-data', {
                        status: data && data.lockStatus ? data.lockStatus : 'unlock',
                    });
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    app.failCommon(jqXHR, textStatus, errorThrown);
                    that.trigger('view:render-data', {
                        status: 'disconnected',
                    });
                });
            },
            actions: {
                'unlock': function() {
                    var that = this;
                    app.remote({
                        entity: 'GatewayLockStatus',
                        params: {
                            gateway: that.rowModel.get('name'),
                        },
                        payload: {
                            _id: that.data && that.data.lockStatus ? 'only' : '',
                            lockStatus: 'unlock',
                            host: document.location.hostname + ':' + document.location.port,
                        }
                    }).done(function(data) {
                        that.data = data;
                        that.trigger('view:render-data', {
                            status: data.lockStatus,
                        });
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        app.failCommon(jqXHR, textStatus, errorThrown);
                    });
                },
                'lock': function() {
                    var that = this;
                    app.remote({
                        entity: 'GatewayLockStatus',
                        params: {
                            gateway: that.rowModel.get('name'),
                        },
                        payload: {
                            _id: that.data && that.data.lockStatus ? 'only' : '',
                            lockStatus: 'lock',
                            host: document.location.hostname + ':' + document.location.port,
                        }
                    }).done(function(data) {
                        that.data = data;
                        that.trigger('view:render-data', {
                            status: data.lockStatus,
                        });
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        app.failCommon(jqXHR, textStatus, errorThrown);
                    });
                }
            }
        });
    });
})(Application);