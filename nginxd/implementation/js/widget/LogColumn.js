/*
	Log Column Setting View
	store the setting in cookie value
	author: KaiLiu
*/

(function(app) {

	app.widget('LogColumn', function() {
	
		var idColumn = {
			name: 'id',
			label: '#'
		};

		var actionColumn = {
			customCell: 'action',
			customHeader: null,
			actions: [{
				label: 'Detail',
				eventName: 'detail'
			}]
		};

		var detailColumn = {
			name: 'detail',
			label: 'Detailed Information'
		};
	
		// column setting view
		var columnView = app.view({
			type: 'Layout',
			template: [
			//'<div region="formTitle"></div>',
			'<div class="panel panel-default" style="width: 700px;">',
			'<div class="panel-heading"><strong>' + 'Column Settings' + '</strong></div>',
			'<div class="panel-body" style="padding: 20px 30px 20px 30px;">',

			'<form class="form-horizontal" role="form">',
			'<div editor="picker"></div>',
			'</form>',
			'<div>',
			'<div class="col-xs-offset-5">',
			'<div class="row">',
				'<span class="btn btn-default" action="moveup">Move Up</span>&nbsp;&nbsp;',
				'<span class="btn btn-default" action="movedown">Move Down</span>',
			'</div>',
			'</div>',
				'<span class="btn btn-primary" action="ok">OK</span>&nbsp;&nbsp;',
				'<span class="btn btn-default" action="cancel">Cancel</span>',
			'</div>'
			],

			initialize: function(options) {
				this.default_columnOptions = options.default_columnOptions;
				this.columnCookieName = options.columnCookieName;
				this.all_columns = options.all_columns;
				this.parentCt = options.parentCt;
				this.editors = {
					picker: {
						type: 'picker',
						sourceLabel: 'Availiable Fields',
						targetLabel: 'Show these fields in this order',
						options: {
							labelField: 'label',
							valueField: 'name',

							data: {
								statics: this.all_columns
							}
						}
					}
				};
			},

			actions: {
				ok: function($btn) {
					// set the column setting values, and save it to cookie
					var val = this.getEditor('picker').getVal();
					setCookie(this.columnCookieName, val.join(','));

					// rebuild grid columns by setting
					var columnsOptions = [];

					columnsOptions.push(idColumn);
					for(var i = 0; i < val.length; i++)
					{
						for(var j = 0; j < this.all_columns.length; j++)
						{
							if(val[i] == this.all_columns[j].name)
								columnsOptions.push(this.all_columns[j]);
						}
					}
					if(this.columnCookieName != 'EventColumns' && this.columnCookieName != "AttackColumns"
						&& this.columnCookieName != "TrafficColumns")
						columnsOptions.push(actionColumn);

					// re-render grid
					this.parentCt.trigger('view:show-grid', columnsOptions);
					$("body").overlay(false);
				},

				moveup: function($btn) {
					var view = this.getEditor('picker').target.currentView;
					var $select = view.getEditor("select").$el.find("select");
					
					var values = $select.val();
					if(values)
					{
						if(values.length != 1)	return;
					}

					var pos = 0;
					var index = 0;
					var arr = this.getEditor('picker').getVal();
					pos = _.indexOf(arr, values[0]);
					if(pos == 0)	return;
					
					var data = [];
					for(var i = 0; i < pos-1; i++)
					{
						data.push(arr[i]);
					}
					data.push(arr[pos]);
					data.push(arr[pos-1]);
					for(var i = pos+1; i < arr.length; i++)
					{
						data.push(arr[i]);
					}

					this.getEditor('picker').setVal(data);
					this.getEditor('picker').onRenderData(data);
				},

				movedown: function($btn) {
					var view = this.getEditor('picker').target.currentView;
					var $select = view.getEditor("select").$el.find("select");
					
					var values = $select.val();
					if(values)
					{
						if(values.length != 1)	return;
					}

					var pos = 0;
					var index = 0;
					var arr = this.getEditor('picker').getVal();
					pos = _.indexOf(arr, values[0]);
					if(pos == arr.length-1)	return;
					
					var data = [];
					for(var i = 0; i < pos; i++)
					{
						data.push(arr[i]);
					}
					data.push(arr[pos+1]);
					data.push(arr[pos]);
					for(var i = pos+2; i < arr.length; i++)
					{
						data.push(arr[i]);
					}

					this.getEditor('picker').setVal(data);
					this.getEditor('picker').onRenderData(data);
				},

				cancel: function($btn) {
					$("body").overlay(false);
				}
			},

			onRender: function() {
			//	this.formTitle.show(app.widget('FormTitle', {
			//		title: 'Column Setting'
			//	}));
				
				this.activateEditors(this.editors);

				// get the picker editor value from cookie or default setting
				var columnsData = null;
				var cookie = getCookie(this.columnCookieName);
				if(!cookie)
					columnsData = this.default_columnOptions;
				else
					columnsData = cookie.split(',');

				this.getEditor('picker').setVal(columnsData);
			}
		});

		return columnView;
	});

}) (Application);