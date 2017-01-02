;(function(app) {

	app.editor('Bcheckbox', function() {

		var UI = app.view({

			template: [
				'<label class="col-xs-2 text-right" for="slider">{{label}}</label>',
				'<div class="col-xs-3">',
					'<a class = "btn {{#if value}} btn-success {{else}} btn-default {{/if}} rounded btn-small" action="toggle" ui="checkbox" style="padding:0 5px">{{#if value}}On{{else}}Off{{/if}}</a>',
				'</div>'
			],
			className: 'form-group',
			initialize: function(options) {
				this.trigger('view:render-data', options);
			},
			getVal: function() {
				if(this.ui.checkbox.hasClass('btn-success')){
					return true;
				}else{
					return false;
				}
			},
			setVal: function(val) {
				if (val){
					this.onAction();
				}else{
					this.offAction();
				}
			},
			onAction: function(){
				this.ui.checkbox.html('On');
				this.ui.checkbox.addClass('btn-success');
				this.ui.checkbox.removeClass('btn-default');
			},
			offAction: function(){
				this.ui.checkbox.html('Off');
				this.ui.checkbox.removeClass('btn-success');
				this.ui.checkbox.addClass('btn-default');
			},
			validate: function() {

			},
			disable: function(flag) {//false to enable, default to disable, true to disable + hide.

				if ( _.isUndefined(flag)){
					this.$el.find('a').addClass('disabled');
				}else if ( flag ){
					this.$el.find('a').addClass('disabled');
					this.$el.hide();
				}else{
					this.$el.find('a').removeClass('disabled');
					this.$el.show();
				}
			},
			actions: {
				toggle: function($btn, e){
					e.stopPropagation();
					if(! $btn.hasClass('btn-success')){
						this.onAction();
					}else{
						this.offAction();
					}

					this.options.parentCt.trigger('editor:change', this.model.get('name'), this);
				}
			}
		});

		return UI;
	});

})(Application);