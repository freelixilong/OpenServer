/**
 *config:
 *{
 *        label:"Action",
 *        customHeader:null,
 *        customCell:"action",
 *        actions:[
 *            {
 *                label:"Edit",
 *                eventName:"edit"
 *            },
 *            {
 *               label:"Delete",
 *                eventName:"delete"
 *            }
 *        ]
 *}
 **/

(function(app) {
    app.widget('GridActionCell', function() {
        return app.view({
            template: [
                '{{#each actions}}',
                '<button class="btn btn-primary" action="gridAction" event_name="{{eventName}}" target_id="{{../target_id}}">{{label}}</button> ',
                '{{/each}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;

                this.model = app.model();
                this.model.set(_.extend(this.columnModel.toJSON(), {
                    target_id: this.rowModel.get(this.idField),
                }));
            },
            onShow: function() {
                var that = this;

                var actions = this.columnModel.get('actions');
                _.each(actions, function(elem) {
                    if (elem.statusFlag) {
                        var flag = (that.rowModel.get(elem.statusFlag) == false);
                        that.$el.find('button[event_name=' + elem.eventName + ']').prop('disabled', flag);
                    }
                });
            }
        });
    });

    //the button tag cause some form to refresh, need to change to span with btn class
    //so add this cell and replace all action cell in the future.
    app.widget('SpanactionCell', function() {
        return app.view({
            template: [
                '{{#each actions}}',
                '<span class="btn btn-primary" action="gridAction" event_name="{{eventName}}" target_id="{{../target_id}}">{{label}}</span> ',
                '{{/each}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;

                this.model = app.model();
                this.model.set(_.extend(this.columnModel.toJSON(), {
                    target_id: this.rowModel.get(this.idField),
                }));
            },
            onShow: function() {
                var that = this;

                var actions = this.columnModel.get('actions');
                _.each(actions, function(elem) {
                    if (elem.statusFlag) {
                        var flag = that.rowModel.get(elem.statusFlag);
                        that.$el.find('span[event_name=' + elem.eventName + ']').prop('disabled', !flag);
                    }
                });
            }
        });
    });
})(Application);