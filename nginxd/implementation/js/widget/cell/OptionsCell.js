(function(app) {
    app.widget('OptionsCell', function() {
        return app.view({
            initialize: function(options) {
                this.columnModel = options.columnModel;
            },
            onShow: function() {
                var cellValue = this.columnModel.get("value");

                if (this.columnModel.get('dataSrc')) {
                    var that = this;
                    app.remote({
                        entity: this.columnModel.get('dataSrc')
                    }).done(function(data) {
                        _.each(data, function(object) {
                            if (cellValue === object.value) {
                                that.$el.html(object.name);
                            }
                        });
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        app.failCommon(jqXHR, textStatus, errorThrown);
                    });
                }

                var that = this;
                var options = this.columnModel.get('options');
                if (options) {
                    _.each(options.data, function(object) {
                        if (cellValue === object.value) {
                            that.$el.html(object.label);
                        }
                    });
                }
            }
        });
    });
})(Application);