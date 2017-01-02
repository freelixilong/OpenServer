(function(app) {
    app.widget('StatusCell', function() {
        return app.view({
            template: [
                '{{#is status "up"}}',
                '{{#if status_text}}',
                '<span class="{{up.icon}} green"></span><strong>{{status_text}}</strong>',
                '{{else}}',
                '<span class="{{up.icon}} green"> <a class="green" action="gridAction" event_name="{{up.eventName}}" target_id="{{target_id}}" href="javascript:void(0);">Bring Down</a></span>',
                '{{/if}}',
                '{{/is}}',

                '{{#is status "down"}}',
                '{{#if status_text}}',
                '<span class="{{up.icon}} green"></span><strong>{{status_text}}</strong>',
                '{{else}}',
                '<span class="{{down.icon}} red"> <a class="green" action="gridAction" event_name="{{down.eventName}}" target_id="{{target_id}}" href="javascript:void(0);">Bring Up</a></span>',
                '{{/if}}',
                '{{/is}}',
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    target_id: this.rowModel.get(this.idField),
                    status: this.rowModel.get(this.columnModel.get('name')),
                    status_text: this.rowModel.get('status_text'),
                }));
            }
        });
    });
})(Application);