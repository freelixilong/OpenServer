(function(app) {

	/*
	 *config:
	 *{
	 *	 label: "Enable",
	 *   name:"enable",
	 *	 customHeader: null,
	 *   customCell: "checkbox",
	 *   checkValue:true
	 *}
	 */

	app.widget('CheckboxCell', function() {
		return app.view({
			template: [
				'<input name="{{name}}" type="checkbox" class="checkbox-cell" target_id="{{target_id}}" {{#if checked}}checked{{/if}}></input>'
			],

			initialize: function(options) {
				this.columnModel = options.columnModel;
				this.rowModel = options.rowModel;
				this.idField = options.idField;

				this.model = app.model();

				var data = _.extend(this.columnModel.toJSON(), {
					target_id: this.rowModel.get(this.idField)
				});

				data.checked = false;
				if (data.value === data.checkValue) data.checked = true;
				this.model.set(data);
			}
		});
	});
	app.widget('CheckboxActCell', function() {
		return app.view({
			template: [
				'<input name="{{name}}" type="checkbox" class="checkbox-cell" action = "gridAction" event_name = "{{eventName}}" target_id="{{target_id}}" {{#if checked}}checked{{/if}}></input>'
			],

			initialize: function(options) {
				this.columnModel = options.columnModel;
				this.rowModel = options.rowModel;
				this.idField = options.idField;

				this.model = app.model();

				var data = _.extend(this.columnModel.toJSON(), {
					target_id: this.rowModel.get(this.idField)
				});

				data.checked = false;
				if (data.value === data.checkValue) data.checked = true;
				this.model.set(data);
			}

		});
	});
	/*
	 *config:
	 *{
	 *	 label: "Enable",
	 *   name:"status",
	 *	 customHeader: null,
	 *   customCell: "checkboxAction",
	 *   entity: "xxxStatus",
	 *}
	 */

	app.widget('CheckboxActionCell', function() {
		return app.view({
			template: [
				'<input type="checkbox" class="checkbox-cell" action="click" {{#is status true}}checked{{/is}}></input>',
			],
			initialize: function(options) {
				this.columnModel = options.columnModel;
				this.rowModel = options.rowModel;
				this.idField = options.idField;

				this.trigger('view:render-data', {
					status: this.rowModel.get(this.columnModel.get('name'))
				});
			},
			actions: {
				'click': function() {
					var that = this;
					var args = this.rowModel.attributes;
					delete args.can_delete;
					delete args.label;
					delete args.ref;
					args.enable =  this.$el.find('input').prop('checked');
					args.status =  this.$el.find('input').prop('checked');
					app.remote({
						entity: this.columnModel.get('entity'),
						payload: args
					}).done(function(data) {
						that.parentCt.trigger('view:grid-refresh');
					}).fail(function(jqXHR, textStatus, errorThrown) {
						app.failCommon(jqXHR, textStatus, errorThrown);
					});
				}
			}
		});
	});

	app.widget('SitePubRuleCheckboxActionCell', function() {
		return app.view({
			template: [
				'<input type="checkbox" class="checkbox-cell" action="click" {{#is status true}}checked{{/is}}></input>',
			],
			initialize: function(options) {
				this.columnModel = options.columnModel;
				this.rowModel = options.rowModel;
				this.idField = options.idField;

				this.trigger('view:render-data', {
					status: this.rowModel.get(this.columnModel.get('name'))
				});
			},
			actions: {
				'click': function() {
					var that = this;
					app.remote({
						entity: this.columnModel.get('entity') + "Status" ,
						payload: {
							_id: this.rowModel.get(this.idField),
							status: this.$el.find('input').prop('checked')
						}
					}).done(function(data) {
						that.parentCt.trigger('view:grid-refresh');
					}).fail(function(jqXHR, textStatus, errorThrown) {
						app.failCommon(jqXHR, textStatus, errorThrown);
					});
				}
			}
		});
	});

	app.widget('CustomGlobalWhiteListCheckboxActionCell', function() {
		return app.view({
			template: [
				'<input type="checkbox" class="checkbox-cell" action="click" {{#is status true}}checked{{/is}}></input>',
			],
			initialize: function(options) {
				this.columnModel = options.columnModel;
				this.rowModel = options.rowModel;
				this.idField = options.idField;

				this.trigger('view:render-data', {
					status: this.rowModel.get(this.columnModel.get('name'))
				});
			},
			actions: {
				'click': function() {
					app.remote({
						entity: this.columnModel.get('entity'),
						payload: {
							_id: this.rowModel.get(this.idField),
							type: this.rowModel.get('type'),
							requestType: this.rowModel.get('requestType'),
							requestURL: this.rowModel.get('requestURL'),
							itemName: this.rowModel.get('itemName'),
							domain: this.rowModel.get('domain'),
							path: this.rowModel.get('path'),
							status: this.$el.find('input').prop('checked')
						}
					}).fail(function(jqXHR, textStatus, errorThrown) {
						app.failCommon(jqXHR, textStatus, errorThrown);
					});
				}
			}
		});
	});

	app.widget('LogSearchCheckboxCell', function() {
		return app.view({
			template: [
				'<span id="file_{{target_id}}" style="display:none">{{fileName}}</span><span id="ops_{{target_id}}" style="display:none">{{ops}}</span>',
				'<input name="{{name}}" type="checkbox" class="checkbox-cell" target_id="{{target_id}}" {{#if checked}}checked{{/if}}></input>'
			],

			initialize: function(options) {
				this.columnModel = options.columnModel;
				this.rowModel = options.rowModel;
				this.idField = options.idField;

				this.model = app.model();

				var data = _.extend(this.columnModel.toJSON(), {
					target_id: this.rowModel.get(this.idField),
					fileName: this.rowModel.get('fileName'),
					ops: this.rowModel.get('ops')
					//fileName: '/var/log/fwlog/root/disklog/alog(2014-07-31-08:16:48).log',   //test
					//ops: '5160960'
				});

				data.checked = false;
				if (data.value === data.checkValue) data.checked = true;
				this.model.set(data);
			}
		});
	});
})(Application);
