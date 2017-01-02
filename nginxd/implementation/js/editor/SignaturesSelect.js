(function(app) {
	app.editor('signaturesSelect', function() {
		var view = app.view({
			type: 'Layout',
			template: [
				'<div class="row">',

				'<div class="col-xs-3">',
				'<label id="label" class="control-label">',
				'</label>',
				'</div>',

				'<div class="col-xs-1">',
				'<div class="checkbox">',
				'<label><input id="status" type="checkbox" action="click"></label>',
				'</div>',
				'</div>',

				'<div class="col-xs-2">',
				'<select id="action" class="form-control" action="actionChange">',
				'</select>',
				'</div>',

				'<div class="col-xs-1">',
				'<div class="form-group">',
				'<input id="blockPeriod" type="text" class="form-control" placeholder="60">',
				'<span class="help-block input-error" ui="msg"></span>',
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
				'</div>',

				'<div id="checkboxOptions"></div>',

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

				// waf_severity_high = 1,
				// waf_severity_medium = 2,
				// waf_severity_low = 3

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
					if (elem.name !== null) {
						that.triggerAction.push({
							value: elem.value,
							label: elem.name,
						});
					}
					
				});
			},
			appendSelectOptions: function(options, target) {
				if (options) {
					for (var i = 0; i < options.length; ++i) {
						var item = options[i];
						if(item.label !== null) {
							this.$el.find(target).append('<option value="' + item.value + '">' + item.label + '</option>');	
						}
					}
				}
			},
			renderForm: function() {
				if (this.checkboxOptions) {
					var iconHtml = '<span id="icon" class="glyphicon glyphicon-chevron-down" action="click"></span>';
					this.$el.find('#label').append(iconHtml);
					this.$el.find('#label').append(' ');
				}

				this.$el.find('#label').append(this.label);
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

				this.blockPeriodStatusModify();
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
				value.status = this.$el.find('#status').prop('checked');
				value.action = this.$el.find('#action').val();
				value.blockPeriod = this.$el.find('#blockPeriod').val();
				value.severity = this.$el.find('#severity').val();
				value.triggerAction = this.$el.find('#triggerAction').val();

				var subClass = this.$el.find('input[type="checkbox"][id!="status"][value!="all"]');
				var array = [];
				_.each(subClass, function(elem, index) {
					if ($(elem).prop('checked') == false)
						array.push($(elem).attr('value'));
				});

				value.subClass = array;
				return value;
			},
			setVal: function(data) {
				this.$el.find('input').prop('checked', true);

				this.$el.find('#status').prop('checked', data.status);
				this.$el.find('#action').val(data.action);
				this.$el.find('#blockPeriod').val(data.blockPeriod);
				this.$el.find('#severity').val(data.severity);
				this.$el.find('#triggerAction').val(data.triggerAction);

				var that = this;
				_.each(data.subClass, function(elem, index) {
					that.$el.find('input[value=' + elem + ']').prop('checked', false);
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
			blockPeriodStatusModify: function() {
				if ('11' === this.$el.find('#action').val()) {
					this.$el.find('#blockPeriod').prop('disabled', false);
				} else {
					this.$el.find('#blockPeriod').prop('disabled', true);
				}
			},
			disable: function() {
				this.$el.find('input, select').prop('disabled', true);
			},
			actions: {
				"click": function($triggerTag, e) {
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
					this.blockPeriodStatusModify();
				}
			}
		});

		return view;
	});
	app.editor('signaturesSelectEx', function() {
		var view = app.view({
			type: 'Layout',
			template: [
				'<div class="row">',

				'<div class="col-xs-3">',
				'<label id="label" class="control-label">',
				'</label>',
				'</div>',

				'<div class="col-xs-1">',
				'<div class="checkbox" id = "statusDiv">',
				'<label><input id="status" type="checkbox" action="click"></label>',
				'</div>',
				'</div>',

				'<div class="col-xs-1">',
				'<div id = "mitigation">',
				'<input id="edMitigation" type="checkbox" action="click" >',
				'</div>',
				'</div>',

				'<div class="col-xs-2">',
				'<select id="action" class="form-control" action="actionChange">',
				'</select>',
				'</div>',

				'<div class="col-xs-1">',
				'<div class="form-group">',
				'<input id="blockPeriod" type="text" class="form-control" placeholder="60">',
				'<span class="help-block input-error" ui="msg"></span>',
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

				'<div class="col-xs-1">',
				'<div class="checkbox" id = "threatStatus">',
				'<label><input id="threatCheckbox" type="checkbox"></label>',
				'</div>',
				'</div>',
				'</div>',
			],
			initialize: function(options) {
				this.name = options.name;
				this.label = options.label;
				this.layout = options.layout;
				this.checkboxOptions = options.checkboxOptions;
				this.threatScoring = options.threatScoringOption;
				this.threatScoreOption = options.threatScoreOption;
				this.triggerActionOption = options.triggerActionOption;
				this.statusOption = options.statusOption;
				this.action = options.action;
				this.value = options.value;
				this.options = options;

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
					if (elem.name !== null) {
						that.triggerAction.push({
							value: elem.value,
							label: elem.name,
						});
					}
					
				});
			},
			appendSelectOptions: function(options, target) {
				if (options) {
					for (var i = 0; i < options.length; ++i) {
						var item = options[i];
						if(item.label !== null) {
							this.$el.find(target).append('<option value="' + item.value + '">' + item.label + '</option>');	
						}
					}
				}
			},
			renderForm: function() {
				if (this.checkboxOptions ||this.threatScoring) {
					var iconHtml = '<span id="icon" class="glyphicon glyphicon-chevron-down" action="onCheck"></span>';
					this.$el.find('#label').append(iconHtml);
					this.$el.find('#label').append(' ');
				}
				if (this.threatScoreOption === true) {
					this.$el.find("#threatStatus").show();
				} else {
					this.$el.find("#threatStatus").hide();
				}
				this.$el.find('#label').append(this.label);
				this.appendSelectOptions(this.action, '#action');
				this.appendSelectOptions(this.severity, '#severity');
				if (this.triggerActionOption !== false) {
					this.appendSelectOptions(this.triggerAction, '#triggerAction');	 
				} else {
					this.$el.find("#triggerAction").hide();
				}

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
					this.$el.find('#status').prop('checked', this.value.status);
					this.$el.find('#action').val(this.value.action);
					this.$el.find('#blockPeriod').val(this.value.blockPeriod);
					this.$el.find('#severity').val(this.value.severity);
					if(this.value.mitigation !== true) {
						this.$el.find('#mitigation').html('');
					}
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

				this.blockPeriodStatusModify();
				if (this.statusOption === false) {
					this.hideSatus();
					this.$el.find('#status').prop('checked', true);
				}
				
			},
			hideSatus: function(){
				this.$el.find("#statusDiv").hide();

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
				value.status = this.$el.find('#status').prop('checked');
				if (!_.isUndefined(this.$el.find('#edMitigation'))) {
					value.mitigation = this.$el.find('#edMitigation').prop('checked');
				}
				
				value.action = this.$el.find('#action').val();
				value.blockPeriod = this.$el.find('#blockPeriod').val();
				value.severity = this.$el.find('#severity').val();
				if (this.triggerActionOption !== false) {
					value.triggerAction = this.$el.find('#triggerAction').val();	
				}
				
				value.threatCheckbox = this.$el.find('#threatCheckbox')[0].checked;

			
				return value;
			},
			setVal: function(data) {
				//this.$el.find('input').prop('checked', true);

				this.$el.find('#status').prop('checked', data.status);
				if (this.value.mitigation) {
					if (data.mitigation === true || data.mitigation == 1) {
						this.$el.find('#edMitigation').prop('checked', true);
					} else {
						this.$el.find('#edMitigation').prop('checked', false);
					}
				}
				//this.$el.find('#edMitigation').prop('checked', false );
				this.$el.find('#action').val(data.action);
				this.$el.find('#blockPeriod').val(data.blockPeriod);
				this.$el.find('#severity').val(data.severity);
				this.$el.find('#triggerAction').val(data.triggerAction);
				this.$el.find('#threatCheckbox').prop('checked', data.threatCheckbox);
				this.setDefaultEnable(data.status)
			
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
			toggerThreatScoreSub: function(flag){
				if(flag) {
					$("[editor=threatScoringThreshold]").hide();
					$("[editor=threatScoringScope]").hide();
				} else {
					$("[editor=threatScoringThreshold]").show();
					$("[editor=threatScoringScope]").show();
				}
				
			},
			togger: function(flag) {
				var iconClass = this.$el.find('#icon').attr('class');
				var $icon = this.$el.find('#icon');

				if (true === flag) {
					$icon.removeClass('glyphicon-chevron-down');
					$icon.addClass('glyphicon-chevron-right');
					this.hideCheckboxes();
					this.toggerThreatScoreSub(flag);
				} else {
					$icon.removeClass('glyphicon-chevron-right');
					$icon.addClass('glyphicon-chevron-down');
					this.showCheckboxes();
					this.toggerThreatScoreSub(flag);
				}
			},
			blockPeriodStatusModify: function() {
				if ('11' === this.$el.find('#action').val()) {
					this.$el.find('#blockPeriod').prop('disabled', false);
				} else {
					this.$el.find('#blockPeriod').prop('disabled', true);
				}
			},
			disable: function() {
				this.$el.find('input, select').prop('disabled', true);
			},
			setDefaultEnable: function(status) {
				if (true === status) {
					//this.$el.find('#blockPeriod').prop('disabled', false);
					this.$el.find('#action').prop('disabled', false);
					this.$el.find('#severity').prop('disabled', false);
					this.$el.find('#triggerAction').prop('disabled', false);
					this.$el.find('#threatCheckbox').prop('disabled', false);
					this.$el.find('#edMitigation').prop('disabled', false);
					this.blockPeriodStatusModify();
				} else {
					this.$el.find('#blockPeriod').prop('disabled', true);
					this.$el.find('#action').prop('disabled', true);
					this.$el.find('#severity').prop('disabled', true);
					this.$el.find('#triggerAction').prop('disabled', true);
					this.$el.find('#threatCheckbox').prop('disabled', true);
					this.$el.find('#edMitigation').prop('disabled', true);
				}
			},
			actions: {
				"click": function($triggerTag, e) {
					var isEnable = this.$el.find('#status').prop('checked');
					this.setDefaultEnable(isEnable)
				},
				"onCheck": function($triggerTag, e) {
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
					this.blockPeriodStatusModify();
				}
			}
		});

		return view;
	});
	app.editor("signatureExcp", function() {
		var view = app.view({
		type: "Layout",
		template: [
			'<div class= "row">',
			'<div class="col-xs-4">',
			'<label id="label" class="control-label"></label>',
			'</div>',
			'<div class="col-xs-6">',
			'<input type ="checkbox" id = "get" unchecked>GET</input>',
			'&nbsp<input type ="checkbox" id = "post" unchecked>POST</input>',
			'&nbsp<input type ="checkbox" id = "head" unchecked>HEAD</input>',
			'</div>',
			'</div>',

			'<div class= "row">',
			'<div class="col-xs-4"></div>',
			'<div class="col-xs-7">',
			'<input type ="checkbox" id = "options" unchecked>OPTIONS</input>',
			'&nbsp<input type ="checkbox" id = "trace" unchecked>TRACE</input>',
			'&nbsp<input type ="checkbox" id = "connect" unchecked>CONNECT</input>',
			'</div>',
			'</div>',
			'<div class= "row">',
			'<div class="col-xs-4"></div>',
			'<div class="col-xs-6">',
			'<input type ="checkbox" id = "delete" unchecked>DELETE</input>',
			'&nbsp<input type ="checkbox" id = "put" unchecked>PUT</input>',
			'&nbsp<input type ="checkbox" id = "others" unchecked>OTHERS</input>',
			'</div>',
			'</div>',
		],
		initialize: function(options) {
			this.label = options.label;
			this.data = options.data

		},
		onRender: function() {
			this.$el.find("#label").append(this.options.label);
			if (!_.isUndefined(this.data)) {
				this.$el.find("#get").prop('checked', this.data.get);
				this.$el.find("#post").prop('checked', this.data.post);
				this.$el.find("#head").prop('checked', this.data.head);
				this.$el.find("#options").prop('checked', this.data.options);
				this.$el.find("#trace").prop('checked', this.data.trace);
				this.$el.find("#connect").prop('checked', this.data.connect);
				this.$el.find("#delete").prop('checked', this.data.delete);
				this.$el.find("#put").prop('checked', this.data.put);
				this.$el.find("#others").prop('checked', this.data.others);
			} 

		},
		getVal: function() {
			val = {};
			_.extend(val, {get: this.$el.find("#get").prop('checked'),
				post: this.$el.find("#post").prop('checked'),
				head: this.$el.find("#head").prop('checked'),
				options: this.$el.find("#options").prop('checked'),
				trace: this.$el.find("#trace").prop('checked'),
				connect: this.$el.find("#connect").prop('checked'),
				delete: this.$el.find("#delete").prop('checked'),
				put: this.$el.find("#put").prop('checked'),
				others: this.$el.find("#others").prop('checked'),
			});
			return val;

		},
		setVal: function(data) {
			this.$el.find("#get").prop('checked', data.get);
			this.$el.find("#post").prop('checked', data.post);
			this.$el.find("#head").prop('checked', data.head);
			this.$el.find("#options").prop('checked', data.options);
			this.$el.find("#trace").prop('checked', data.trace);
			this.$el.find("#connect").prop('checked', data.connect);
			this.$el.find("#delete").prop('checked', data.delete);
			this.$el.find("#put").prop('checked', data.put);
			this.$el.find("#others").prop('checked', data.others);
		},

		});

		return view;
	});

	app.editor('signatureSlider', function() {
		var view = app.view({
			type: "Layout",
			template: [
				'<div class="row">',
				'<div class="col-xs-2">',
				'<label id="label" class="control-label"></label>',
				'</div>',
				'<div id= "slider"></div>',
				'</div>',
			],
			initialize: function(options){
				this.val = "1";
				this.name = options.name;
				this.label = options.label;
				//this.layout = options.layout;
				this.scope = options.scope;
			},
			onRender: function(){
				this.$el.find('#label').append(this.label);
				$("#slider").slider();
				self = this;
				$("#slider").on("sliderchange", function(e, result) {
					console.log("action: " + result.action + ", value: " + result.value);
					self.val = result.value;
				});
			},
			onShow: function() {

			},
			getVal: function() {
				return this.val;
			},
			setVal: function(data) {

			},
		});
		
		return view;
	});
})(Application);