/*
	author by zqqiang
*/

;
(function(app) {
	//device group
	app.setDeviceGroup = function(options) {
		if (_.isUndefined(app.contextMenu)) app.contextMenu = {};
		app.contextMenu.currentDeviceGroup = options.deviceGroup;
	};
	app.getDeviceGroup = function() {
		if (_.isUndefined(app.contextMenu)) app.contextMenu = {};
		return app.contextMenu.currentDeviceGroup;
	};

	//template
	app.setCurrentTemplate = function(options) {
		if (_.isUndefined(app.contextMenu)) app.contextMenu = {};
		app.contextMenu.currentTemplate = options.template;
	};
	app.getCurrentTemplate = function() {
		if (_.isUndefined(app.contextMenu)) app.contextMenu = {};
		return app.contextMenu.currentTemplate;
	};
})(Application);