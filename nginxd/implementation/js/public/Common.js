;
(function(app) {
	toolActions = [{
		eventName: "add",
		faIcon: "fa-plus-circle",
		label: "add"
	},{
		eventName: "edit",
		//faIcon: "fa-plus-circle",
		label: "edit"
	},{
		eventName: "delete",
		faIcon: "fa-minus-circle",
		label: "delete"
	}];
	editorOptions = {
        _global: {
            layout: {
                label: 'col-xs-2',
                field: 'col-xs-4'
            }
        },
        name: {
            type: 'text',
            label: 'Name',
            validate: {
                required: {}
            },
            editOnce: true
        },
        label:{
            type: "text",
            label: "label",
        },
        area:{
            type: "text",
            label: "area",
        },
        link:{
            type: "text",
            label: "home",
        },
        condition: {
            type: "text",
            label: "Craw Condition"
        },
    };
    gridColumns = [{
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
    
   
})(Application);