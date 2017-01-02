(function(app) {
	var toolActions = [{
		eventName: "add",
		faIcon: "fa-plus-circle",
		label: "add"
	},{
		eventName: "edit",
		faIcon: "fa-plus-circle",
		label: "edit"
	},{
		eventName: "delete",
		faIcon: "fa-plus-circle",
		label: "delete"
	}];
	var gridColumns = [{
		label: 'Name',
		name: 'name'
	}, {
		label: 'key',
		name: 'key'
	}, {
		label: 'area',
		name: 'area'
	}, {
		label: 'link',
		name: 'link'
	},{
		label: 'craw condition',
		name: 'condition'
	},];
	var view = app.view({
		name: 'SiteSetting',
		template:['<div region="tool"></div>',
		          '<div region="grid"></div>',
				  '<div region ="form"> </div>'],
		className: 'wrapper-full container-fluid',
		//template: '@mockups/' + m.tpl,
		initialize: function(option){
			this.context = "GovDepartment";
		},
		onShow: function(){
			var that = this;
			this.tool.show(app.widget('GridTool', {
				actions: toolActions
			}));
			app.remote({
				entity: this.context,
			}).done(function(data, textStatus, jqXHR) {
				that.showGrid(data, textStatus, jqXHR);
			}).fail(function(jqXHR, textStatus, errorThrown) {
				app.failCommon(jqXHR, textStatus, errorThrown);
			});
		},
		showGrid: function(data){
			this.grid.show(app.widget('Grid', {
				context: this.context,
				columns: gridColumns,
				data: data,
			}));
		}

	});
})(Application);