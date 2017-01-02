/**
*config:
*    {
*		label: '',
*		name: 'reportfiles',
*		customCell: 'reportbrowse',
*		customHeader: null,
*		main: {
*			icon: 'glyphicon glyphicon-chevron-right',
*			eventName: 'nodeClick'
*		}	
*    }
**/
(function(app){ 
    app.widget('ReportbrowseCell', function(){
        return app.view({
        	template: [
        		'{{#if reportfiles}}',
        		'{{#is reportflag "main"}}',
                '<span class="{{main.icon}}" main_id="icon" action="gridAction" event_name="{{main.eventName}}" target_id="{{target_id}}">&nbsp;</span>',
                '<span><a href="/data/ReportBrowse?im=y&wd=y&view={{filename}}" reportflag="{{reportflag}}" action="gridAction" target_id="{{target_id}}" target="_blank">{{reportfiles_text}}</a></span>',
                '{{/is}}',
                '{{#is reportflag "sub"}}',
                '<span class="col-xs-1"></span>',
                '<span><a href="/data/ReportBrowse?im=y&view={{filename}}" reportflag="{{reportflag}}" action="gridAction" target_id="{{target_id}}" target="_blank">{{reportfiles_text}}</a></span>',
                '{{/is}}',
                '{{/if}}'
        	],
            initialize: function(options){
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;
                this.hideAllSubNode();
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                	target_id: this.rowModel.get(this.idField),
                	reportfiles: this.rowModel.get(this.columnModel.get('name')),
                    reportfiles_text:this.columnModel.get('value'),
                    reportflag: this.rowModel.get('reportflag'),
                    reportid: this.rowModel.get('reportid'),
                    filename: this.rowModel.get('filename')
                }));
            },
            hideAllSubNode: function(){
				var that = this;
				var model = that.rowModel;
				if(model.get('reportflag') == "sub"){ 
					$("tr[target_id='"+model.get('_id')+"']").hide();
				}
			}
        });
    });
})(Application);
