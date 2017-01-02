/**
 * signatures advanced status cell
 **/
;
(function(app) {
    app.widget('SignaturesstatusCell', function() {
        return app.view({
            template: '{{{signatureStatus target_id global_status group_status has_filter}}}',
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;

                this.model = app.model();
                this.model.set(_.extend(this.columnModel.toJSON(), {
                    target_id: this.rowModel.get(this.idField),
                    global_status: this.rowModel.get("global_status"),
                    group_status: this.rowModel.get("group_status"),
                    has_filter: this.rowModel.get("has_filter")
                }));
            },
            events: {
                "click": function(e) {
                    var $btn = $(e.target);
                    if (!$btn.attr("action") && $btn.parents(".popover").length > 0) e.stopPropagation();
                }
            }
        });
    });


})(Application);

Handlebars.registerHelper('signatureStatus', function(_id, global_status, group_status, has_filter) {
    var _html = '<a href="javascript:void(0);" action="gridAction"  event_name="showStatus" target_id="' + _id + '">';
    if (global_status && group_status) {
        _html += '<span style="font-weight:bold;color:green"><i class="fa fa-check"></i></span>';
        _html += 'Enable';

        if (has_filter) {
            _html = '<a href="javascript:void(0);" action="gridAction"  event_name="showStatus" target_id="' + _id + '">';
            _html += '<img src="themes/project/img/icon/signature_exception.png">';
            _html += 'Enable';
        }
    } else {
        _html += '<span style="font-weight:bold;color:red"><i class="fa fa-ban"></i></span>';
        _html += 'Disable';
    }
    _html += '</a>';
    return _html;
});