/**
*config:
*    {
*       label: '',
*       name: 'otherformats',
*       customCell: 'browsedownload',
*       customHeader: null
*    }
**/
(function(app){ 
    app.widget('BrowsedownloadCell', function(){
        return app.view({
            template: [
               '{{#if otherformats}}',
                '<span>',
                     '{{#each otherformats}}',
                          '<a action="download" target_id={{name}}>{{label}}</a> ',
                     '{{/each}}',
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
                    otherformats: this.rowModel.get(this.columnModel.get('name'))
                }));
            },
            actions: {
                'download': function($triggerTag, e) {
                    location.href = '/data/ReportBrowse?file=' + e.currentTarget.getAttribute('target_id');
                }
            }    
        });
    });
})(Application);