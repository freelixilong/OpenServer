(function(app) {
	app.editor('signatureViolation', function() {

		var signatureView = app.view({
			type: 'Layout',
			template: [
				'<div class="panel panel-default" scroll="yes" style="width: 350px; height: 350px; overflow-y:scroll;">',
					'<div class="panel-heading"><strong id="title">Signature</strong></div>',

					'<div class="panel-body">',
						'<form class="form-horizontal" role="form">',

							'<div class="row">',
								'<div class="col-xs-5">',
								'<label id="label" class="control-label">Signature ID</label>',
								'</div>',

								'<div class="col-xs-5">',
								'<label id="label" class="control-label">Status</label>',
								'</div>',
							'</div>',

							'<div class="row">',
								'<div class="col-xs-5">',
								'<label id="label" class="control-label">All / None</label>',
								'</div>',

								'<div class="col-xs-5">',
								'<div class="checkbox">',
								'<label><input id="all" type="checkbox" action="all_click" value="all"></label>',
								'</div>',
								'</div>',
							'</div>',
							'{{#each sigClass}}',
								'<div class="row">',
									'<div class="col-xs-5">',
									'<label id="label" class="control-label">{{this}}</label>',
									'</div>',

									'<div class="col-xs-5">',
									'<div class="checkbox">',
									'<label><input id={{this}} type="checkbox" action="click" value={{this}}></label>',
									'</div>',
									'</div>',
								'</div>',
							'{{/each}}',
							'<button class="btn btn-primary" action="ok">OK</button>&nbsp;&nbsp;',
							'<button class="btn btn-primary" action="cancel">Cancel</button>',
						'</form>',
					'</div>',
				'</div>'
			],
			overlay: true,
			initialize: function(options) {
				this.options = options;
				this.parentCt = options.parentCt;
				this.data = options.data;
				this.sigClass = options.sigClass;
				this.subClass = options.subClass;
				this.signatures = options.signatures;
			},
			onShow: function() {
				this.trigger('view:render-data', this);
				this.setCheckedValues()
			},
			setCheckedValues: function() {
				var that = this;
				if ($.inArray('all', this.signatures) >= 0)
					this.$el.find('input[type="checkbox"]').prop('checked', true);
				else {
					this.$el.find('input[type="checkbox"][value="all"]').prop('checked', true);
					_.each(this.signatures, function(elem, index) {
						that.$el.find('input[value=' + elem + ']').prop('checked', true);
					});
					var sigCheckboxes = this.$el.find('input[type="checkbox"][value!="all"]');
					_.each(sigCheckboxes, function(elem, index) {
						if ($(elem).prop('checked') == false)
							that.$el.find('input[type="checkbox"][value="all"]').prop('checked', false);
					});
				}
			},
			onDataModify: function() {
				var sigCheckboxes = this.$el.find('input[type="checkbox"]');
				var array = [];
				_.each(sigCheckboxes, function(elem, index) {
					if ($(elem).prop('checked') == true)
						array.push($(elem).attr('value'));
				});

				this.parentCt.trigger('view:data-modify', {sigClass: array, subClass: this.subClass});
				this.close();
			},
			onModifyOver: function() {
				this.parentCt.trigger('view:modify-over');
			},
			actions: {
				'ok': function() {
					this.trigger('view:data-modify');
				},
				'cancel': function() {
					this.close();
				},
				"all_click": function($triggerTag, e) {
					var $all = this.$el.find('input[value="all"]');
					var checkbox_list = this.$el.find('input[type="checkbox"]');

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
				"click": function($triggerTag, e) {
					if (false === $triggerTag.prop('checked')) {
						this.$el.find('input[type="checkbox"][value="all"]').prop('checked', false);
					} else {
						this.$el.find('input[type="checkbox"][value="all"]').prop('checked', true);
						var subClass = this.$el.find('input[type="checkbox"][value!="all"]');
						var that = this;
						_.each(subClass, function(elem, index) {
							if ($(elem).prop('checked') == false)
								that.$el.find('input[type="checkbox"][value="all"]').prop('checked', false);						});
						
					}
				},
			}
		});
		var view = app.view({
			type: 'Layout',
			template: [
				'<div class="row">',

				'<div class="col-xs-2">',
				'<label id="label" class="control-label">',
				'</label>',
				'</div>',

				'<div class="col-xs-10">',
				'<div class="checkbox">',
				'<label><input id="status" type="checkbox" action="click"></label>',
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
				this.value = options.value;

				this.options = options;
				this.signatures = []
			},
			renderForm: function() {
				if (this.checkboxOptions) {
					var iconHtml = '<span id="icon" class="glyphicon glyphicon-chevron-down" action="click"></span>';
					this.$el.find('#label').append(iconHtml);
					this.$el.find('#label').append(' ');
				}

				this.$el.find('#label').append(this.label);

				if (this.checkboxOptions) {
					var $checkboxOptions = this.$el.find('#checkboxOptions');

					var checkboxHtml = '';

					for (var i = 0; i < this.checkboxOptions.length; ++i) {
						var item = this.checkboxOptions[i];
						checkboxHtml += '<div class="checkbox">' +
							'<label><input type="checkbox" action="sub_click" value=' +
							item.value +
							'>' +
							item.label +
							'</label>' +
							'<span main=' + item.main + ' sub=' + item.sub + ' class="list_sprite tool_edit" action="signature"></span>' +
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
				} else {
					var iconHtml = '<span main=' + this.options.main + ' sub=' + this.options.sub + ' class="list_sprite tool_edit" action="signature"></span>';
					this.$el.find('#status').parent().after(iconHtml);				
				}
			},
			onRender: function() {
				this.renderForm();

				if (this.value) {
					this.$el.find('#status').prop('checked', this.value.status);

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
			},
			onDataModify: function(newData) {
				if (newData.subClass == "000000000") {
					this.signatures = newData.sigClass;
				} else {
					for (var i = 0; i < this.checkboxOptions.length; ++i) {
						if (this.checkboxOptions[i].sub == newData.subClass) {
							this.checkboxOptions[i].signatures = newData.sigClass;
							break;
						}
					}
				}
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

				var subClass = this.$el.find('input[type="checkbox"][id!="status"]');
				var array = [];
				_.each(subClass, function(elem, index) {
					if ($(elem).prop('checked') == true)
						array.push($(elem).attr('value'));
				});

				value.subClass = array;
				value.signatures = [];

				if (this.checkboxOptions) {
					for (var i = 0; i < this.checkboxOptions.length; ++i) {
						_.each(this.checkboxOptions[i].signatures, function(elem, index){
							value.signatures.push(elem);
						});
					}
				} else {
					value.signatures = this.signatures;
				}
				return value;
			},
			setVal: function(data) {
				this.$el.find('#status').prop('checked', data.status);

				var that = this;

				if ($.inArray('all', data.subClass) >= 0) {
					var checkbox_list = this.$el.find('#checkbox_list').find('input[type="checkbox"]');
					_.each(checkbox_list, function(elem) {
						$(elem).prop('checked', true);
					});
				} else {
					_.each(data.subClass, function(elem, index) {
						that.$el.find('input[value=' + elem + ']').prop('checked', true);
					});
				}
				if (this.checkboxOptions) {
					for (var i = 0; i < this.checkboxOptions.length; ++i) {
						this.checkboxOptions[i].signatures = []
					}
					_.each(data.signatures, function(elem, index) {
						for (var i = 0; i < that.checkboxOptions.length; ++i) {
							if (elem > that.checkboxOptions[i].main && elem - that.checkboxOptions[i].sub < 300) {
								that.checkboxOptions[i].signatures.push(elem);
								break;
							}
						}
					});
				} else {
					this.signatures = data.signatures;
				}
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
			disable: function() {
				this.$el.find('input, select').prop('disabled', true);
			},
			actions: {
				"click": function($triggerTag, e) {
					var $status = this.$el.find('#status');
					if (false === $status.prop('checked')) {
						this.togger(true);
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
				"sub_click": function($triggerTag, e) {
					var $all = this.$el.find('input[value="all"]');
					var checkbox_list = this.$el.find('#checkbox_list').find('input[type="checkbox"]');

					if (false === $triggerTag.prop('checked')) {
						$all.prop('checked', false);
					} else {
						$all.prop('checked', true);
						_.each(checkbox_list, function(elem, index) {
							if ($(elem).prop('checked') == false)
								$all.prop('checked', false);						});
						
					}
				},
				"signature": function($triggerTag, e) {
					var main = $triggerTag.attr('main');
					var sub = $triggerTag.attr('sub');

					var signatures = null;
					if (this.checkboxOptions) {
						for (var i = 0; i < this.checkboxOptions.length; ++i) {
							if (this.checkboxOptions[i].value == sub) {
								signatures = this.checkboxOptions[i].signatures;
								break;
							}
						}
					} else {
						signatures = this.signatures;
					}
					var that = this;
					app.remote({
						entity: "SignatureViolationSubSig",
						params: {
							main: main,
							sub: sub,
						}
					}).done(function(data, textStatus, jqXHR) {
						var sigview = new signatureView({
							parentCt: that,
							sigClass: data,
							subClass: sub,
							signatures: signatures,
						});
						sigview.overlay();
					}).fail(function(jqXHR, textStatus, errorThrown) {
						app.failCommon(jqXHR, textStatus, errorThrown);
					});

				},

			}
		});

		return view;
	});
})(Application);