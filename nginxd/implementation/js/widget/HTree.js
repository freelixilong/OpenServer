/**
 * Sample WIDGET script.
 *
 * @author Stagejs.CLI
 * @created Tue Jan 27 2015 09:30:06 GMT+0800 (CST)
 */
;
(function(app) {

	app.widget('HTree', function() {

		var node = app.view({
			type: 'CompositeView',
			tagName: 'li',
			itemViewContainer: 'ul',
			template: '@widget/HTreeNode.html',
			className: function() {
				if (_.size(this.model.get('children')) >= 1) {
					return 'menu-item dropdown dropdown-submenu';
				}
				return 'menu-item';
			},
			initialize: function(options) {
				if (this.className() === 'menu-item dropdown dropdown-submenu')
					this.collection = app.collection(this.model.get('children'));
			},
		});

		var UI = app.view({
			type: 'CompositeView',
			className: 'dropdown',
			itemView: node,
			itemViewContainer: 'ul',
			template: '@widget/HTree.html',
			initialize: function(options) {
				this._options = options;
			},
			onShow: function() {
				this.trigger('view:render-data', this._options.data);
				this.$el.find('a:first').css('color', '#ffffff');
			},
		});

		return UI;
	});

})(Application);