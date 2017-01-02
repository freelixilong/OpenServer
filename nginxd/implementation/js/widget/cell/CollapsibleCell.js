/**
 *CollapsibleCell for CollapsibleList widget
 *by Nan Mou
 */
(function(app) {
    app.widget('CollapsibleCell', function() {
        return app.view({
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.collapsed = false;
            },
            onRender: function() {
                var icon = this.collapsed ? "fa-chevron-right" : "fa-chevron-down";
                this.$el.html("<i class='fa " + icon + "' action='collapse' style='cursor:pointer'></i> " + this.columnModel.get("value"));
            },
            onCollapse: function() {
                this.collapsed = !this.collapsed;
                this.parentCt.trigger("view:collapse", this.collapsed);
                this.render();
            },
            actions: {
                collapse: function() {
                    this.onCollapse();
                }
            }
        });
    });
})(Application);