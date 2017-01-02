(function(app) {
	app.editor('Slider', function() {
		var sliderView = app.view({
			template: [
				'<label class="col-xs-2" for="slider">{{label}}</label>',

				'<div class="col-xs-3">',
				'<input id="slider" type="range" min="0" max="100" step="1" action="click">',
				'</div>',

				'<div class="col-xs-1">',
				'<span id="info"></span>',
				'</div>',

				'<span class="col-xs-12">{{help}}</span>',
				'<hr class="col-xs-12">',
			],
			className: 'form-group',
			initialize: function(options) {
				this.parentCt = options.parentCt;
				this.trigger('view:render-data', options);
			},
			onRender: function() {
				this.refreshInfo();
			},
			setVal: function(val) {
				this.$el.find("#slider").val(val);
				this.refreshInfo();
			},
			getVal: function() {
				return this.$el.find("#slider").val();
			},
			refreshInfo: function() {
				var tmp = this.getVal();
				var cache_val = this.parentCt.$el.find('#cacheSize').val();
				var ret = Math.ceil(tmp * cache_val / 100);
				this.$el.find('#info').html(tmp + "% (" + ret + "KB)");
			},
			actions: {
				'click': function() {
					this.refreshInfo();
				}
			}
		});

		return sliderView;
	});
})(Application);