/**
 * Sample MAIN script.
 *
 * @author Stagejs.CLI
 * @created Wed Jan 21 2015 14:54:18 GMT+0800 (CST)
 */
;
(function(app) {

	/////////////////setup/////////////////
	app.setup({
		theme: 'project',
		fullScreen: true,
		template: '@main.html',
		navRegion: 'contextBody',
		defaultContext: 'object',
		baseAjaxURI: 'data',
		//Note: Always set navRegion if using app template here, unless you've merged it(the tpl) with index.html;
	});

	///////bootstrapping events//////////// - [optional]
	//app:before-template-ready (if you have app template)
	//app:template-ready (if you have app template)
	//-- now you will have app.mainView as the view instance holding the app template.
	//
	//initialize:before

	///////////more initializers/////////// - [optional]
	app.addInitializer(function() {
		app.onResized = function() {
			app.mainView.contextBody.resize({
				width: '100%',
				height: '100%'
			});
		};
	});

	app.addInitializer(function() {

	});

	//-- add more initializer if you need
	//
	//initialize:after
	//start (this is also an event)

	/////////////craft app engine////////// - [optional]
	var engine = app.module('Engine');
	_.extend(engine, {

		//your engine apis for managing this app's state. (e.g invoked in Contexts and Views)

	});

	///////////////kick start//////////////
	app.run( /*'deviceready' if you are developing with Cordova*/ );

})(Application);