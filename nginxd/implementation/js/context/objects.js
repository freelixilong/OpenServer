(function(app){

	app.context('objects', {
		
		className: 'wrapper-full container-fluid',
		template: '@context/ContextSettings.html',

		onReady: function(){
		},
		guard: function() { // -- [optional]
            //return error to cancel navigation;
            //return '', false, undefined to proceed;
            return;
        },

        //listeners: (after guard) // -- [optional]
        onBeforeNavigateTo: function() {
            //return true to proceed;
            //return false, '', undefined to cancel navigation
            return true;
        },
        onNavigateTo: function(path) { // -- [optional]
            //path == '', undefined means the navigation stopped here.
            if (path) {
                this.pathArray = path.split('/');
            }
            this.navigateToMenu();
        },
        navigateToMenu: function() {
            if (this.pathArray && this.pathArray[0]) {
            	var content = this.getRegion('content');
                content.trigger('region:load-view', this.pathArray[0]);
            }
        },
        onNavigateAway: function() { // -- [optional]
            //... 
            //if you want to save context status (through localStorage maybe)
        },
        onShow: function() {
            //app.trigger('app:delete-cookie', 'device');
            //icon: 'ygtvlabel l2_menu_network ygtvcontent',
            this.getRegion('menu').trigger('region:load-view', 'MenuTree', {
                data: [{
                    val: 'System',
                    children: [{
                        val: 'Settings',
                        icon: 'ygtvlabel l2_menu_maintenance ygtvcontent',
                        module: 'objects/Mockups'
                    }, {
                        val: 'User',
	                    children: [{
	                        val: 'User Group',
	                        icon: 'ygtvlabel l2_menu_waf_user_group ygtvcontent',
	                        module: 'objects/CMAdminGroup'
	                    }, {
	                        val: 'Users',
	                        icon: 'ygtvlabel l2_menu_waf_local_user ygtvcontent',
	                        module: 'objects/CMLDAPServer',
	                    },{
                        val: 'Admin',
                        icon: 'ygtvlabel l2_menu_admin ygtvcontent',
                        val: 'Administrators',
                        module: 'objects/Users'
                        },]
	                }, {
                        val: 'Site Settings',
                        icon: 'ygtvlabel l2_menu_network ygtvcontent',
                        module: 'objects/SiteSetting'
                    },]
                },]
            });

            //this.getRegion('content').trigger('region:load-view', 'ManagerStatus');
            this.trigger('view:resized');
        },
        onResized: function() {
            var height = $window.height();
            this.menu.$el.height(height);
            this.content.$el.height(height);
        },

	});

})(Application);