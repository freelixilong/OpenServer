/*
	Log Filter Setting View
	stroe the setting in cookie value
	author: KaiLiu
*/

(function(app) {

	app.widget('LogFilter', function() {
        var tempCookieName = "tempCookieName";

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

		// log filter setting
		var SectionContainer = app.view({
			type: 'CollectionView',
			tagName: 'ul',
			className: 'tree',

			// data format: {data: [{}, .. {}]}
			initialize: function(options)
			{
				this._options = options || {};
				this.data = this._options.data || {};
				// must define here in this version
				this.itemView = FilterSection;
				this.all_filter_columns = options.all_filter_columns;
			},
			onShow: function() {
				this.trigger('view:render-data', this.data);
			},
			// construct the input parameters to FilterSection
			// here the model.attributes is the [index] object passed by this._options.data
			itemViewOptions: function(model, index) {
				// pass in by 'data'
				return {
					data: _.extend({}, model.attributes),
					parentCt: this,
					key: model.attributes.key
				};
			},

			getVal: function() {
				var sections = this.children._views;
				var array = [];
				_.each(sections, function(sec){
					var val = sec.getVal();
					if(val.name)
						array.push(val);
				});

				return array;
			},

			// new add one section
			onAddSection: function(filter) {
				if(!filter)	return;

				// remove not saved/invalid section
				var validData = [];
				for(var i = 0; i < this.data.length; i++)
				{
					if(!this.data[i].value.length)
						continue;

					validData.push(this.data[i]);
				}
				this.data = validData;

				// add new section
				var d = {value: []};
				_.each(this.all_filter_columns, function(c){
					if(c.key == filter)
						_.extend(d, c);
				});

				this.data.push(d);

				this.trigger('view:render-data', this.data);
			},

			onRefreshSection: function() {
				var cookieStr = '';
				cookieStr = getCookie(tempCookieName);

				var cookieArray = [];
				if (cookieStr)
					cookieArray = deserializeArray(cookieStr);

				var flt;
				var data = [];
				var obj;

				for (var i = 0;
					(flt = cookieArray[i]); i++) {
					var key = flt[0];
					var not = flt[2];
					var contain = flt[1];
					var support = {};
					var label = '';
					var logic = {};
					var selection = undefined;
					var help = '';

					for (j = 0; j < this.all_filter_columns.length; j++) {
						if (key == this.all_filter_columns[j].key) {
							support = this.all_filter_columns[j].support;
							label = this.all_filter_columns[j].label;
							selection = this.all_filter_columns[j].selection;
							help = this.all_filter_columns[j].help;
							break;
						}
					}

					obj = {
						key: key,
						support: support,
						label: label,
						selection: selection,
						help: help,
						value: flt[5],
						logic: {
							NOT: not,
							OR: contain != true,
							RANGE: contain
						}
					};

					data.push(obj);
				}
				this.data = data;
				this.trigger('view:render-data', this.data);
			},

			// clear all sections
			onClearSection: function() {
				this.data = [];
				this.trigger('view:render-data', this.data);
			},

			// delete one section
			onDeleteSection: function(key) {
				if(!key)	return;

				var newData = [];

				_.each(this.data, function(d) {
					if(d.key == key)	return;

					newData.push(d);
				});
				this.data = newData;

				this.trigger('view:render-data', this.data);
			},

			// change current edit section
			onChangeSelect: function(key) {
				_.each(this.children._views, function(v) {
					if(v.key == key)
						v.toggleEditor(false);
					else
						v.toggleEditor(true);
				});
			}
		});

		// add filter section view
		var addSection = app.view({
			type: 'ItemView',
			tagName: 'li',
			className: 'filterSection',
			template: [
				'<div class="filterLabel" style="text-align: left;">',
					'<span action="add"><i class="fa fa-plus"></i></span>',
					'<span class="filterText">' +'Add new Filter ...' + '</span>',
				'</div>',
				'<div class="filterEditor">',
					'<form class="form-horizontal" role="form">',
						'{{#each editors}}',
							'<div editor={{@key}}></div>',
						'{{/each}}',
					'</form>',
				'</div>',
			],

			actions: {
				add: function($btn){
					var val = this.parentCt.sections.currentView.getVal();
					var cookieVal = [];

					_.each(val, function(v) {
						var d = new Array(
							v.name, v.contain,
							v.not ? 1 : 0,
							v.range ? v.value[0] : '',
							v.range ? v.value[1] : '',
							v.value
							);
						cookieVal.push(d);
					});

                    var tempStr = getCookie(tempCookieName);

					var cookieStr = serializeArray(cookieVal);

                    var tempcookieArray = [];
                    var cookieArray = [];

                    var cklength = cookieVal.length;

                    if (tempStr && cklength > 0) {
                        tempcookieArray = deserializeArray(tempStr);

                        var flag = 0;
                        for(var i = 0; i < tempcookieArray.length; i++) {
                            flag = 0;
                            for(var j = 0; j < cklength; j++) {
                                if (val[j].name == tempcookieArray[i][0]) {
                                    flag = 1;
                                    break;
                                }
                            }
                            if (flag == 0)
                                cookieArray.push(tempcookieArray[i])
                        }

                        tempStr = serializeArray(cookieArray);

                    }

                    if (tempStr)
					    setCookie(tempCookieName, tempStr + cookieStr);
                    else
                        setCookie(tempCookieName, cookieStr);

					this.operaCt.trigger('view:refresh-section');
					this.toggleEditor(false);
				}
			},

			// data format: [{value:, label:}...]
			// just used to build select editors options
			initialize: function(options) {
				this._options = options;
				// sectionContainer view
				this.operaCt = options.operaCt;
				this.data = options.data;
			},

			onShow: function() {
				this.activateEditors(this.getEditor());
				this.on('editor:change', this.onEditorChange);
				// first time hide
				this.toggleEditor(true);
			},

			onEditorChange: function() {
				var field = this.getEditor('field_name').getVal();

				if(field != '')
				{
					// hide self editor and add new section
					this.operaCt.trigger('view:add-section', field);
					this.toggleEditor(true);
				}
			},

			toggleEditor: function(flag) {
				if(flag)
					$('.filterEditor', this.$el).hide();
				else
					$('.filterEditor', this.$el).show();

				_.each(this._editors, function(p) {
					if(flag)
						p.$el.hide();
					else
						p.$el.show();
				});
			},

			getEditor: function() {
				var editors = {
					_global: {
						layout: {
							label: 'col-xs-2',
							field: 'col-xs-10'
						}
					}
				};

				var data = [{
					label: 'Please Select...',
					value: ''
				}];

				_.each(this.data, function(d){
					data.push(d);
				});

				editors['field_name'] = {
					type: 'select',
					label: 'Field',
					options: {
						data: data
					}
				};

				return editors;
			}
		});

		// every section view
		var FilterSection = app.view({
			type: 'ItemView',
			tagName: 'li',
			className: 'filterSection',
			itemViewContainer: SectionContainer,
			template: [
				'<div class="filterLabel" style="text-align: left;">',
					// delete icon
					'<span action="remove" key="{{key}}"><i class="fa fa-times-circle"></i></span>',
					// key field
					'<span><b>{{label}}:</b></span>',
					// value field
					'<span class="filterText"></span>',
					'&nbsp&nbsp&nbsp&nbsp',
					'{{#if value.length}}',
					'<a action="change" key="{{key}}">[' + 'Change' + ']</a>',
					'{{/if}}',
				'</div>',
				// editors
				'<div class="filterEditor">',
					'<form class="form-horizontal" role="form">',
					'{{#each editors}}',
						'<div editor={{@key}}></div>',
					'{{/each}}',
					'</form>',
					'<div class="filterHelp" style="text-align: left;">{{help}}',
				'</div>',

				'</div>'
			],
			/* data format:
				data:{
					key
					label
					help
					value: [,]
					logic: {NOT, RANGE, OR}
					support: {NOT, OR, AND, RANGE}
					selection: [, ,]
				}
			*/
			initialize: function(options){
				this._options = options;
				this.data = options.data;
				this.parentCt = options.parentCt;
				this.key = options.key;

				this.correctData();
			},

			actions: {
				remove: function($btn) {
					var key = $btn.attr('key');
					this.parentCt.trigger('view:delete-section', key);
				},

				change: function($btn) {
					var key = $btn.attr('key');
					this.parentCt.trigger('view:change-select', key);
				}
			},

			correctData: function(){
				var d = this.data;
				var type = 'input';

				if(!d.logic)
					d.logic = {};
				else
				{
					d.logic.NOT = (d.logic.NOT == true);
					d.logic.RANGE = (d.logic.RANGE == true);
					d.logic.OR = (d.logic.OR == true);
				}

				if(d.value == undefined)	d.value = [];
				if(typeof(d.value) == 'string') d.value = [d.value];

				// check the editor type, only 4: multi_selection(multi), string input(input), range from-to(range), date(date)
				if(d.key == 'date')
					type = 'date';
				else if(d.selection)
					type = 'multi';
				else if(d.support.RANGE)
					type = 'range';
				else
					type = 'input';

				// mark the type
				this.$el.attr('editor_type', type);
			},

			onShow: function() {
				this.$el.attr('field_name', this.data.key);

				this.editors = this.getFilterEditors();
				this.activateEditors(this.editors);

				// check box and multi selector need setVal
				if(this.getEditor('negate'))
					this.getEditor('negate').setVal(this.data.logic.NOT);

				if(this.getEditor('multi_value'))
					this.getEditor('multi_value').setVal(this.data.value);

				if(this.getEditor('from_value'))
					this.getEditor('from_value').setVal(this.data.value[0]);

				if(this.getEditor('to_value'))
					this.getEditor('to_value').setVal(this.data.value[1]);

				this.trigger('view:render-data', this.data);

				$('.filterText', this.$el).html(this.getFilterText());

				// hide editor field when edit filter section
				if(this.data.value.length){
					this.toggleEditor(true);
				}
			},

			// 	toggle editor field when create or edit a filter section
			//	true: hide
			//  false: show
			toggleEditor: function(flag) {
				if(flag)
					$('.filterEditor', this.$el).hide();
				else
					$('.filterEditor', this.$el).show();

				_.each(this._editors, function(p) {
					if(flag)
						p.$el.hide();
					else
						p.$el.show();
				});
			},

			getVal: function() {
				var type = this.$el.attr('editor_type');
				if(type != 'multi' && type != 'input' && type != 'range' && type != 'date')
					return {};

				var retVal = {
					name: this.data.key,
					not: this.getEditor('negate').getVal(),
					range: this.data.support.RANGE,
					contain: this.data.support.RANGE ? 1:0
				};

				if(type == 'input')
				{
					var val = this.getEditor('text_value').getVal();
					if(!val)
						return {};

					retVal['value'] = val.split(',');
				}
				else if(type == 'range')
				{
					var from = this.getEditor('from_value').getVal();
					var to = this.getEditor('to_value').getVal();
					if(!from || !to)	return {};

					retVal['value'] = [from, to];
				}
				else if(type == 'date')
				{
					var from = this.getEditor('from_value').getVal();
					var to = this.getEditor('to_value').getVal();
					if(!from || !to)	return {};

					var fdate = $.datepicker.parseDate('mm/dd/yy', from);
					var tdate = $.datepicker.parseDate('mm/dd/yy', to);
					var f = $.datepicker.formatDate('yy-mm-dd', fdate);
					var t = $.datepicker.formatDate('yy-mm-dd', tdate);
					retVal['value'] = [f, t];
				}
				else if(type == 'multi')
				{
					var val = this.getEditor('multi_value').getVal();
					if(!val.length)	return {};

					retVal['value'] = val;
				}

				// clean up value
				for(var i = 0; i < retVal.value.length; i++)
				{
					retVal.value[i] = retVal.value[i].toString().replace(/[\'\"]+/g, " ").replace(/^\s+|\s+$/, "");
				}

				return retVal;
			},

			getFilterEditors: function() {
				var d = this.data;
				var type = this.$el.attr('editor_type');

				var editors = {
					/*
					_global: {
						layout: {
							label: 'col-xs-2',
							field: 'col-xs-10'
						}
					},
					*/
				};

				// add 'NOT' editor
				if(d.support.NOT)
				{
					editors['negate'] = {
						type: 'checkbox',
						label: 'Not',
						// this attr use boolean type: true or false
						checked: d.logic.NOT ? true: false,
						value: d.logic.NOT ? true: false
					};
				}

				// add simple input editor
				if(type == 'input')
				{
					editors['text_value'] = {
						type: 'text',
						label: 'Value' + ':',
						value: d.value ? d.value.join(', ') : ''
					};
				}
				// add from-to range editor, current now only time field
				else if(type == 'range')
				{
					editors['from_value'] = {
						type: 'text',
						label: 'From' + ':',
						value: (d.value.length == 2) ? d.value[0] : ''
					};

					editors['to_value'] = {
						type: 'text',
						label: 'To' + ':',
						value: (d.value.length == 2) ? d.value[1] : ''
					};
				}
				// add from-to range editor, current now only date field
				else if(type == 'date')
				{
					editors['from_value'] = {
						type: 'datePicker',
						label: 'From' + ':',
						name: 'from',
						value: (d.value.length == 2) ? d.value[0] : ''
					};

					editors['to_value'] = {
						type: 'datePicker',
						label: 'To' + ':',
						name: 'to',
						value: (d.value.length == 2) ? d.value[1] : ''
					};
				}
				// add multi-selection editor, current now only 'pri' field
				else if(type == 'multi')
				{
					var all_pri_field = [];
					_.each(d.selection, function(field){
						var o = {
							label: field,
							name: field
						};
						all_pri_field.push(o);
					});

					editors['multi_value'] = {
						type: 'picker',
						sourceLabel: '',
						targetLabel: '',
						options: {
							labelField: 'label',
							valueField: 'name',

							data: {
								statics: all_pri_field
							},

							value: d.value
						}
					}
				}

				return editors;
			},

			getFilterText: function() {
				var d = this.data;
				var type = this.$el.attr('editor_type');

				//value text
				var textVal = '';
				textVal = d.logic.NOT ? 'NOT ' : '';

				// multi selection
				if(type == 'multi')
				{
					{
						var opt, slt_opts = '', avl_opts = '';
						for(var i = 0; opt = d.selection[i]; i++)
						{
							if(typeof(opt) == 'string') opt = [opt];
							var s = "<option value=\"" + opt[0] + "\">" + opt[0] + "</option>";
							// not selected
							if(!d.value || (","+d.value.join(",")+",").indexOf(","+opt[0]+",") < 0)
							{
								avl_opts += s;
							}
							// alreay selected
							else
							{
								textVal += (slt_opts ? ', ' : '') + opt[0];
								slt_opts += s;
							}
						}
					}
				}
				// range type
				else if(type == 'range' || type == 'date')
				{
					var val_text = '';
					if(d.value.join('').length)
					{
						if(d.logic.OR)
						{
							val_text = d.value.join(', ');
							textVal += d.value.join(' OR ');
						}
						else
						{
							if(!d.value[0])
								val_text = ' <= ' + d.value[1];
							else if(!d.value[1])
								val_text = ' >= ' + d.value[0];
							else
								val_text = d.value.join(' - ');
							textVal += val_text;
						}
					}
				}
				// input
				else if(type == 'input')
				{
					textVal += d.value.join('').length ?
					(d.value.length > 1 ? d.value.join(' OR ') : d.value[0].replace(/^\s|\s$/, "").split(" ").join(" AND ")) : '';
				}

				return textVal;
			}

		});

		var LogFilterView = app.view({
			type: 'Layout',
			template: [

				'<div class="panel panel-default" style="width: 800px;">',
				'<div class="panel-heading"><strong>' + 'Log Filters' + '</strong></div>',
				'<div class="panel-body" style="padding: 20px 30px 20px 30px;">',

				// all log filter sections
				'<div region="sections"></div>',
				'<div>',
					'<ul>',
						// add log filter section
						'<li region="addSection">',
						'</li>',
						// clear all filters
						'<li class="filterSection">',
							'<div class="filterLabel" style="text-align: left;">',
								'<span action="clear"><i class="fa fa-eraser"></i></span>',
								'<span class="filterText">' + 'Clear all filters' + '</span>',
							'</div>',
						'</li>',
					'</ul>',
				'</div>',


				'<span class="btn btn-primary" action="apply">Apply</span>&nbsp;&nbsp;',
				'<span class="btn btn-default" action="cancel">Cancel</span>',
			],

			actions: {
				clear: function($btn){
					this.sections.currentView.onClearSection();
				},

				// save the filter result to cookie
				apply: function($btn) {
					var val = this.sections.currentView.getVal();
					var cookieVal = [];

                    var tempStr = getCookie(tempCookieName);
                    var tempcookieArray = [];
                    var cookieArray = [];
                    if (tempStr) {
                        tempcookieArray = deserializeArray(tempStr);

                        /*console.log(tempcookieArray[0][0]);
                        console.log(tempcookieArray[1][0]);

                        console.log(val[0].name);
                        console.log(val.length);*/

                        var flag = 0;
                        for(var i = 0; i < tempcookieArray.length; i++) {
                            flag = 0;
                            for(var j = 0; j < val.length; j++) {
                                if (val[j].name == tempcookieArray[i][0]) {
                                    flag = 1;
                                    break;
                                }
                            }
                            if (flag == 0)
                                cookieArray.push(tempcookieArray[i])
                        }

                        tempStr = serializeArray(cookieArray);

                    }

					_.each(val, function(v) {
						var d = new Array(
							v.name, v.contain,
							v.not ? 1 : 0,
							v.range ? v.value[0] : '',
							v.range ? v.value[1] : '',
							v.value
							);
						cookieVal.push(d);
					});

					var cookieStr = serializeArray(cookieVal);

                    if (cookieStr != '' && cookieStr != null && cookieStr != "")
					    setCookie(this.filterCookieName, tempStr + cookieStr);
                    else
					    setCookie(this.filterCookieName, cookieStr);

					this.parentCt.trigger('view:show-grid', this.getColumnsByCookie());
					$("body").overlay(false);
				},

				cancel: function($btn) {
                    var tempStr = '';
                    setCookie(tempCookieName, tempStr);

					$("body").overlay(false);
				}
			},

			getColumnsByCookie: function() {
				var columnsOptions = [];
				var cookieVal = getCookie(this.columnCookieName);
				var columnsData = [];
				if(cookieVal)
					columnsData = cookieVal.split(',');

				columnsOptions.push(idColumn);

				for(var i = 0; i < columnsData.length; i++)
				{
					for(var j = 0; j < this.all_columns.length; j++)
					{
						if(columnsData[i] == this.all_columns[j].name)
							columnsOptions.push(this.all_columns[j]);
					}
				}

				// event log doesn't has detail action/log
				//if(this.columnCookieName != 'EventColumns')
				//	columnsOptions.push(actionColumn);

				return columnsOptions;
			},

			initialize: function(options)
			{
				this._options = options;
				this.data = options.data;
				this.filterCookieName = options.filterCookieName;
				this.columnCookieName = options.columnCookieName;
				// filter settings
				this.all_filter_columns = options.all_filter_columns;
				this.all_columns = options.all_columns;
				this.parentCt = options.parentCt;

				this.firstToggle = options.firstToggle || '';
			},

			onRender: function() {
				var secContainer = new SectionContainer({data: this.data, all_filter_columns: this.all_filter_columns});
				this.sections.show(secContainer);

				// collect valid filter field as {value:, label:}
				var data = [];
				var cookie = getCookie(this.filterCookieName);
				var exist_filters = [];

				if(cookie)
				{
					var arr_filter = deserializeArray(cookie);

					_.each(arr_filter, function(filter)
					{
						if(filter.length != 6)	return;

						exist_filters.push({
							key: filter[0]
						});
					})
				}

				var columns = [];
				var columnCookie = getCookie(this.columnCookieName);
				if(columnCookie)
					columns = columnCookie.split(',');

				for(var k = 0; k < columns.length; k++)
				{
					var flag = 0;
					for(var i = 0; i < exist_filters.length; i++)
					{
						if(columns[k] == exist_filters[i].key)
						{
							flag = 1;
							break;
						}
					}

					// already exist filter not need to add to field source
					if(flag)	continue;

					for(var j = 0; j < this.all_filter_columns.length; j++)
					{
						if(columns[k] == this.all_filter_columns[j].key)
							data.push({
								value: this.all_filter_columns[j].key,
								label: this.all_filter_columns[j].label
							});
					}
				}

				this.addSection.show(new addSection({
					data: data,
					operaCt: secContainer
				}));

				if(this.firstToggle != '')
					this.sections.currentView.trigger('view:change-select', this.firstToggle);
			}
		});

		return LogFilterView;
	});

}) (Application);
