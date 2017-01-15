(function(app) {
   var contextName = "GovDepartment";
    var view = app.view({
        name: 'SiteSetting',
        template:['<div region="tool"></div>',
                  '<div region="grid"></div>',
                  '<div region ="formview"> </div>'],
        className: 'wrapper-full container-fluid',
        //template: '@mockups/' + m.tpl,
        initialize: function(option){
            
        },
        onEditMode: function(){
            toggleCtrlViewShow(this.tool, false);
            toggleCtrlViewShow(this.grid, false);
        },
        onGridMode: function(){
            toggleCtrlViewShow(this.tool, true);
            toggleCtrlViewShow(this.grid, true);
        },
        onSubEditMode: function(){
            this.formview.currentView.$el.hide();
        },
        onSubGridMode: function(){
            this.formview.currentView.$el.show();
        },
        onShow: function(){
            var that = this;
            this.tool.show(app.widget('GridTool', {
                actions: toolActions
            }));

            app.remote({
                entity: contextName,
            }).done(function(data, textStatus, jqXHR) {
                that.showGrid(data, textStatus, jqXHR);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                app.failCommon(jqXHR, textStatus, errorThrown);
            });
        },
        showGrid: function(data){
            this.grid.show(app.widget('Grid', {
                context: contextName,
                columns: gridColumns,
                data: data,
            }));
        }, 
        onGridAction: function(eventName, data,collectionView, itemView){
            if(eventName == "trClick") {
                collectionView.children.each(function(view) {
                    view.$el.removeClass("log_entry_selected")
                });
                itemView.$el.addClass("log_entry_selected");
                this.select = data["_id"];
                this.selectData = data;
            } else if(eventName == "add") {
                this.trigger("view:edit-mode");
                this.formview.show(new FormView());
            } else if(eventName == "edit") {
                var d = this.selectData;
                // if (_.isUndefined(d) && !_.isUndefined(this.select)) {
                //     d = this.selectData;
                // }
                if (_.isUndefined(d)){
                    app.trigger("app:notify", {
                        type: "error",
                        msg: "You must select a department!",
                    });
                }
                this.trigger("view:edit-mode");
                this.formview.show(new FormView({data: d}));
            } else if(eventName == "delete") {
                var that = this;
                app.trigger("app:notify", {
                    type: "confirm",
                    msg: "Delete?",
                    btn: [{
                        label: "Ok",
                        action: function() {
                            that.grid.currentView.trigger("view:data-delete", that.select);
                            that.formview.close();
                        }
                    }, {
                        label: "Cancel",
                    }]
                });
            }
        },
        onDataModify: function(newdata) {
            if (!newdata["_id"]) {
                newdata["_id"] = "single";
            }
            this.grid.currentView.trigger("view:data-modify", newdata, {refresh:false});
        },
        onModifyOver: function(options) {
            if (!options ){//cancel
                this.formview.close();
                this.grid.currentView.trigger('view:grid-refresh');
                this.trigger("view:grid-mode");
            }else{//create and edit ok
                var that = this;
                app.remote({
                    entity: contextName,
                }).done(function(data, textStatus, jqXHR) {
                    that.grid.currentView.trigger('view:grid-refresh',data);
                    var idField = that.grid.currentView.body.currentView.idField || '_id';
                    var id = options[idField] || options.name;
                    var model = that["grid"].currentView.body.currentView.collection.get(id);
                    that.trigger("view:grid-action", 'edit', model.toJSON());
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    app.failCommon(jqXHR, textStatus, errorThrown);
                });
            }
        },
    });
    var formView = "Department Setting";
    var title = formView;
    var FormView = app.view({
        type: "Layout",
        template: [
            '<div region="form"></div>',
            '<div region="grid"></div>',
        ],
        initialize: function(options) {
            this.data = options.data;
            this.editorOptions = _.extend({}, editorOptions);
        },
        onShow: function() {
            this.form.show(app.widget('FormBody', {
                name: formView,  //app.i18n().trans(name)
                editors: this.editorOptions,
                title: this.data ? 'Edit ' + title : 'New ' + title,
                footerType: "okCancel",
                data: this.data,
            }));

            if (this.data) {
                this.grid.show(new SubGridView({
                    parentId: this.data._id,
                    data: this.data.fields,
                }));
            } else {
                this.grid.$el.html('<label>Create New</label><div>Create a Recorder First!</div>');
            }
        },
        onRenderOver: function(displayStr) {
            //this.form.currentView.getEditor("matchSeq").setVal(displayStr);
        },
        onDataModify: function(newdata) {
            this.parentCt.trigger("view:data-modify", newdata);
        },
        onSubModify: function(subData){
            var find = false;
            _.each(this.data.fields, function(e){
                if (e["name"]== subData["name"]){
                    _.extend(e, subData);
                    find = true;
                }
            });
            if (!find){ //added a new item
                this.data.fields.push(subData);
            }
            this.trigger("view:data-modify", this.data);
        },
        onModifyOver: function() {
            this.parentCt.trigger("view:modify-over");
        },
        onSubEditMode: function(){
            this.form.currentView.$el.hide();
        },
        onSubGridMode: function(){
            this.form.currentView.$el.show();
        },
    });

	var SubGridView = app.view({
        type: 'Layout',
        template: [
            '<div region="tool"></div>',
            '<div region="grid"></div>',
            '<div region="formview"></div>',
        ],
        initialize: function(options) {
            this.parentId = options.parentId;
            this.data = options.data;
        },
        onShow: function() {
        	this.tool.show(app.widget('GridTool', {
                actions: toolActions
            }));
            this.showGrid(this.data); 
        },
      
        showForm: function(options) {
            //data = options.data ;
            if (_.isUndefined(options)) { //create
                this.formview.show(app.widget('FormBody', {
                    name: "NewField",
                    editors: subEditorOptions,
                    title: 'New field',
                    footerType: "okCancel",
                }));
            } else {
                data = options.data ;
                this.formview.show(app.widget('FormBody', {
                    name: "EditField",
                    editors: subEditorOptions,
                    title: 'Edit Field',
                    footerType: "okCancel",
                    data: data,
                }));
            }
           
        },
        makeGridData: function(fields){
            if (_.isUndefined(fields)){
                return [];
            }
        	_.each(fields, function(e){
                if(!e._id){
                    e._id = e.name;
                }
        	});
            return fields;
        },
        showGrid: function(data) {
            var gridData = this.makeGridData(data);
            var subColumnOptions = [{label: "field", name: "name"}, {label: "option", name: "option"}, {label: "select path", name: "xpath"}];
            this.grid.show(app.widget('Grid', {
                //context: contextName,
                columns: subColumnOptions,
                data: gridData,
            }));
        },
        onGridAction: function(eventName, data,collectionView, itemView, $btn) {
            if (eventName == "trClick") {
                collectionView.children.each(function(view) {
                    view.$el.removeClass("log_entry_selected")
                });
                itemView.$el.addClass("log_entry_selected");
                this.select = itemView.model.attributes;             
                
            }else if (eventName == "create") {
				this.trigger("view:edit-mode");
                this.showForm();
            } else if (eventName == "edit") {
				this.trigger("view:edit-mode");
                this.showForm({data: this.select, readonly: false});
            } else if (eventName === 'view') {
				this.trigger("view:edit-mode");
                this.showForm({data: data, readonly: true});
            } else if (eventName == "delete") {
                var that = this;
                this.$el.find("[event_name='insert']").addClass("disabled");
                this.$el.find("[event_name='move']").addClass("disabled");
                app.trigger("app:notify", {
                    type: "confirm",
                    msg: "Delete?",
                    btn: [{
                        label: "Ok",
                        action: function() {
                            that.grid.currentView.trigger("view:data-delete", data._id);
                            that.formview.close();
                        }
                    }, {
                        label: "Cancel",
                    }]
                });
            }
        },
        onDataModify: function(newdata) {
            if (this.insert === true) {
                var currentId = this.getCurrentRealId();
                _.extend(newdata, {order:"before", to: currentId});
                this.insert = false;
            } else if(this.move) {
                this.move = false;
                newdata.seq = this.select;
                var currentId = this.getCurrentRealId();
                var order = "after";
                var beforeSeqId = 1;
                if (newdata.before) {
                    order = "before";
                } else {
                    beforeSeqId = this.getNextSeqByRealId(newdata.pos);
                } 
                _.extend(newdata, {_id:this._id, order:order, to: newdata.pos, child_mkey: currentId, beforeSeqId:beforeSeqId}); //consistent with the web implement
            }
            this.grid.currentView.trigger("view:data-modify", newdata);
        },
        onModifyOver: function() {
            this.formview.close();
            this.grid.currentView.trigger('view:grid-refresh');
            this.onShow();
			this.trigger("view:grid-mode");
        },
        onDeleteOver: function(id) {
            this.seqData = _.reject(this.seqData, function(row) {
                return row._id == id;
            });
            this.trigger("view:modify-over");
        },
		onEditMode: function(){
			toggleCtrlViewShow(this.tool, false);
			toggleCtrlViewShow(this.grid, false);
			this.parentCt.trigger("view:sub-edit-mode");
		},
		onGridMode: function(){
			toggleCtrlViewShow(this.tool, true);
			toggleCtrlViewShow(this.grid, true);
			this.parentCt.trigger("view:sub-grid-mode");
		},
        onDataModify: function(newdata) {
            this.parentCt.trigger("view:sub-modify", newdata);
            this.trigger("view:modify-over");
        },
        onModifyOver: function() {
            this.formview.close();
            //this.grid.currentView.trigger('view:grid-refresh');
            this.onShow();
            this.trigger("view:grid-mode");
        },
    });
})(Application);