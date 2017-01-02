/**
 * Sample WIDGET script.
 *
 * @author Stagejs.CLI
 * @created Fri Apr 03 2015 09:52:27 GMT+0800 (CST)
 */
;
(function(app) {

	app.widget('FormTitle', function() {
		return app.view({
			template: [
				'{{#if title}}',
				'<div class="panel panel-primary">',
				'<div class="panel-heading">',
				'<h3 class="panel-title text-center">{{title}}</h3>',
				'</div>',
				'</div>',
				'{{/if}}',
			],
			initialize: function(options) {
				this.trigger('view:render-data', options);
			},
		});
	});

	app.widget('FormFooter', function() {
		return app.view({
			template: [
				'<div class="">',

				'{{#is footerType "ok"}}',
				'<button class="btn btn-primary center-block" action="ok">OK</button> ' +
				'{{/is}}',

				'{{#is footerType "okCancel"}}',
				'<div class="text-center">',
				'<button class="btn btn-primary" action="ok">OK</button> ',
				'<button class="btn btn-default" action="cancel">Cancel</button>',
				'</div>',
				'{{/is}}',

				'{{#is footerType "apply"}}',
				'<button class="btn btn-primary center-block" action="ok">Apply</button>',
				'{{/is}}',

				'{{#is footerType "close"}}',
				'<button class="btn btn-primary center-block" action="cancel">Close</button>',
				'{{/is}}',

				'{{#is footerType "return"}}',
				'<button class="btn btn-primary center-block" action="ok">Return</button>',
				'{{/is}}',

				'{{#is footerType "returnOnly"}}',
				'<button class="btn btn-primary center-block" action="cancel">Return</button>',
				'{{/is}}',

				'{{#is footerType "returnAdvanced"}}',
				'<div class="text-center">',
				'<button class="btn btn-primary" action="ok">OK</button> ',
				'<button class="btn btn-default" action="advanced">Advanced Mode</button>',
				'</div>',
				'{{/is}}',

				'{{#is footerType "pushConfig"}}',
				'<button class="btn btn-primary center-block" action="ok">Push Config</button>',
				'{{/is}}',

				'{{#is footerType "pushConfigDelete"}}',
				'<div class="text-center">',
				'<button class="btn btn-primary" action="ok">Push Config</button> ',
				'<button class="btn btn-default" action="cancel">Delete</button>',
				'</div>',
				'{{/is}}',

				'{{#is footerType "backup"}}',
				'<button class="btn btn-primary center-block" action="ok">Backup</button>',
				'{{/is}}',

				'{{#is footerType "testokCancel"}}',
				'<div class="text-center">',
				'<button class="btn btn-primary" action="ok">OK</button> ',
				'<button class="btn btn-default" action="cancel">Cancel</button> ',
				'<button class="btn btn-default" action="test">Test Connection</button> ',
				'</div>',
				'{{/is}}',

				'{{#is footerType "readonlyreturnAdvanced"}}',
				'<div class="text-center">',
				'<button class="btn btn-primary" action="cancel">Return</button> ',
				'<button class="btn btn-default" action="advanced">Advanced Mode</button> ',
				'</div>',
				'{{/is}}',

				'{{#is footerType "okCancelAdvanced"}}',
				'<div class="text-center">',
				'<button class="btn btn-primary" action="ok">OK</button> ',
				'<button class="btn btn-default" action="cancel">Cancel</button> ',
				'<button class="btn btn-primary" action="advanced">Advanced Mode</button> ',
				'</div>',
				'{{/is}}',

				'{{#is footerType "restore"}}',
				'<div class="text-center">',
				'<button class="btn btn-primary" action="ok">Restore Default</button> ',
				'</div>',
				'{{/is}}',

				'{{#is footerType "registerUnregister"}}',
				'<div class="text-center">',
				'{{#is can_reg true}}',
					'<button class="btn btn-primary" action="ok">Register</button> ',
				'{{else}}',
					'<button class="btn btn-primary" action="ok" disabled>Register</button> ',
				'{{/is}}',
				'{{#is can_unreg true}}',
					'<button class="btn btn-default" action="unregister">Unregister</button> ',
				'{{else}}',
					'<button class="btn btn-default" action="unregister" disabled>Unregister</button> ',
				'{{/is}}',
				'</div>',
				'{{/is}}',

				'</div>'
			],
			initialize: function(options) {
				this.trigger('view:render-data', options);
			},
			onShow: function() {

			},
			actions: {
				ok: function() {
					this.parentCt.trigger('view:data-modify');
				},
				cancel: function() {
					this.parentCt.trigger("view:modify-over");
				},
				test: function() {
					this.parentCt.trigger("view:modify-test");
				},
				advanced: function() {
					this.parentCt.trigger('view:modify-advanced');
				},
				unregister: function() {
					this.parentCt.trigger('view:modify-unregister');
				}
			}
		});
	});

	//form widget
	app.widget('FormBody', function() {
		return app.view({
			type: 'Layout',
			template: [
				'<div region="formTitle"></div>',

				'<form class="form-horizontal" role="form">',

				'{{#each editors}}',
				'<div editor={{@key}}></div>',
				'{{/each}}',
				'</form>',

				'<div region="formFooter"></div>',
			],
			initialize: function(options) {
				this.name = options.name;
				this.title = options.title;
				this.editors = options.editors;
				this.footerType = options.footerType;
				this.data = options.data;
				this.onEditorChange = options.onEditorChange;
				this.readonly = options.readonly;

				if (options.template) this.template = options.template;

				this.on('editor:change', function() {
					this.conditionShow();
				});

				this.trigger('view:render-data', options);
			},
			onShow: function() {
				var editors = this.dataSrcShow(this.editors);
				this.activateEditors(editors);

				if (this.data) {
					this.setValues(this.data, true);
				} else {
					this.setDefaultValues();
				}

				this.conditionShow();
				this.editOnce();

				if (this.readonly) {
					this.$el.find('input, select, textarea').prop('disabled', true);
				}

				this.formTitle.show(app.widget('FormTitle', {
					title: this.title,
				}));

				if("registerUnregister" == this.footerType)
					this.formFooter.show(app.widget('FormFooter', {
						footerType: this.footerType,
						can_reg: this.data.can_reg,
						can_unreg: this.data.can_unreg,
					}));
				else
					this.formFooter.show(app.widget('FormFooter', {
						footerType: this.footerType,
					}));
			},
			editOnce: function() {
				if (this.data) {
					for (p in this.editors) {
						if (this.editors[p].editOnce) {
							this.$el.find('div[editor=' + p + ']').find('input, select').prop('disabled', true);
						}
					}
				}
			},
			onDataModify: function() {
				if (_.isEmpty(this.validate(true))) {
					this.parentCt.trigger('view:data-modify',
						this.data ? _.extend(this.data, this.getValues()) : this.getValues());
				}
			},
			onModifyOver: function() {
				this.parentCt.trigger('view:modify-over');
			},
			onModifyTest: function() {
				this.parentCt.trigger('view:modify-test');
			},
			onModifyAdvanced: function() {
				this.parentCt.trigger('view:modify-advanced');
			},
			onModifyUnregister: function() {
				this.parentCt.trigger('view:modify-unregister');
			},
			getCurrentContext: function() {
				return app.currentContext.name;
			},

			conditionShow: function() {
				for (p in this.editors) {
					if (this.editors[p].condition) {
						if (this.editors[p].condition(this)) {
							$('div[editor=' + p + ']').show();
						} else {
							$('div[editor=' + p + ']').hide();
						}
					}
					if (this.editors[p].enableCondition) {
						var status = this.editors[p].enableCondition(this);
						if ('select' === this.editors[p].type) {
							this.$el.find('div[editor=' + p + ']').find('select')
								.attr("disabled", !status);
						} else if ('dateTimePicker' === this.editors[p].type) {
							this.$el.find('div[editor=' + p + ']').find('select, input')
								.attr("disabled", !status);
							this.getEditor(p).disable(status);
						} else if ('textarea' === this.editors[p].type) {
							this.$el.find('div[editor=' + p + ']').find('textarea')
								.attr("disabled", !status);
						} else {
							this.$el.find('div[editor=' + p + ']').find('input')
								.attr("disabled", !status);
						}
					}
					if (this.onEditorChange) {
						this.onEditorChange(this);
					}

					if (this.editors[p].detail) {

						this.$el.find('div[editor=' + p + ']').find('div').find('a').remove();

						if (this.getEditor(p).getVal() === '') {
							this.$el.find('div[editor=' + p + ']').find('div').find('div[data-toggle="tooltip"]').after('<a href="javascript:void(0);" onClick="alert('+'\'No policy has been chosen. Please choose a policy from the drop down menu.\''+')">Detail...</a>');
						} else {
							var prefixUrl = '';
							if (this.getCurrentContext() == "PolicyObjects") {
								prefixUrl = 'PolicyObjects/Objects/';
								this.$el.find('div[editor=' + p + ']').find('div').find('div[data-toggle="tooltip"]').after('<a href="/#navigate/' + prefixUrl + this.editors[p].detailSrc + '/' + this.getEditor(p).getVal() + '">Detail...</a>');
							} else {
								var path = this.editors[p].detailSrc;
								device = getCookie("device");
								this.$el.find('div[editor=' + p + ']').find('div').find('div[data-toggle="tooltip"]').after('<a href ="/#navigate/DeviceManager/DevicesGroups/Devices/' + device + '" value = "'+path +'" >Detail...</a>');
								self = this;
								this.$el.find('div[editor=' + p + ']').has("a").bind("click", function(target) {
									if (target !== null && target !== '') {
										opath = target.target.getAttribute("value");
										path = _.compact(String(opath).split('/'));
										if (path != "undefined" && null !== opath&&path.length > 1) {
											tView = path[path.length -1];
											self.parentCtx.getRegion('deviceContent').trigger('region:load-view', 'Device', {device: device,targetView:tView, path:opath});
										}
									}
								});
							}
						}
					}
				}
			},

			dataSrcShow: function(options) {
				var editors = options;

				for (p in options) {
					if (options[p].dataSrc) {
						app.remote({
							entity: options[p].dataSrc,
							async: false,
						}).done(function(data) {
							if ('select' === options[p].type) {
								if (undefined === options[p].options || undefined === options[p].options.data) {
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
									if (editors[p].filter) {
										if (data[i][editors[p].filterKey] == editors[p].filterValue) {
											obj.label = data[i].label ? data[i].label : data[i].name;
											obj.value = undefined != data[i].value ? data[i].value : data[i].name;
											editors[p].options.data.push(obj);
										} else
											continue;

									} else {
										obj.label = data[i].label ? data[i].label : data[i].name;
										obj.value = undefined != data[i].value ? data[i].value : data[i].name;
										editors[p].options.data.push(obj);
									}
								}

								//editors[p].options.data.sort(function(a,b){return a.value>b.value?1:-1});
								var swaparray = editors[p].options.data.slice(0);
								var total = swaparray.length;
								editors[p].options.data.splice(0,swaparray.length);

								for (var i = 0; i < (total-1); ++i) {
									if(swaparray[i].value != swaparray[i+1].value){
										editors[p].options.data.push(swaparray[i])
									}else
										continue;
								}
								if(total>0){
									editors[p].options.data.push(swaparray[total-1]);
								}

							} else if ('text' === options[p].type) {
								editors[p].value = data[p];
							} else if ('conditionText' === options[p].type) {
								editors[p].value = data[editors[p].key];
							}
						}).fail(function(jqXHR, textStatus, errorThrown) {
							app.failCommon(jqXHR, textStatus, errorThrown);
						});
					}
				}

				return editors;
			},
			setDefaultValues: function() {
				//some editor has options which can not set value as default values
				//so set default values in onShow method
				for (var i in this.editors) {
					if (this.editors[i].options) {
						var value = this.editors[i].value;
						if (value) {
							this.getEditor(i).setVal(value, true);
						}
					}
				}
			}
		});
	});

	//form widget
	app.widget('FormBodySpin', function() {
		return app.view({
			type: 'Layout',
			template: [
				'<div region="formTitle"></div>',

				'<div name="spin" style="margin-bottom: 20px;">',
				'<ul class="fa-ul">',
				'<li><i class="fa-li fa fa-spinner fa-pulse"></i></li></li>',
				'</ul>',
				'</div>',

				'<form class="form-horizontal" role="form">',

				'{{#each editors}}',
				'<div editor={{@key}}></div>',
				'{{/each}}',
				'</form>',

				'<div style="clear:both">',

				'<div region="formFooter"></div>',
			],
			initialize: function(options) {
				this.name = options.name;
				this.title = options.title;
				this.editors = options.editors;
				this.footerType = options.footerType;
				this.data = options.data;
				this.onEditorChange = options.onEditorChange;
				this.readonly = options.readonly;

				this.on('editor:change', function() {
					this.conditionShow();
				});

				this.trigger('view:render-data', options);
			},
			onShow: function() {
				this.formTitle.show(app.widget('FormTitle', {
					title: this.title,
				}));

				if("registerUnregister" == this.footerType)
					this.formFooter.show(app.widget('FormFooter', {
						footerType: this.footerType,
						can_reg: this.data.can_reg,
						can_unreg: this.data.can_unreg,
					}));
				else
					this.formFooter.show(app.widget('FormFooter', {
						footerType: this.footerType,
					}));

				var editors = this.dataSrcShow(this.editors);
				this.activateEditors(editors);

				if (this.data) {
					this.$el.find('div[name="spin"]').hide();
					this.setValues(this.data, true);
				} else {
					this.setDefaultValues();
				}

				this.conditionShow();
				this.editOnce();

				if (this.readonly) {
					this.$el.find('input, select, textarea').prop('disabled', true);
				}
			},
			editOnce: function() {
				if (this.data) {
					for (p in this.editors) {
						if (this.editors[p].editOnce) {
							this.$el.find('div[editor=' + p + ']').find('input').prop('disabled', true);
						}
					}
				}
			},
			onDataModify: function() {
				if (_.isEmpty(this.validate(true))) {
					this.parentCt.trigger('view:data-modify',
						this.data ? _.extend(this.data, this.getValues()) : this.getValues());
				}
			},
			onModifyOver: function() {
				this.parentCt.trigger('view:modify-over');
			},
			onModifyTest: function() {
				this.parentCt.trigger('view:modify-test');
			},
			onModifyAdvanced: function() {
				this.parentCt.trigger('view:modify-advanced');
			},
			onModifyUnregister: function() {
				this.parentCt.trigger('view:modify-unregister');
			},
			getCurrentContext: function() {
				return app.currentContext.name;
			},

			conditionShow: function() {
				for (p in this.editors) {
					if (this.editors[p].condition) {
						if (this.editors[p].condition(this)) {
							$('div[editor=' + p + ']').show();
						} else {
							$('div[editor=' + p + ']').hide();
						}
					}
					if (this.editors[p].enableCondition) {
						var status = this.editors[p].enableCondition(this);
						if ('select' === this.editors[p].type) {
							this.$el.find('div[editor=' + p + ']').find('select')
								.attr("disabled", !status);
						} else if ('dateTimePicker' === this.editors[p].type) {
							this.$el.find('div[editor=' + p + ']').find('select, input')
								.attr("disabled", !status);
							this.getEditor(p).disable(status);
						} else if ('textarea' === this.editors[p].type) {
							this.$el.find('div[editor=' + p + ']').find('textarea')
								.attr("disabled", !status);
						} else {
							this.$el.find('div[editor=' + p + ']').find('input')
								.attr("disabled", !status);
						}
					}
					if (this.onEditorChange) {
						this.onEditorChange(this);
					}

					if (this.editors[p].detail) {
						this.$el.find('div[editor=' + p + ']').find('div').find('a').remove();
						var prefixUrl = '';
						if (this.getCurrentContext() == "PolicyObjects") {
							if (this.getEditor(p).getVal() != '') {
								prefixUrl = 'PolicyObjects/Objects/';
							}
							this.$el.find('div[editor=' + p + ']').find('div').find('div[data-toggle="tooltip"]').after('<a href="/#navigate/' + prefixUrl + this.editors[p].detailSrc + '/' + this.getEditor(p).getVal() + '">Detail...</a>');
						} else {
							if (this.getEditor(p).getVal() != '') {
								var path = this.editors[p].detailSrc;
							}
							device = getCookie("device");
							this.$el.find('div[editor=' + p + ']').find('div').find('div[data-toggle="tooltip"]').after('<a href ="/#navigate/DeviceManager/DevicesGroups/Devices/' + device + '" value = "'+path +'" >Detail...</a>');
							self = this;
							this.$el.find('div[editor=' + p + ']').has("a").bind("click", function(target) {
								if (target !== null && target !== '') {
									opath = target.target.getAttribute("value");
									path = _.compact(String(opath).split('/'));
									if (path != "undefined" && null !== opath&&path.length > 1) {
										tView = path[path.length -1];
										self.parentCtx.getRegion('deviceContent').trigger('region:load-view', 'Device', {device: device,targetView:tView, path:opath});
									}
								}
							});
						}
					}
				}
			},

			dataSrcShow: function(options) {
				var editors = options;

				for (p in options) {
					if (options[p].dataSrc) {
						app.remote({
							entity: options[p].dataSrc,
							async: false,
						}).done(function(data) {
							if ('select' === options[p].type) {
								if (undefined === options[p].options || undefined === options[p].options.data) {
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
									if (editors[p].filter) {
										if (data[i][editors[p].filterKey] == editors[p].filterValue) {
											obj.label = data[i].label ? data[i].label : data[i].name;
											obj.value = undefined != data[i].value ? data[i].value : data[i].name;
											editors[p].options.data.push(obj);
										} else
											continue;

									} else {
										obj.label = data[i].label ? data[i].label : data[i].name;
										obj.value = undefined != data[i].value ? data[i].value : data[i].name;
										editors[p].options.data.push(obj);
									}
								}

								//editors[p].options.data.sort(function(a,b){return a.value>b.value?1:-1});
								var swaparray = editors[p].options.data.slice(0);
								var total = swaparray.length;
								editors[p].options.data.splice(0,swaparray.length);

								for (var i = 0; i < (total-1); ++i) {
									if(swaparray[i].value != swaparray[i+1].value){
										editors[p].options.data.push(swaparray[i])
									}else
										continue;
								}
								if(total>0){
									editors[p].options.data.push(swaparray[total-1]);
								}

							} else if ('text' === options[p].type) {
								editors[p].value = data[p];
							} else if ('conditionText' === options[p].type) {
								editors[p].value = data[editors[p].key];
							}
						}).fail(function(jqXHR, textStatus, errorThrown) {
							app.failCommon(jqXHR, textStatus, errorThrown);
						});
					}
				}

				return editors;
			},
			setDefaultValues: function() {
				//some editor has options which can not set value as default values
				//so set default values in onShow method
				for (var i in this.editors) {
					if (this.editors[i].options) {
						var value = this.editors[i].value;
						if (value) {
							this.getEditor(i).setVal(value, true);
						}
					}
				}
			}
		});
	});

	app.widget('ErrorView', function() {
		return app.view({
			template: [
				'{{#if source}}',
				'<div">',
				'<iframe width="1374" scrolling="no" height="150" frameborder="no" name="iframepage" id="iframepage" border="0" src="{{source}}"></iframe>',
				'</div>',
				'{{/if}}',
			],
			initialize: function(options) {
				this.trigger('view:render-data', options);
			},
		});
	});

})(Application);
