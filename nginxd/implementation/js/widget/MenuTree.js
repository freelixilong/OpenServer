/**
 * Sample WIDGET script.
 *
 * @author Stagejs.CLI
 * @created Thu Jan 29 2015 15:11:17 GMT+0800 (CST)
 */
;
(function(app) {

	app.widget('MenuTree', function() {

		var childIcon = 'themes/project/img/icon/menu_child.png';
		var lastChildIcon = 'themes/project/img/icon/menu_child_last.png';
		var minusIcon = 'themes/project/img/icon/menu_minus.png';
		var lastMinusIcon = 'themes/project/img/icon/menu_minus_last.png';
		var plusIcon = 'themes/project/img/icon/menu_plus.png';
		var lastPlusIcon = 'themes/project/img/icon/menu_plus_last.png';

		var UI = app.view({
			//type: 'Layout',
			template: '@widget/MenuTree.html',
			initialize: function(options) {
				this._options = options;
			},
			onShow: function() {
				this.getRegion('menuTree').trigger('region:load-view', 'Tree', {
					data: this._options.data,
					node: {
						template: '@view/MenuNode.html',
						onShow: function() {

							var $parent = this.$el.data('$parent');
							var $children = this.$el.data('$children');
							var children = this.model.get('children');
							var $target = this.$el.children("a").find("img.node");

							
							
							if ($parent && children) {
								if(this.parent && this.parent.isTheLastChild(this.model)){
									this.$el.find('ul:first').hasClass('hidden') ? $target.attr('src', lastPlusIcon) : $target.attr('src', lastMinusIcon);
								}else{
									this.$el.find('ul:first').hasClass('hidden') ? $target.attr('src', plusIcon) : $target.attr('src', minusIcon);
								}
								
							} else if (!children) {
								if(this.parent && this.parent.isTheLastChild(this.model)) $target.attr('src', lastChildIcon);
								else $target.attr('src', childIcon);
							} else {
								$target.removeAttr('src');
							}

							var $li = $children.children('li');

							if($li.length){
								var i=$li.length-1;
								$($li[i]).children("ul").addClass("last");
							}
							
						},
						isTheLastChild: function(model){
							var children = this.model.get('children');
							return children ? (model.get('val') === children[children.length-1].val) : false;
						}
					},
					onSelected: function(meta, $el, e) {
						$el.children("a").toggleClass("selected");

						if (this.selectedMenu) {
							this.selectedMenu.toggleClass('bg-info');
						}

						$el.children("a").toggleClass("bg-info");
						this.selectedMenu = $el.children('a');

						var $parent = $el.data('$parent');
						var children = meta.view.model.get('children');
						var $target = $el.children("a").find('img.node');

						if ($parent && children) {
							if (meta.view.parent && meta.view.parent.isTheLastChild( meta.view.model )){
								$el.find('ul:first').hasClass('hidden') ? $target.attr('src',lastPlusIcon) : $target.attr('src', lastMinusIcon);
							}
							else {
								$el.find('ul:first').hasClass('hidden') ? $target.attr('src', plusIcon) : $target.attr('src', minusIcon);
							}
						} else if (!children) {
							if (meta.view.parent && meta.view.parent.isTheLastChild( meta.view.model )) $target.attr('src', lastChildIcon);
							else $target.attr('src', childIcon);
						} else {
							$target.removeAttr('src');
						}
					},
				});
				this.$el.find('ul.tree.tree-root').children().find('a:first').click();
			},
			onResized: function() {
	            var height = $window.height() - 76;
	            var wdith = $window.height() - 10;
	            this.menuTree.$el.height(height);
	            this.menuTree.$el.width(wdith);
	        },
		});

		return UI;
	});

})(Application);