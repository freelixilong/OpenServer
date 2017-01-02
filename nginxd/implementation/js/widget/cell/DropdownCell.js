;(function(app){ 
    app.widget('DropdownCell', function(){
        return app.view({
            initialize: function(options){
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
            },
            onRender: function(){
                var cellValue = this.columnModel.get("value");
                if (0 === this.rowModel.get("portId")) {
                    var target_id = this.rowModel.get("_id");
                    this.$el.html("<i class='fa fa-chevron-right' action='gridAction' event_name='collapse' target_id='" + target_id + "' style='cursor:pointer'></i> <b>" + cellValue + "</b>");
                } else {
                    this.$el.html(cellValue);
                }
            }
        });
    });
})(Application);