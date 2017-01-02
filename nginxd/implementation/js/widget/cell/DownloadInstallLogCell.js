/**
*config:
*    {
*       label: '',
*       name: '',
*       customCell: 'downloadinstalllog',
*       customHeader: null
*    }
**/
(function(app){ 
    app.widget('DownloadinstalllogCell', function(){
        return app.view({
            template: [
               '{{#if value}}',
                '<span>',
                          '<a action="download" target_id="{{value}}" href="javascript:void(0);">{{value}}</a> ',
                '</span>',
                '{{/if}}'
            ],
            initialize: function(options){
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    downloadinstalllog: this.rowModel.get(this.columnModel.get('name'))
                }));
            },
            actions: {
                'download': function($triggerTag, e) {
                    location.href = '/data/fs?name=' + e.currentTarget.getAttribute('target_id');
                }
            }    
        });
    });
})(Application);
