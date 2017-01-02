/**
 * Sample EDITOR script.
 *
 * @author Stagejs.CLI
 * @created Fri Apr 17 2015 14:53:08 GMT+0800 (CST)
 */
;
(function(app) {

	app.editor('Xcheckbox', function() {

		var UI = app.view({

			template: '@editor/xcheckbox.html',
			className: 'form-group',
			events: {
				'change': '_triggerEvent',
			},
			initialize: function(options) {
				this.trigger('view:render-data', options);
				this.parentCt = options.parentCt;
			},
			_triggerEvent: function(e) {
				var host = this;
				host.trigger('editor:' + e.type, this.model.get('name'), this);

				if (this.parentCt) {
					host = this.parentCt;
				}
				host.trigger('editor:' + e.type, this.model.get('name'), this);
			},
			getVal: function() {
				return this.ui.input.prop('checked') ? (this.model.get('checked') || true) : (this.model.get('unchecked') || false);
			},
			setVal: function(data) {
				this.ui.input.prop('checked', data);
				this.parentCt.trigger('editor:change', this.model.get('name'), this);
			},
			validate: function() {

			},
		});

		return UI;
	});

})(Application);