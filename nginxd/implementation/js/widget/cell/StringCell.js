/**
*   options:[
        {
            value:,
            label:
        },...
    ]
*/
;
(function(app) {
    app.widget('GridStringCell', function() {
        return app.view({
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
            },
            onShow: function() {
                var cellValue = this.columnModel.get("value");
                if (this.columnModel.get("options")) {
                    _.each(this.columnModel.get("options"), function(option) {
                        if (option.value == cellValue) cellValue = option.label;
                    })
                }
                cellValue = _.escape(cellValue);
                this.$el.html(cellValue);
            }
        });

    });
})(Application);