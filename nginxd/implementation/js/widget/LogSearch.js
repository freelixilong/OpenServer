/*
*Log Search Widget
*by shuyusun
*/
(function(app) {
	app.widget('LogSearch', function(){
		var idColumn = {
			name: 'id',
			label: '#'
		};
		var LogSearchView = app.view({
			type: 'Layout',
			template: [
				'<style>',
				'.form-group {margin-bottom: 0px;}',
				'</style>',
				'<div class="panel panel-default" style="width: 600px;">',
				'<div class="panel-heading"><strong>' + 'Log Search' + '</strong></div>',
				'<div class="panel-body" style="padding: 20px;height: 700px; overflow:auto;">',
				'<form class="form-horizontal" role="form">',
				'{{#each editors}}',
				'{{#is this.type "dateTimePicker"}}<div class="col-xs-10"><div editor={{@key}}></div></div>{{/is}}',
				'{{#is this.type "radio"}}<div class="col-xs-4"><div editor={{@key}}></div></div>{{/is}}',
				'{{#is @key "subType"}}',
				'<div class="row"><div class="col-xs-10"><div editor={{@key}}></div></div><div class="col-xs-2"></div></div>',
				'{{else}}',
				'{{#is this.type "text"}}<div class="row"><div class="col-xs-10"><div editor={{@key}}></div></div>{{/is}}',
				'{{#is this.type "checkbox"}}<div class="col-xs-2"><div editor={{@key}}></div></div></div>{{/is}}',
				'{{/is}}',
				'{{/each}}',
				'</form>',
				'</div>',
				'<div class="panel-footer">',
				'<span class="btn btn-primary" action="ok">OK</span>&nbsp;&nbsp;',
				'<span class="btn btn-default" action="cancel">Cancel</span>',
				'</div>',
				'</div>'
			],
			initialize: function(options) {
				this.editors = options.editors;
				this.all_columns = options.all_columns;
				this.parentCt = options.parentCt;
				this.grid = options.grid;
				this.searchCookieName = options.searchCookieName;
				this.columnCookieName = options.columnCookieName;
				this.defaultColumnOptions = options.defaultColumnOptions;

				this.trigger('view:render-data', options);

			},
			onRender: function(){

				var cookieStr = getCookie(this.searchCookieName);

				this.activateEditors(this.editors);

				if(cookieStr){
					this.setValues(JSON.parse(cookieStr), true);
				}else{
					this.setDefaultValues();
				}
			},
			actions: {
				ok: function($btn){
					var selectColumn = {
						label: '<input type="checkbox" name="selectAll" id="selectAll" action="gridAction" event_name="selectAll">',
						name: 'check',
						customHeader: null,
	    				customCell: "logSearchCheckbox",
	    				checkValue:true
					};
					var sr_columns = [];
					var columsName = getCookie(this.columnCookieName) ? getCookie(this.columnCookieName) : '';
					var val = [];

					if(columsName === ''){
						val = this.defaultColumnOptions;
					}else{
						val = columsName.split(',');
					}

					sr_columns.push(selectColumn);
					sr_columns.push(idColumn);

					for(var i=0; i<val.length; i++){
						_.each(this.all_columns, function(obj){
							if(val[i] == obj.name){
								sr_columns.push(obj);
							}
						});
					}
					
					this.parentCt.$el.find('span[event_name="raw"]').show();
					this.parentCt.$el.find('span[event_name="format"]').hide();
					this.parentCt.$el.find('span[event_name="generate"]').show();
					this.parentCt.$el.find('span[event_name="reset"]').show();
					this.parentCt.$el.find('span[event_name="filter"]').hide();

					this.saveSearchString();

					this.parentCt.trigger('view:show-grid', sr_columns);
					this.parentCt.footer.show(app.widget('Paginator', {
						target: this.grid.currentView,
						className: 'pagination pagination-sm pull-right',
						currentPage: 1,
					}));	

					$("body").overlay(false);
				},
				cancel: function($btn){
					$("body").overlay(false);
				}
			},
			saveSearchString: function(){
				var data = {};
				data = this.getValues();
				setCookie(this.searchCookieName ,JSON.stringify(data));
			},
			setDefaultValues: function(){
				var time = new Date();
				time.setHours(0, 0, 0);
				this.getEditor('from').setVal(time, true);
				time.setHours(23, 59, 59);
				this.getEditor('to').setVal(time, true);
				this.getEditor('fsOption').setVal('1', true);
			}
		});

		return LogSearchView;
	});
	
})(Application);