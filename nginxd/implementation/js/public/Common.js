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
                label: 'col-xs-3',
                field: 'col-xs-6'
            }
        },
        name: {
            type: 'text',
            label: 'Name',
            validate: {
                required: {}
            },
            help: "", //''
            editOnce: true
        },
        key: {
            type: 'text',
            label: '关键字',
            validate: {
                required: {}
            },
            help: "政府关键字，必须唯一且为英文", //''
            editOnce: true
        },
        label:{
            type: "text",
            label: "label",
            help: '可读的中文',
        },
        area:{
            type: "text",
            label: "area",
        },
        link:{
            type: "text",
            label: "home",
            help: '主页',
        },
        condition: {
            type: "text",
            label: "Craw Condition",
            help: "爬取的页面条件，多为标题xpath"
        },
        nextPageXpath: {
            type: "text",
            label: "Next Page",
            help: "分页中的下一页xpath"
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
    subEditorOptions = {
        _global: {
            layout: {
                label: 'col-xs-3',
                field: 'col-xs-6'
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
        xpath: {
            type: 'text',
            label: 'xpath',
        },
        option: {
            type: 'checkbox',
            label: 'option',
        },
    };

   
})(Application);