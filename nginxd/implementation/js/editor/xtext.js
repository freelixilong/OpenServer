/**
 * Sample EDITOR script.
 *
 * @author Stagejs.CLI
 * @created Fri Apr 17 2015 15:51:42 GMT+0800 (CST)
 */
;
(function(app) {

	app.editor('Xtext', function() {

		var UI = app.view({

			template: '@editor/xtext.html',
			className: 'form-group',
			initialize: function(options) {
				this.trigger('view:render-data', options);
			},
			getVal: function() {
				return this.ui.input.val();
			},
			setVal: function(val) {
				this.ui.input.val(val);
			},
			validate: function() {

			},
			disable: function(flag) {
				if (_.isUndefined(flag)) {
					//disable but visible, will not participate in validation
					if (this.ui.input)
						this.ui.input.prop('disabled', true);
					return;
				}

				if (flag) {
					//hide and will not participate in validation
					this.$el.hide();
				} else {
					//shown and editable
					if (this.ui.input)
						this.ui.input.prop('disabled', false);
					this.$el.show();
				}
			}
		});

		return UI;
	});

})(Application);