/**
 *gateway module->header view
 *by xindong
 *options:{
 *    context:ctxName,//remote entity name; the grid will get data from server
 *    data:[{_id:"data1",name:"test222",picker:[1],gateway:2,age:"100",gender:'1'}]//static data,set the grid data;
 *    columns:[{//conlumns config
 *            label:"ID",
 *            name:"_id",
 *            //customHeader:""
 *        },{
 *           label:"Name",
 *            name:"name",
 *        }
 *     ]
 * }
 * refresh event:
 * this.trigger("view:grid-refresh",data);//if no data,the grid will fresh data from server.
 */
;
(function(app) {

    app.widget('GridTool', function() {
        return app.view({
            template: [
                '<div>',
                '{{#each actns}}',
                '<span class="btn btn-primary" action="gridAction" event_name="{{eventName}}">{{#if faIcon}}<i class="fa {{faIcon}}"></i> {{/if}}{{label}}</span> ',
                '{{/each}}',
                '</div>'
            ],
            initialize: function(options) {
                this.model = new Backbone.Model();
                this.model.set({
                    actns: options.actions
                });
            },
            actions: {
                gridAction: function($btn) {
                    var eventName = $btn.attr("event_name");
                    this.parentCt.trigger("view:grid-action", eventName);
                }
            }
        });
    });

    app.widget('Grid', function() {
        var View;
        var Grid = {};

        //header view theader
        Grid.Header = app.view({
            // name:"Grid.header",
            type: 'CollectionView',
            tagName: "tr",
            itemView: app.view({
                tagName: "th",
                type: "Layout",
                template: [
                    '<div region="headercell"></div>'
                ],
                onShow: function() {
                    var cellName = 'grid-string';
                    var BaseCellName = "-header-cell";

                    if (this.model.get("customHeader")) {
                        cellName = this.model.get("customHeader");
                    }
                    cellName = "-" + cellName + BaseCellName;
                    cellName = _.string.camelize(cellName);

                    var cellView = app.widget(cellName, {
                        columnModel: this.model
                    });

                    this["headercell"].show(cellView);
                }
            }),
            initialize: function(options) {
                this.columns = options.columns;
            },
            onShow: function() {
                this.trigger('view:render-data', this.columns);
            }
        });

        //grid body

        //grid td
        Grid.BodyTrTd = app.view({
            tagName: "td",
            type: "Layout",
            template: [
                '<div region="cell"></div>'
            ],
            initialize: function(options) {
                this.options = options;
            },
            onShow: function() {
                var cellName = 'grid-string';
                var BaseCellName = "-cell";

                if (this.model.get("customCell")) {
                    cellName = this.model.get("customCell");
                }
                cellName = "-" + cellName + BaseCellName;
                cellName = _.string.camelize(cellName);

                var cellView = app.widget(cellName, {
                    columnModel: this.model,
                    rowModel: this.options.rowModel,
                    idField: this.options.idField
                });

                this["cell"].show(cellView);
            },
            onGridRefresh: function() {
                this.options.grid.trigger('view:grid-refresh');
            }
        });

        //grid tr view
        Grid.BodyTr = app.view({
            type: 'CollectionView',
            tagName: "tr",
            itemView: Grid.BodyTrTd,
            triggers: { //forward DOM events to row
                'click': {
                    event: 'clicked',
                    preventDefault: false //for cell elements to work properly (checkbox/radio/<anchor/>)
                },
                'dblclick': {
                    event: 'dblclicked',
                    preventDefault: false
                }
            },
            initialize: function(options) {
                this.options = options;
            },
            onTrChange: function(data) {
                this.model.set(data);
                this._freshTr();
            },
            _freshTr: function() {
                var data = [];
                _.each(this.options.columns, function(c) {
                    var d = {};
                    _.extend(d, c, {
                        value: this.model.get(c.name)
                    });
                    data.push(d);
                }, this);
                this.trigger('view:render-data', data);
            },
            onShow: function() {
                if (!_.isUndefined(this.model.id)) {
                    this.$el.attr({
                        "target_id": this.model.id,
                        "event_name": "trClick"
                    });
                    this.el.setAttribute("action", "gridAction");
                }

                this._freshTr();
            },
            itemViewOptions: function(model, index) {
                // do some calculations based on the model
                return {
                    rowModel: this.model,
                    idField: this.options.idField,
                    grid: this.options.grid,
                }
            },
        });

        //grid body tbody
        Grid.Body = app.view({
            type: 'CollectionView',
            itemView: Grid.BodyTr,
            itemViewEventPrefix: 'row',
            initialize: function(options) {
                this.options = options;
                var idField = this.options.idField;
                var Model = Backbone.Model.extend({ //the id attribute to use
                    idAttribute: idField,
                });

                var Collection = Backbone.Collection.extend({
                    model: Model
                });

                this.collection = new Collection();
            },
            itemEvents: { //forward row events to grid
                'clicked': function(e, row){
                    row.options.grid.parentCt.parentCt.trigger('view:click-row', row);
                },
            },
            onRender: function() {
                if (this.parentCt) this.parentCt.trigger("view:grid-render");
                if (this.parentCt) this.parentCt.trigger("view:renew-tr");
            },
            onShow: function() {
                this.trigger("view:grid-refresh", this.options.data)
            },
            itemViewOptions: function(model, index) {
                // do some calculations based on the model
                return {
                    columns: this.options.columns,
                    idField: this.options.idField,
                    grid: this,
                }
            },
            onGridRefresh: function(data) {
                data = data || null;
                var that = this;
                if (data) {
                    that.trigger('view:render-data', data);
                } else if (this.options.query) {
                    this.trigger("view:grid-query", this.options.query);
                } else if (this.options.page && this.options.pageSize) {
                    this.trigger("view:load-page", {
                        entity: this.options.context,
                        page: this.options.page,
                        pageSize: this.options.pageSize,
                        params: this.options.params,
                    })
                } else {
                    app.remote({
                        entity: this.options.context
                    }).done(function(d) {
                        if (_.isArray(d) && d[0] && !d[0]._id)
                            d = [];
                        that.trigger('view:render-data', d.payload ? d.payload : d);
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        app.failCommon(jqXHR, textStatus, errorThrown);
                    });
                }
            },
            onDataDelete: function(id, options) {
                var that = this;
                app.remote({
                    entity: this.options.context,
                    payload: {
                        _id: id
                    }
                }).done(function(data) {
                    if (!options || options && options.refresh || options && _.isUndefined(options.refresh))
                        that.trigger("view:grid-refresh");
                    that.parentCt.trigger("view:delete-over", id);
                    app.trigger("app:notify", {
                        type: "success",
                        msg: "Delete:Success"
                    });
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    app.failCommon(jqXHR, textStatus, errorThrown);
                });
            },
            onGridQuery: function(queryObj) {
                var that = this;
                app.remote({
                    entity: this.options.context,
                    params: queryObj
                }).done(function(data) {
                    that.trigger('view:render-data', data);
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    app.failCommon(jqXHR, textStatus, errorThrown);
                });
            },
            /**
            *options{
                refresh:false,don't refresh after modify 
            }
            */
            onDataModify: function(newdata, options) {
                var that = this;
                app.remote({
                    entity: this.options.context,
                    payload: newdata //without _id
                }).done(function(data) {
                    if (!options || options && options.refresh || options && _.isUndefined(options.refresh)) {
                        that.trigger("view:grid-refresh");
                    }
                    if (!_.has(newdata, that.options.idField)) {
                        newdata = _.extend(newdata, data);
                    }
                    that.parentCt.trigger("view:modify-over", newdata);
                    app.trigger("app:notify", {
                        type: "success",
                        msg: data.successMessage ? data.successMessage : "Save:Success!"
                    });
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    app.failCommon(jqXHR, textStatus, errorThrown);
                });
            },
            onTrChange: function(data) {
                if (data[this.options.idField]) {
                    var model = this._getData(data[this.options.idField]);
                }
                if (model) var itemView = this._getTrViewByModel(model);
                if (itemView) itemView.trigger("view:tr-change", data);
            },
            _getTrViewByModel: function(model) {
                var v = this.children.findByModel(model);
                return v;
            },
            _getData: function(id) {
                return this.collection.get(id);
            },
            getDataAndView: function(id) {
                var obj = {};
                obj.model = this._getData(id);
                obj.view = this._getTrViewByModel(obj.model);
                return obj;
            },
            onPageChanged: function(options) {
                if (this.parentCt) this.parentCt.trigger("view:page-changed", options);
            },
        });

        View = app.view({
            type: "Layout",
            className: 'central-grid',
            template: [
                '<table class="table table-bordered">',
                '<thead region="header"></thead>',
                '<tbody region="body"></tbody>',
                '</table>'
            ],
            initialize: function(options) {
                this.options = options;
                if (!options.idField) _.extend(this.options, {
                    idField: ("_id")
                });
            },
            onGridRender: function() {
                this.parentCt.trigger("view:grid-render");
            },
            onDataModify: function(newdata, options) {
                this["body"].currentView.trigger("view:data-modify", newdata, options);
            },
            onDataDelete: function(id, options) {
                this["body"].currentView.trigger("view:data-delete", id, options);
            },
            onModifyOver: function(data) {
                this.parentCt.trigger("view:modify-over", data);
            },
            onDeleteOver: function(id) {
                this.parentCt.trigger("view:delete-over", id);
            },
            onGridQuery: function(queryObj) {
                this["body"].currentView.trigger("view:grid-query", queryObj);
            },
            onTrChange: function(data) {
                this["body"].currentView.trigger("view:tr-change", data);
            },
            onGridRefresh: function(data) {
                data = data || null;
                this["body"].currentView.trigger("view:grid-refresh", data);
            },
            onLoadPage: function(data) {
                this.body.currentView.trigger("view:load-page", _.extend(data, {
                    url: this.options.context,
                    pageSize: 30,
                }));
            },
            onRenewTr: function() {
                this.parentCt.trigger('view:renew-tr');
            },
            onRunNow: function(options) {

                var popTdHtml =
                    '<td colspan=' + this.options.columns.length + ' class="text-center">' +
                    'The report has been queued. Look for progress under ' +
                    options.reportName +
                    ' on the ' +
                    '<a action="jumpReportBrowse" href="javascript:void(0);">Report Browse</a>' +
                    ' page.' +
                    '</td>';

                var popTrHtml = '<tr id="pop">' + popTdHtml + '</tr>';

                var $firstTr = this.$el.find('tbody tr:first');

                if ('pop' === $firstTr.attr('id')) {
                    this.$el.find('#pop').html(popTdHtml);
                } else {
                    $firstTr.before(popTrHtml);
                }
            },
            onShow: function() {
                if (!(this.options.showHeader !== undefined &&this.options.showHeader == false)) {
                    this["header"].show(new Grid.Header({
                        columns: this.options.columns
                    }));
                }
                this["body"].show(new Grid.Body(
                    _.extend(this.options, {
                        el: this.body.$el
                    })
                ));

                if (this.options.popString) {
                    this.appendPop();
                }
            },
            appendPop: function() {
                var popHtml =
                    '<tr id="pop"><td colspan=' + this.options.columns.length + ' class="text-center">' +
                    this.options.popString +
                    '<img src="themes/project/img/icon/x_small.gif" style="right: 8px; position: fixed; cursor: pointer;" action="close">' +
                    '</td></tr>'

                this.$el.find('tbody').prepend(popHtml);
                this.$el.find('#pop').css('background-color', '#FFD710');
            },
            actions: {
                gridAction: function($btn) {
                    var eventName = $btn.attr("event_name");
                    var id = $btn.attr("target_id");
                    if (id) {
                        var obj = this["body"].currentView.getDataAndView(id);
                        this.parentCt.trigger("view:grid-action", eventName, obj.model.toJSON(), this.body.currentView, obj.view, $btn);
                    } else {
                        this.parentCt.trigger("view:grid-action", eventName);
                    }
                },
                close: function() {
                    this.$el.find('#pop').remove();
                },
                jumpReportBrowse: function($triggerTag, e) {
                    this.parentCt.parentRegion.trigger('region:load-view', 'ReportBrowse');
                },
                jumpInlineProfile: function($triggerTag, e) {
                    this.parentCt.parentCt.parentRegion.trigger('region:load-view', 'InlineProtectionProfile');
                },
            }
        });
        return View;
    });

})(Application);