(function(app) {
	app.editor('multitext', function() {
		var view = app.view({
			type: 'Layout',
			template: [
				'{{#each values}}',
					'<div class="row">',

				'{{#if @index}}', // 1, 2 , 3

					'<label class="control-label col-xs-2"> </label>',
					
					'<div class="col-xs-4">',
						'<input id="input_{{@index}}" class="form-control" value = "{{value}}" type="text"></input>',
					'</div>',
					
					'<div class="col-xs-1">',
						'<i id="del_{{@index}}" class="fa fa-minus-square-o fa-2x" index={{@index}} action="del"></i>',
					'</div>',

				'{{else}}', // 0, first line

					'<label class="control-label col-xs-2">{{../../label}}</label>',

					'<div class="col-xs-4">',
						'<input id="input_{{@index}}" class="form-control" value = "{{value}}" type="text"></input>',
					'</div>',

					'<div class="col-xs-1">',
						'<i id="add_{{@index}}" class="fa fa-plus-square-o fa-2x" action="add"></i>',
						'<i id="del_{{@index}}" class="fa fa-minus-square-o fa-2x" index={{@index}} action="del"></i>',
					'</div>',

				'{{/if}}',

					'</div>',
				'{{/each}}',
			],
			initialize: function(options) {
				this.name = options.name;
				this.label = options.label;
				this.layout = options.layout;
				this.values = options.parentCt.data ? options.parentCt.data[this.name] : [""];
				this.options = options;
			},
			onRender: function() {
				this.trigger('view:render-data', this);
				var that = this;
				if (this.values.length > 0){
					_.each(this.values, function(elem, index){
						var ctrl = that.$el.find('#input_' + index);
						ctrl.val(elem);
						var delCtrl = that.$el.find('#del_' + index);
						if (that.values.length > 1)
							delCtrl.show();
						else
							delCtrl.hide();
					});
				}
			},
			getVal: function() {
				var col = [];
				_.each(this.$el.find('input[type="text"]'), function(elem) {
					var val = $(elem).val();
					col.push(val);
				});
				return col;
			},
			setVal: function(val) {
				this.values = [];
				var that = this;
				_.each(val, function(elem) {
					that.values.push(elem);
				});
				_.each(val, function(elem, index){
					that.$el.find('#input_' + index).val(elem);
				});

				this.trigger('view:render-data', this);				
			},
			validate: function() {
				//must have
			},
			
			actions: {
				'add': function($triggerTag, e) {
					this.values = this.getVal();
					this.values.push("");
					this.trigger('view:render-data', this.options);
				},
				'del': function($triggerTag, e) {
					this.values = this.getVal();
					var id = parseInt($triggerTag.context.id.slice("del_".length));
					this.values.splice(id, 1);
					this.trigger('view:render-data', this.options);
				}
			}
		});

		return view;
	});
})(Application);
