(function(app) {
	getCurrentContext = function() {
		return app.currentContext.name;
	},
	createForm = function(contextName, title, templateType, options) {
		var viewName = contextName + 'View';

		app.view({
			name: contextName,
			template: [
				'<div region="formview"></div>'
			],
			onShow: function() {
				var that = this;
				app.remote({
					entity: contextName,
				}).done(function(data, textStatus, jqXHR) {
					that.showForm(data, textStatus, jqXHR);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					app.failCommon(jqXHR, textStatus, errorThrown);
				});
			},
			showForm: function(data, textStatus, jqXHR) {
				if (200 === jqXHR.status) {
					this.formview.show(app.widget('FormBody', {
						name: viewName,
						editors: options,
						title: title,
						footerType: templateType,
						data: data,
					}));
				} else if (220 === jqXHR.status) {
					this.formview.show(app.widget('FormBody', {
						name: viewName,
						editors: options,
						title: title,
						data: data,
						readonly: true,
					}));
				}
			},
			onDataModify: function(newdata) {
				var that = this;
				var view = that.formview.currentView;

				app.remote({
					entity: contextName,
					payload: view.data._id ? _.extend({
						_id: view.data._id
					}, newdata) : newdata
				}).done(function(data, textStatus, jqXHR) {
					view.data = data;
					app.trigger("app:notify", {
						type: "success",
						msg: "Config:Success",
					});
				}).fail(function(jqXHR, textStatus, errorThrown) {
					app.failCommon(jqXHR, textStatus, errorThrown);
				});
			},
		});
	};

	createGridForm = function(contextName, title, templateType, columnOptions, editorOptions, subContextName, subTitle, subTemplateType, subColumnOptions, subEditorOptions, popString, cloneOptions, isMove) {
		var formView = contextName + 'View';
		app.view({
			name: contextName,
			template: [
				'<div region="tool"></div>',
				'<div region="grid"></div>',
				'<div region="formview"></div>',
			],
			onShow: function() {
				var that = this;
				app.remote({
					entity: contextName,
				}).done(function(data, textStatus, jqXHR) {
					that.showGrid(data, textStatus, jqXHR);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					app.failCommon(jqXHR, textStatus, errorThrown);
				});
			},
			showReadWriteGrid: function(data) {
				this.tool.show(app.widget('GridTool', {
					actions: [{
						eventName: "create",
						faIcon: "fa-plus-circle",
						label: "Create"
					}]
				}));
				
				this.grid.show(app.widget('Grid', {
					context: contextName,
					columns: columnOptions,
					data: data,
					popString: popString,
				}));
				
			},
			showReadOnlyGrid: function(data) {
				this.detail_readonly = true;
				var readonlyOptions = _.filter(columnOptions, function(elem) {
					return elem.label !== 'Action';
				});

				readonlyOptions.push({
					label: "Action",
					customCell: "grid-action",
					actions: [{
						label: "View",
						eventName: "view"
					}]
				});

				this.grid.show(app.widget('Grid', {
					context: contextName,
					columns: readonlyOptions,
					data: data,
					popString: popString,
				}));
			},
			showGrid: function(data, textStatus, jqXHR) {
				if (200 === jqXHR.status) {
					this.showReadWriteGrid(data);
				} else if (220 === jqXHR.status) {
					//readonly status code
					this.showReadOnlyGrid(data);
				}
			},
			onEditMode: function(){
				if (this.tool.currentView)
					this.tool.currentView.$el.hide();
				this.grid.currentView.$el.hide();
			},
			onGridMode: function(){
				if (this.tool.currentView)
					this.tool.currentView.$el.show();
				this.grid.currentView.$el.show();
			},
			onNavigateTo: function(detailarg) {
				this.detailarg = detailarg;
			},
			onGridRender: function() {
				if (this.detailarg != null) {
					parm = {};
					var collection = this.grid.currentView.body.currentView.collection;
					that = this;
					_.each(collection.models, function(model) {
						temp = model.get("ngid");
						if (!temp) {
							temp = model.get('name');
						}
						if (temp == that.detailarg) {
							parm = model.attributes;
						}
					});
					if (this.detail_readonly)
						this.formview.show(new FormView({
							data: parm,
							readonly: true,
						}));
					else
						this.formview.show(new FormView({
							data: parm
						}));
				}
			},
			onGridAction: function(eventName, data) {
				if (eventName == "create") {
					this.trigger("view:edit-mode");
					this.formview.show(new FormView());
				} else if (eventName == "edit") {
					this.trigger("view:edit-mode");
					this.formview.show(new FormView({
						data: data
					}));
				} else if (eventName === 'view') {
					this.trigger("view:edit-mode");
					this.formview.show(new FormView({
						data: data,
						readonly: true,
					}));
				} else if (eventName == "delete") {
					var that = this;
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
				} else if ('clone' === eventName) {
					this.trigger("view:edit-mode");
					this.formview.show(new CloneView({
						data: data
					}));
				}
			},
			onDataModify: function(newdata) {
				this.grid.currentView.trigger("view:data-modify", newdata);
			},
			onModifyOver: function(options) {
				if (subContextName && options && !options.mkey && !options.newKey) {//create and edit ok for sub-grid
					var that = this;
					app.remote({
						entity: contextName,
					}).done(function(data, textStatus, jqXHR) {
						that.grid.currentView.trigger('view:grid-refresh',data);
						var idField = that.grid.currentView.body.currentView.idField || '_id';
						var id = options[idField] || options.name;
						var model = that.grid.currentView.body.currentView.collection.get(id);
						that.trigger("view:grid-action", 'edit', model.toJSON());
					}).fail(function(jqXHR, textStatus, errorThrown) {
						app.failCommon(jqXHR, textStatus, errorThrown);
					});
				} else { // no subgrid or cancel or clone
					this.formview.close();
					this.grid.currentView.trigger('view:grid-refresh');
					this.trigger("view:grid-mode");
				}
			},
		});

		var CloneView = app.view({
			type: 'Layout',
			template: [
				'<div region="form"></div>',
			],
			initialize: function(options) {
				this.data = options.data;
			},
			onShow: function() {
				this.form.show(app.widget('FormBody', {
					editors: {
						name: {
							type: 'text',
							label: 'Name',
							layout: {
								label: 'col-lg-1',
								field: 'col-lg-2'
							},
							validate: {
								required: {}
							},
						}
					},
					title: cloneOptions.cloneTitle,
					footerType: 'okCancel',
				}));
			},
			onDataModify: function(newdata) {
				this.parentCt.trigger("view:data-modify", {
					mkey: this.data._id,
					newkey: newdata.name,
				});
			},
			onModifyOver: function() {
				this.parentCt.trigger("view:modify-over");
			},
		});

		var FormView = app.view({
			type: "Layout",
			template: [
				'<div region="form"></div>',
				'<div region="grid"></div>',
			],
			initialize: function(options) {
				this.data = options.data;
				this.readonly = options.readonly;
			},
			onShow: function() {
				this.form.show(app.widget('FormBody', {
					name: formView,
					editors: editorOptions,
					title: this.data ? 'Edit ' + title : 'New ' + title,
					footerType: this.readonly ? 'returnOnly' : templateType,
					data: this.data,
					readonly: this.readonly,
				}));

				if (subContextName) {
					if (this.data) {
						this.grid.show(new SubGridView({
							parentId: this.data._id,
							readonly: this.readonly,
						}));
					} else {
						this.grid.$el.html('<label>Create New</label><div>Create a Recorder First!</div>');
					}
				}
			},
			onSubEditMode: function(){
				this.form.currentView.$el.hide();
			},
			onSubGridMode: function(){
				this.form.currentView.$el.show();
			},
			onDataModify: function(newdata) {
				this.parentCt.trigger("view:data-modify", newdata);
			},
			onModifyOver: function() {
				this.parentCt.trigger("view:modify-over");
			},
		});

		var subFormViewName = subContextName + 'View';

		var SubGridView = app.view({
			type: 'Layout',
			template: [
				'<div region="tool"></div>',
				'<div region="grid"></div>',
				'<div region="formview"></div>',
			],
			initialize: function(options) {
				this.parentId = options.parentId;
				this.readonly = options.readonly;
			},
			onShow: function() {
				var that = this;
				app.remote({
					entity: contextName + "/" + this.parentId + "/" + subContextName,
				}).done(function(data, textStatus, jqXHR) {
					if (isMove) {
						that.seqData = that.getSequenceData(data);	
					} else {
						that.seqData = data;
					}
					that.showGrid(that.seqData, textStatus, jqXHR);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					app.failCommon(jqXHR, textStatus, errorThrown);
				});
			},
			getSequenceData: function(data) {
				arr = _.sortBy(data, "seq");
				return arr;
			},
			onEditMode: function(){
				if (this.tool.currentView)
					this.tool.currentView.$el.hide();
				this.grid.currentView.$el.hide();
				this.parentCt.trigger("view:sub-edit-mode");
			},
			onGridMode: function(){
				if (this.tool.currentView)
					this.tool.currentView.$el.show();
				this.grid.currentView.$el.show();
				this.parentCt.trigger("view:sub-grid-mode");
			},
			showReadWriteGrid: function(data) {
				if (isMove) {
					this.tool.show(app.widget('GridTool', {
						actions: [{
							eventName: "create",
							faIcon: "fa-plus-circle",
							label: "Create"
						},{
							eventName: "insert",
							faIcon: "fa-plus-circle",
							label: "Insert"
						},{
							eventName: "move",
							faIcon: "fa-plus-circle",
							label: "Move"
						}]
					}));
				} else {
					this.tool.show(app.widget('GridTool', {
						actions: [{
							eventName: "create",
							faIcon: "fa-plus-circle",
							label: "Create"
						}]
					}));
				}
				this.$el.find("[event_name='insert']").addClass("disabled");
				this.$el.find("[event_name='move']").addClass("disabled");
				this.grid.show(app.widget('Grid', {
					context: contextName + "/" + this.parentId + "/" + subContextName,
					columns: subColumnOptions,
					data: data,
				}));
			},
			showReadOnlyGrid: function(data) {
				var readonlyOptions = _.filter(subColumnOptions, function(elem) {
					return elem.label !== 'Action';
				});

				readonlyOptions.push({
					label: "Action",
					customCell: "grid-action",
					actions: [{
						label: "View",
						eventName: "view"
					}]
				});

				this.grid.show(app.widget('Grid', {
					context: contextName + "/" + this.parentId + "/" + subContextName,
					columns: readonlyOptions,
					data: data,
				}));
			},
			showGrid: function(data, textStatus, jqXHR) {
				if (this.readonly) {
					this.showReadOnlyGrid(data);
				} else {
					if (200 === jqXHR.status) {
						this.showReadWriteGrid(data);
					} else if (220 === jqXHR.status) {
						this.showReadOnlyGrid(data);
					}
				}
			},
			onGridAction: function(eventName, data, collectionView, itemView, $btn) {
				if (isMove) {
					if (eventName == "trClick") {
						collectionView.children.each(function(view) {
							view.$el.removeClass("log_entry_selected")
						});
						itemView.$el.addClass("log_entry_selected");

						this.select = itemView.model.attributes.seq;
						this._id = itemView.model.attributes._id;
						this.$el.find("[event_name='insert']").removeClass("disabled");
						this.$el.find("[event_name='insert']").addClass("enabled");
						this.$el.find("[event_name='move']").removeClass("disabled");
						this.$el.find("[event_name='move']").addClass("enabled");
					}
				}
				if (eventName == "create") {
					this.trigger("view:edit-mode");
					this.formview.show(app.widget('FormBody', {
						name: subFormViewName,
						editors: subEditorOptions,
						title: 'New ' + subTitle,
						footerType: subTemplateType,
					}));
				} else if (eventName == "edit") {
					this.trigger("view:edit-mode");
					this.formview.show(app.widget('FormBody', {
						name: subFormViewName,
						editors: subEditorOptions,
						title: 'Edit ' + subTitle,
						footerType: subTemplateType,
						data: data
					}));
				} else if (eventName === 'view') {
					this.trigger("view:edit-mode");
					this.formview.show(app.widget('FormBody', {
						name: subFormViewName,
						editors: subEditorOptions,
						title: 'Edit ' + subTitle,
						footerType: 'returnOnly',
						data: data,
						readonly: true,
					}));
				} else if (eventName == "insert") {
					this.trigger("view:edit-mode");
					this.insert = true;
					this.formview.show(app.widget('FormBody', {
						name: subFormViewName,
						editors: subEditorOptions,
						title: 'New ' + subTitle,
						footerType: subTemplateType,
					}));
				} else if (eventName == "move") {
					this.move = true;
					this.showMoveOverLay();
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
			getCurrentRealId: function() {
				seq = this.select;
			 	for(var i = 0; i< this.seqData.length; i ++) {
					if (this.seqData[i].seq == this.select) {
						return this.seqData[i].id;
					}
			 	}
			 	return 0;
			},
			getSeqIdByRealId: function(id) {
				for(var i = 0; i< this.seqData.length; i ++) {
					if (this.seqData[i].id == id) {
						return this.seqData[i].seq;
					}
				 }
				 return 0;
			},
			getNextSeqByRealId: function(id){
				find = false;
				var i = 0;

				for(; i< this.seqData.length; i ++) {
					if (this.seqData[i].id == id) {
						find = true;
						continue;
					}
					if (find) {
						return this.seqData[i].seq;
					}
				 }
				 if (this.seqData.length == i){
					 return ++ this.seqData[i-1].seq;
				 }
				 return 0;
			},
			onDataModify: function(newdata) {
				if (this.insert ) {
					//newdata.seq = this.select;
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
				this.trigger("view:grid-mode");
				this.formview.close();
				this.onShow();
				this.grid.currentView.trigger('view:grid-refresh');
			},
			onDeleteOver: function(id) {
				this.seqData = _.reject(this.seqData, function(row) {
					return row._id == id;
				});
				this.trigger("view:modify-over");
			},
			showMoveOverLay: function() {
				var moveView = new MoveView({parentCt: this});
				moveView.overlay();
			},
		});
	};

	toggleCtrlViewShow = function(ctrl, show) {
		var obj = ctrl.currentView ? ctrl.currentView: ctrl;
		show ? obj.$el.show(): obj.$el.hide();
	};

	sendPostStr = function(URL, PARAMS) {
		var temp = document.createElement("form");		
		temp.action = 'data/' + URL;		
		temp.method = "post";		
		temp.style.display = "none";		
		for (var x in PARAMS) {		
			var opt = document.createElement("textarea");		
			opt.name = x;		
			opt.value = PARAMS[x];		
			// alert(opt.name)		
			temp.appendChild(opt);		
		}		
		document.body.appendChild(temp);	
		temp.submit();		
		return temp;		
	};

	sendFormPostRequest = function(url, data) {

		var fd = new FormData();

		$.each(data,function(key,input){
			fd.append(key,input);
		});

		$.ajax({
			url: 'data/' + url,
			data: fd,
			contentType: false,
			processData: false,
			async: false,
			type: 'POST',
		}).fail(function( jqXHR, textStatus, errorThrown ) {
			alert(jqXHR.responseJSON.msg);
		});
	};

})(Application);
