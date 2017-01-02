/**
 * widget - collapsible list
 * implemented using widget Grid inside
 * by Nan Mou
 */
(function(app) {
    app.widget('CollapsibleList', function() {
        var View;
        var List = {};

        List.Item = app.view({
            tagName: "li{list-style-type:none}",
            type: "Layout",
            template: [
                '<div region="title"></div>',
                '<div class="detail-region" region="detail">',
                '</div>'
            ],
            initialize: function(options) {
                this.columns = options.columns;
                this.context = options.context;
                this.idField = options.idField;
                this.titleField = options.titleField;
                this.detailField = options.detailField;
                this.id = _.uniqueId('table-view-');
                this.$el.attr("id", this.id);
            },
            onShow: function() {
                var cellName = 'collapsible';
                var BaseCellName = "-cell";

                if (this.model.get("customCell")) {
                    cellName = this.model.get("customCell");
                }
                cellName = "-" + cellName + BaseCellName;
                cellName = _.str.camelize(cellName);
                this.model.set({
                    value: this.model.get(this.titleField)
                });

                // title region, using a cell
                var titleView = app.widget(cellName, {
                    columnModel: this.model,
                    rowModel: this.model,
                    idField: this.titleField
                });
                this["title"].show(titleView);

                // detail part, using widget Grid with option data
                var dataArray = [];
                var dataCollection = new Backbone.Collection(this.model.get(this.detailField));
                _.each(dataCollection.models, function(data) {
                    dataArray.push(data);
                });
                var grid = app.widget('Grid', {
                    context: this.context,
                    columns: this.columns,
                    idField: this.idField,
                    data: dataArray
                });
                this["detail"].show(grid);
                this.title.currentView.onCollapse();
            },
            onCollapse: function(collapsed) {
                if (collapsed) {
                    this.$el.find(".detail-region").hide();
                } else {
                    this.$el.find(".detail-region").show();
                }
            }
        });

        List.Items = app.view({
            type: "CollectionView",
            tagName: "ul",
            itemView: List.Item,
            initialize: function(options) {
                this.columns = options.columns;
                this.context = options.context;
                this.idField = options.idField;
                this.titleField = options.titleField;
                this.detailField = options.detailField;
                this.data = options.data;
            },
            onShow: function() {
                var that = this;
                that.trigger('view:render-data', that.data);
				/*
                app.remote({
                    entity: this.context
                }).done(function(data) {
                    that.trigger('view:render-data', data);
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    app.failCommon(jqXHR, textStatus, errorThrown);
                });
				*/
            },
            itemViewOptions: function(model, index) {
                return {
                    columns: this.columns,
                    context: this.context,
                    idField: this.idField,
                    titleField: this.titleField,
                    detailField: this.detailField
                }
            },
            onDataModify: function(newdata) {
                var that = this;
                app.remote({
                    entity: this.context,
                    payload: newdata //without _id
                }).done(function(data) {
                    that.trigger("view:grid-refresh");
                    that.parentCt.trigger("view:modify-over");
                    app.trigger("app:notify", {
                        type: "success",
                        msg: "Save:Success!"
                    });
                }).fail(function(jqXHR) {
                    app.failCommon(jqXHR, textStatus, errorThrown);
                });
            },
            onGridRefresh: function() {
                var that = this;
                that.collection.set(that.data);
				/*
                app.remote({
                    entity: this.context
                }).done(function(data) {
                    that.collection.set(data);
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    app.failCommon(jqXHR, textStatus, errorThrown);
                });
				*/
            }
        });

        View = app.view({
            type: "Layout",
            template: [
                '<div class="table" region="body">',
                '</div>'
            ],
            initialize: function(options) {
                this.columns = options.columns;
                this.context = options.context;
                this.idField = options.idField;
                this.titleField = options.titleField;
                this.detailField = options.detailField;
                this.data = options.data;
                //this.id = _.uniqueId('table-view-');
                //this.$el.attr("id", this.id);     
            },

            onDataModify: function(newdata) {
                this["body"].currentView.trigger("view:data-modify", newdata);
            },

            onModifyOver: function() {
                this.parentCt.trigger("view:modify-over");
            },

            onGridRefresh: function() {
                this["body"].currentView.trigger("view:grid-refresh");
            },

            onShow: function() {
                this["body"].show(new List.Items({
                    columns: this.columns,
                    context: this.context,
                    idField: this.idField,
                    titleField: this.titleField,
                    detailField: this.detailField,
                    data: this.data
                }));
            }
        });
        return View;
    });
})(Application);
