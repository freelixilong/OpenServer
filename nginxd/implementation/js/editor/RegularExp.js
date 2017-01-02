/*
 @author zqqiang
 @create 2014.07.03
*/

(function(app) {
	var RegularView = app.view({
		type: 'Layout',
		template: [
			'<div class="panel panel-default">',
			'<div class="panel-heading">Regular Expression Validator</div>',
			'<div class="panel-body">',

			'<div editor="regularExpression"></div>',
			'<div id="regularhelp"><span class="help-block editor-help-text" style="margin-bottom:0"><small>0/2071</small></span></div>',
			'<div><span id="check"></span></div>',
			'<div editor="test"></div>',
			'<div id="testhelp"><span class="help-block editor-help-text" style="margin-bottom:0"><small>0/2071</small></span></div>',
			'<div><span id="result"></span></div>',

			'<button class="btn btn-primary" action="validate">Validate</button>',

			'<div class="panel-footer">',
			'<button class="btn btn-primary" action="ok">Ok</button> ',
			'<button class="btn btn-info" action="cancel">Cancel</button>',
			'</div>',

			'</div>',
		],
		overlay: true,
		editors: {
			regularExpression: {
				type: 'textarea',
				label: 'Regular Expression (maximum 2070 characters)',
				rows: 3,
			},
			test: {
				type: 'textarea',
				label: 'Test',
				rows: 3,
			}
		},
		initialize: function(options) {
			this.data = options.data;
		},
		onShow: function() {
			var nlength = this.data.length;
			this.$el.find('div[editor="regularExpression"]').find('textarea').val(this.data);
			this.$el.find("#regularhelp").html("<span class='help-block editor-help-text' style='margin-bottom:0'><small>" + nlength + "/2071</small></span>");
			this.listenTo(this,"editor:keyup",this.onFormChange);
		},
		actions: {
			'ok': function() {
				this.close();
			},
			'cancel': function() {
				this.close();
			},
			'validate': function() {
				var reg = this.getEditor('regularExpression').getVal();
				try {
					var pattern = new RegExp(reg);
					var test = this.getEditor('test').getVal();
					var result = pattern.test(test);

					this.$el.find('#check').html('Right');

					if (result) {
						this.$el.find('#result').html('Result: match.');
					} else {
						this.$el.find('#result').html('Result: No match.');
					}
				}catch(err) {
					this.$el.find('#check').html('Wrong');
					this.$el.find('#result').html('Result: No match.');
				} 
			}
		},
		onFormChange: function(editorName,editor){
			var nlength = editor.getVal().length;
		
			if (editorName == "regularExpression")
				editor.parentCt.$el.find("#regularhelp").html("<span class='help-block editor-help-text' style='margin-bottom:0'><small>"+ nlength+"/2071</small></span>");
			if (editorName == "test")
				editor.parentCt.$el.find("#testhelp").html("<span class='help-block editor-help-text' style='margin-bottom:0'><small>"+ nlength+"/2071</small></span>");
		},
	});

	app.editor('regularText', function() {
		return app.view({
			template: [
				'<label class="control-label {{layout.label}}" for="basic-editor-{{name}}">{{label}}</label>',
				'<div class="{{layout.field}}" title="" data-toggle="tooltip">',
				'<div class="text">',
				'<input id="basic-editor-{{name}}" class="form-control" type="text" value="" placeholder="" name="{{name}}" ui="input">',
				'</div>',
				'<span class="help-block input-error" ui="msg">{{help}}</span>',
				'</div>',
				'<a href="javascript:void(0);" action="click"><i class="fa fa-angle-double-right fa-2x"></i></a>',
			],
			className: 'form-group',
			initialize: function(options) {
				this.options = options;
				this.trigger('view:render-data', options);
			},
			onRender: function() {
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
					};
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
				} else {
					this.validate = function(show) {
						//todo
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
				return this.$el.find('input[name=' + this.options.name + ']').val();
			},
			setVal: function(data) {
				this.$el.find('input[name=' + this.options.name + ']').val(data);
			},
			actions: {
				'click': function() {
					var value = this.options.parentCt.$el.find('input[name="' + this.options.name + '"]').val();
					var view = new RegularView({
						data: value
					});
					view.overlay();
				}
			}
		});
	});
})(Application);