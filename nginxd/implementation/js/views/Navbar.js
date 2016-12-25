
;
(function(app) {
	app.view({
		name: 'Navbar',
		template: '@view/Navbar.html',
		onShow: function() {
			var href = window.location.href;
			var indexNav = href.indexOf('#navigate');


			
			this.$el.find("#logout").css({
				"float" : "right",
				"margin-right" : "20px",
			});
		},
		actions: {
			click: function($triggerTag, e, lock) {
				$triggerTag.children('a').toggleClass('selected');
				if (this.selectedTag) {
					this.selectedTag.children('a').toggleClass('selected');
				}
				this.selectedTag = $triggerTag;
			},
		
		}
	});

})(Application);