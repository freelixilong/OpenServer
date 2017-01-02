/**
 * Sample WIDGET script.
 *
 * @author Stagejs.CLI
 * @created Fri Apr 10 2015 11:16:24 GMT+0800 (CST)
 */
;
(function(app) {

	app.view({
		name: 'Body',
		className: 'widget-body',
		initialize: function(options) {
			this.editors = options.editors;
			this.change = options.change;
			this.data = options.data;
			this.entity = options.bodyEntity;
			if (_.isFunction(this.change)) {
				this.on('editor:change', this.change);
			}
		},
		onShow: function() {
			var self = this;
			this.activateEditors(this.editors);
			if (this.data) {
				this.setValues(this.data);
			} else if(this.entity){
				app.remote({
					entity: this.entity,
				}).done(function(data, textStatus, jqXHR) {
					self.setValues(data);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					app.failCommon(jqXHR, textStatus, errorThrown);
				});
			}
		},
	});

	app.widget('Widget', function() {

		var UI = app.view({
			type: 'Layout',
			template: '@widget/Widget.html',
			className: 'panel panel-default',
			initialize: function(options) {
				this.entity = options.entity;
				this.header = options.header;
				this.editors = options.editors;
				this.change = options.change;
				this.systemplate = options.systemplate;
				this.bodyEntity = 'SystemTemplates/' + this.systemplate + '/Template/' + this.entity;
			},
			onShow: function() {
				var self = this;
				this.trigger('view:render-data', {
					header: this.header,
				});
				this.dataSrcShow(this.editors);
				if (this.entity) {
					app.remote({
						entity: this.bodyEntity,
					}).done(function(data, textStatus, jqXHR) {
						self.data = data;
						self.moduleId = data._id;
						self.getRegion('body').trigger('region:load-view', 'Body', {
							editors: self.editors,
							change: self.change,
							bodyEntity: self.bodyEntity,
							data: data,							
						});
					}).fail(function(jqXHR, textStatus, errorThrown) {
						app.failCommon(jqXHR, textStatus, errorThrown);
					});
				}
			},
			dataSrcShow: function(options) {
				var editors = options;
				for (p in options) {
					if (options[p].dataSrc) {
						app.remote({
							url: options[p].dataSrc,
							async: false,
						}).done(function(data) {
							if ('select' === editors[p].type) {
								if (undefined === editors[p].options || undefined === editors[p].options.data) {
									editors[p].options = {};
									editors[p].options.data = [];
								} else {
									if ((undefined !== editors[p].options.data[0]) && (editors[p].options.data[0].value === '')) {
										var temp = editors[p].options.data[0];
										editors[p].options.data = [];
										editors[p].options.data[0] = temp;
									} else {
										editors[p].options.data = [];
									}
								}
								for (var i = 0; i < data.length; ++i) {
									var obj = {};
									obj.label = data[i].label;
									obj.value = data[i].value;
									editors[p].options.data.push(obj);
								}
							} else if ('text' === editors[p].type) {
								editors[p].value = data[p];
							}
						}).fail(function(jqXHR, textStatus, errorThrown) {
							app.failCommon(jqXHR, textStatus, errorThrown);
						});
					}
				}
			},
			onDataModify: function() {
				if (_.isUndefined(this.validate(true))) {
					var data = this.getValues();
					if (this.moduleId)
						data._id = this.moduleId;
					var self = this;
					app.remote({
						entity: 'SystemTemplates/' + this.systemplate + '/Template',
						payload: _.extend(data,
							{name: this.entity}),
					}).done(function(data, textStatus, jqXHR) {
						app.trigger("app:notify", {
							type: "success",
							msg: "Config:Success",
						});
						if (!self.moduleId)
							self.trigger('view:show');
					}).fail(function(jqXHR, textStatus, errorThrown) {
						app.failCommon(jqXHR, textStatus, errorThrown);
					});
				}
			},
			actions: {
				'apply': function() {
					this.trigger('view:data-modify');
				}
			}
		});

		return UI;

	});

})(Application);