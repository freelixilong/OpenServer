(function(app) {
	app.editor('HttpProtocolConstraintsSelect', function() {
		var view = app.view({
			template: [
				'<div class="row">',
					'<div class="col-xs-1">',
						'<div class="checkbox">',
						'<label><input id="status" type="checkbox" action="click"></label>',
						'</div>',
					'</div>',
					'<div class="col-xs-3">',
						'<label class="control-label">',
						'</label>',
					'</div>',
					'<div class="col-xs-1">',
						'<div class="form-group">',
						'<input id="value" type="text" class="form-control">',
						'<span class="help-block input-error" ui="msg"></span>',
						'</div>',
					'</div>',
					'<div class="col-xs-2">',
						'<select id="action" class="form-control" action="actionChange">',
						'</select>',
					'</div>',
					'<div class="col-xs-1">',
						'<div class="form-group">',
							'<input id="blockPeriod" type="text" class="form-control" placeholder="60">',
						'</div>',
					'</div>',
					'<div class="col-xs-1">',
						'<select id="severity" class="form-control">',
						'</select>',
					'</div>',
					'<div class="col-xs-2">',
						'<select id="triggerAction" class="form-control">',
						'</select>',
					'</div>',
					// '<div class="row" id = "tipShow" >',
					// '<div id = "tipShowIn"></div>',
				'</div>',
				'<div class="row" id = "tipShow">',
					'<div class="col-md-12"><span id = "tipShowIn" class="lert alert-dismissable alert-warning"></span></div>',
				'</div>',
			],
			initialize: function(options) {
				this.name = options.name;
				this.label = options.label;
				this.layout = options.layout;
				this.checkboxOptions = options.checkboxOptions;

				this.action = options.action;
				this.value = options.value;

				this.options = options;
				this.tipIsShow = false;

				this.severity = [{
					value: 1,
					label: 'High',
				}, {
					value: 2,
					label: 'Medium'
				}, {
					value: 3,
					label: 'Low'
				}];

				this.triggerAction = [{
					value: '',
					label: 'Please Select'
				}];

				var that = this;
				_.each(options.triggerAction, function(elem) {
					that.triggerAction.push({
						value: elem.value,
						label: elem.name,
					});
				});
			},
			appendSelectOptions: function(options, target) {
				if (options) {
					for (var i = 0; i < options.length; ++i) {
						var item = options[i];
						this.$el.find(target).append('<option value="' + item.value + '">' + item.label + '</option>');
					}
				}
			},
			renderForm: function() {
				this.$el.find('label[class="control-label"]').html("<a action = 'tip'>" + this.label +"</a>");
				this.appendSelectOptions(this.action, '#action');
				this.appendSelectOptions(this.severity, '#severity');
				this.appendSelectOptions(this.triggerAction, '#triggerAction');

				if (this.checkboxOptions) {
					var $checkboxOptions = this.$el.find('#checkboxOptions');

					var checkboxHtml = '';

					for (var i = 0; i < this.checkboxOptions.length; ++i) {
						var item = this.checkboxOptions[i];
						checkboxHtml += '<div class="checkbox">' +
							'<label><input type="checkbox" value=' +
							item.value +
							'>' +
							item.label +
							'</label>' +
							'</div>';
					}

					var optionsHtml = '<div class="row">' +
						'<div class="col-xs-2"></div>' +
						'<div class="col-xs-10">' +
						'<div id="checkbox_list" class="form-group">' +
						'<div class="checkbox">' +
						'<label><input type="checkbox" value="all" action="all_none">All / None</label>' +
						'</div>' +
						checkboxHtml +
						'</div>' +
						'</div>' +
						'</div>';

					$checkboxOptions.append(optionsHtml);
				}
			},
			onRender: function() {
				this.renderForm();

				if (this.value) {
					this.$el.find('#value').val(this.value.value);
					this.$el.find('#status').prop('checked', this.value.status);
					this.$el.find('#action').val(this.value.action);
					this.$el.find('#blockPeriod').val(this.value.blockPeriod);
					this.$el.find('#severity').val(this.value.severity);

					var that = this;
					_.each(this.value.subClass, function(elem, index) {
						that.$el.find('input[value=' + elem + ']').prop('checked', true);
					});

					this.togger(true);
				} else {
					if (false === this.$el.find('#status').prop('checked')) {
						this.togger(true);
					}
				}

				if (this.options.validate && _.isFunction(this.options.validate)) {
					this.listenTo(this, 'editor:change editor:keyup', function() {
						if (this.eagerValidation) {
							this.validate(true);
						}
					});
					this.validate = function(show) {
							var error = false;
							if (this.options.validate && _.isFunction(this.options.validate)) {
								error = this.options.validate(this.getVal(), this.options.parentCt);
								if (show) {
									this._followup(error);
								}
								return error;
							}
						},
						this._followup = function(error) {
							if (!_.isEmpty(error)) {
								this.status('error', error);
								//become eagerly validated
								this.eagerValidation = true;
							} else {
								this.status(' ');
								this.eagerValidation = false;
							}
						}
				}
				this.$el.find('#value').prop('disabled', true);
				this.$el.find('#blockPeriod').prop('disabled', true);
				this.toggleStatus();
				this.$el.find("#tipShowIn").text(this.options.tip);
				this.$el.find("#tipShow").hide();
			},
			status: function(status, msg) {
				//set or get status of this editor UI
				if (status) {
					//set warning, error, info, success... status, no checking atm.
					var className = 'has-' + status;
					this.$el
						.removeClass(this.$el.data('status'))
						.addClass(className)
						.data('status', className);
					this.ui.msg.html(msg || '');
				} else {
					//get
					return this.$el.data('status');
				}
			},
			getVal: function() {
				var value = {};
				value.value = this.$el.find('#value').val();
				value.status = this.$el.find('#status').prop('checked');
				value.action = this.$el.find('#action').val();
				value.blockPeriod = this.$el.find('#blockPeriod').val();
				value.severity = this.$el.find('#severity').val();
				value.triggerAction = this.$el.find('#triggerAction').val();

				var subClass = this.$el.find('input[type="checkbox"][id!="status"][value!="all"]');
				var array = [];
				_.each(subClass, function(elem, index) {
					var object = {};
					object.subClassId = $(elem).attr('value');
					object.status = $(elem).prop('checked');
					array.push(object);
				});

				value.subClass = array;
				return value;
			},
			setVal: function(data) {
				this.$el.find('#value').val(data.value);
				this.$el.find('input').prop('checked', false);

				this.$el.find('#status').prop('checked', data.status);
				this.$el.find('#action').val(data.action);
				this.$el.find('#blockPeriod').val(data.blockPeriod);
				this.$el.find('#severity').val(data.severity);
				this.$el.find('#triggerAction').val(data.triggerAction);
				this.toggleStatus();
				var that = this;
				_.each(data.subClass, function(elem, index) {
					that.$el.find('input[value=' + elem + ']').prop('checked', true);
				});
			},
			validate: function() {
				//must have
			},
			hideCheckboxes: function() {
				this.$el.find('#checkbox_list').hide();
			},
			showCheckboxes: function() {
				this.$el.find('#checkbox_list').show();
			},
			togger: function(flag) {
				var iconClass = this.$el.find('#icon').attr('class');
				var $icon = this.$el.find('#icon');

				if (true === flag) {
					$icon.removeClass('glyphicon-chevron-down');
					$icon.addClass('glyphicon-chevron-right');
					this.hideCheckboxes();
				} else {
					$icon.removeClass('glyphicon-chevron-right');
					$icon.addClass('glyphicon-chevron-down');
					this.showCheckboxes();
				}
			},
			toggleStatus: function() {
				if (true == this.$el.find('#status').prop('checked')) {
					if (this.value.value) {
						this.$el.find('#value').prop('disabled', false);
					}
					if ('11' === this.$el.find('#action').val()) {
						this.$el.find('#blockPeriod').prop('disabled', false);
					} else {
						this.$el.find('#blockPeriod').prop('disabled', true);
					}
					this.$el.find('#action').prop('disabled', false);
					this.$el.find('#severity').prop('disabled', false);
					this.$el.find('#triggerAction').prop('disabled', false);
				} else {
					this.$el.find('#value').prop('disabled', true);
					this.$el.find('#action').prop('disabled', true);
					this.$el.find('#blockPeriod').prop('disabled', true);
					this.$el.find('#severity').prop('disabled', true);
					this.$el.find('#triggerAction').prop('disabled', true);
				}
			},
			disable: function() {
				this.$el.find('input, select').prop('disabled', true);
			},
			actions: {
				"click": function($triggerTag, e) {
					this.toggleStatus();
					var $status = this.$el.find('#status');
					if (false === $status.prop('checked')) {
						return;
					}

					var $icon = this.$el.find('#icon');
					if ('glyphicon glyphicon-chevron-down' === $icon.attr('class')) {
						this.togger(true);
					} else {
						this.togger(false);
					}
				},
				"all_none": function($triggerTag, e) {
					var $all = this.$el.find('input[value="all"]');
					var checkbox_list = this.$el.find('#checkbox_list').find('input[type="checkbox"]');

					if (true === $all.prop('checked')) {
						_.each(checkbox_list, function(elem) {
							$(elem).prop('checked', true);
						});
					} else {
						_.each(checkbox_list, function(elem) {
							$(elem).prop('checked', false);
						});
					}
				},
				"actionChange": function($triggerTag, e) {
					this.toggleStatus();
				},
				tip: function(para) {
					this.tipIsShow = !this.tipIsShow;
					this.$el.find('#tipShow').toggle(this.tipIsShow);
				}
			}
		});

		return view;
	});
})(Application);