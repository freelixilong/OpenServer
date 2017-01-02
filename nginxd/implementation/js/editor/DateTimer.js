(function(app) {
	app.editor('timePicker', function() {
		return app.view({
			template: [
				'<label class="control-label"></label>',
				'<div class="" title="" data-toggle="tooltip">',

				'<div class="text">',
				'<input class="form-control" type="text" ui="input">',
				'</div>',

				'<span class="help-block" style="margin-bottom:0"><small></small></span>',
				'<span class="help-block input-error" ui="msg"></span>',
				'</div>',
			],
			className: 'form-group',
			initialize: function(options) {
				this.label = options.label;
				this.layout = options.layout;
				this.name = options.name;
				this.value = options.value;
			},
			onRender: function() {
				this.$el.find('label').addClass(this.layout.label);
				this.$el.find('label').append(this.label);
				this.$el.find('div[data-toggle="tooltip"]').addClass(this.layout.field);
				this.$el.find('input').attr('name', this.name);
				this.$el.find('input').timepicker();
				if (this.value) {
					this.setVal(this.value);
				}
			},
			getVal: function() {
				return this.$el.find('input').val();
			},
			setVal: function(data) {
				this.$el.find('input').val(data);
			},
			disable: function(data) {
				if (data) {
					this.$el.find('input').prop('disabled', false);
				} else {
					this.$el.find('input').prop('disabled', true);
				}
			},
			validate: function() {},
			status: function() {},
		});
	});

	app.editor('datePicker', function() {
		return app.view({
			template: [
				'<label class="control-label"></label>',
				'<div title="" data-toggle="tooltip">',

				'<div class="text">',
				'<input class="form-control" type="text" ui="input">',
				'</div>',

				'<span class="help-block" style="margin-bottom:0"><small></small></span>',
				'<span class="help-block input-error" ui="msg"></span>',
				'</div>',
			],
			className: 'form-group',
			initialize: function(options) {
				this.label = options.label;
				this.layout = options.layout;
				this.name = options.name;
				this.value = options.value;
			},
			onRender: function() {
				if (this.layout) {
					this.$el.find('label').addClass(this.layout.label);
					this.$el.find('div[data-toggle="tooltip"]').addClass(this.layout.field);
				}
				this.$el.find('label').html(this.label);
				this.$el.find('input').attr('name', this.name);
				this.$el.find('input').datepicker();
				if (this.value) {
					this.setVal(this.value);
				}
			},
			getVal: function() {
				return this.$el.find('input').val();
			},
			setVal: function(data) {
				this.$el.find('input').datepicker('setDate', new Date(data));
			},
			disable: function(data) {
				if (data) {
					this.$el.find('input').prop('disabled', false);
				} else {
					this.$el.find('input').prop('disabled', true);
				}
			},
			validate: function() {},
			status: function() {},
		});
	});

	app.editor('dateTimePicker', function() {
		return app.view({
			template: [
				'<label class="control-label"></label>',
				'<div title="" data-toggle="tooltip">',

				'<div class="text">',
				'<input class="form-control" type="text" ui="input">',
				'</div>',

				'<span class="help-block" style="margin-bottom:0"><small></small></span>',
				'<span class="help-block input-error" ui="msg"></span>',
				'</div>',
			],
			className: 'form-group',
			initialize: function(options) {
				this.label = options.label;
				this.layout = options.layout;
				this.name = options.name;
				this.showSecond = options.showSecond;
				this.onlyHour = options.onlyHour;
				this.value = options.value;
			},
			onRender: function() {
				var config = {};
				if (this.showSecond) {
					config.timeFormat = 'HH:mm:ss';
				} else if (this.onlyHour) {
					config.timeFormat = 'HH';
				} else {
					//default format
					config.timeFormat = 'HH:mm';
				}

				this.$el.find('label').addClass(this.layout.label);
				this.$el.find('label').html(this.label);
				this.$el.find('div[data-toggle="tooltip"]').addClass(this.layout.field);
				this.$el.find('input').attr('name', this.name);
				this.$el.find('input').datetimepicker(config);

				if (this.value) {
					this.setVal(this.value);
				}
			},
			getVal: function() {
				return this.$el.find('input').val();
			},
			getDateVal: function() {
				//return new Date() object
				return this.$el.find('input').datetimepicker('getDate');
			},
			setVal: function(data) {
				if (_.isObject(data)) {
					this.$el.find('input').datetimepicker('setDate', new Date(data));
				} else {
					//set new Date() object
					var value = data.match(/\d+/g);
					var dateTime = new Date();

					if (Number(value[2]) > 1970)
						dateTime.setFullYear(Number(value[2]), Number(value[0] - 1), Number(value[1]));
					else
						dateTime.setFullYear(Number(value[0]), Number(value[1] - 1), Number(value[2]));
					dateTime.setHours(Number(value[3]));
					dateTime.setMinutes(Number(value[4]))
					this.$el.find('input').datetimepicker('setDate', dateTime);
				}
			},
			disable: function(data) {
				if (data) {
					this.$el.find('input').prop('disabled', false);
				} else {
					this.$el.find('input').prop('disabled', true);
				}
			},
			validate: function() {},
			status: function() {},
		});
	});

})(Application);