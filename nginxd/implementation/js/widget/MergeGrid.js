;
(function(app) {
    app.widget('MergeGrid', function() {
        var View;
        var MGrid = {};
        MGrid.Header = app.view({
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
                    cellName = _.str.camelize(cellName);

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
        MGrid.Tr = app.view({
            //tagName: 'tr',
            initialize: function(options) {
                this.columns = options.columns;
                this.data = options.data;
            },
            onShow:function(options) {
                self = this;
                targetId = "bottom";
                length = this.data.length ;
                tdHeadBegin = "<td rowspan ="+ length +" vlign = 'middle'>";
                strTr = "<tr>";
                strTrEnd = "</tr>";
                tdBegin = "<td>";
                tdEnd = "</td>";

                for (i = 0; i< length; i ++) {
                    rowstr =  strTr;
                    if (i === 0) {
                        _.each(this.columns, function(e) {
                            if (e.merge !== undefined) {
                                rowstr = rowstr + tdHeadBegin;
                            } else {
                                rowstr = rowstr + tdBegin;
                            }
                            if (e.type !== undefined) {
                                rowstr = rowstr + "<input type=" + e.type + " id='" + e.type + self.data[i].index + "' target_id = 'targetId" + 
                                            self.data[i].index +"' action='mgridAction'/>";
                            } else {
                                rowstr = rowstr + _.property(e.name)(self.data[i]);
                            }
                            rowstr = rowstr + tdEnd;
                        });
                    } else {
                        _.each(self.columns, function(e) {
                            if(e.merge === undefined) {
                                rowstr = rowstr + tdBegin  +_.property(e.name)(self.data[i]) + tdEnd;    
                            }
                            
                        });
                        
                    }
                    rowstr = rowstr + strTrEnd;
                    this.parentCt.renderStr = this.parentCt.renderStr + rowstr;
                }
            },
 
        });
        View = app.view({
            type: "Layout",
            className: 'table table-bordered',
            tagName: 'table',
            template: [
                '<table>',
                '<thead region="header"></thead>',
                '<tbody region="body"></tbody>',
                '</table>'
            ],
            initialize: function(options) {
                this.options = options;
                this.arrIndex = Array();
            },
          
            onShow: function() {
                data = Array();
                self = this;
                //status = this.options.data[0].arrIndex;
                for (i = 0; i < this.options.data.length; i++){
                    if (_.contains(this.arrIndex, this.options.data[i].index)) {
                        tempData = data[this.options.data[i].index]; 
                    } else {
                        this.arrIndex[this.options.data[i].index] = this.options.data[i].index;
                        tempData = Array();
                        data[this.options.data[i].index] = tempData;
                    }
                    d = {};
                    _.each(this.options.columns, function(c) {
                        temp = _.pick(self.options.data[i],c.name);
                        _.extend(d, temp); 
                    });
                    temp = _.pick(self.options.data[i],'index');
                    _.extend(d, temp); 
                    tempData.push(d);
                }
                this["header"].show(new MGrid.Header({columns: this.options.columns}));
                for (j  = 0; j < data.length; j ++) {
                    this["body"].show(new MGrid.Tr({columns:this.options.columns, data: data[j]}));
                }
                this["body"].$el.append(this.renderStr);
                for (i = 0; i < data.length; i ++) {
                    arriData = data[i];
                    if (arriData[0].status == 1) {
                         this["body"].$el.find("#radio" + arriData[0].index).attr('checked',true);
                    }
                   
                }
            },
            itemViewOptions: function(model, index) {
                // do some calculations based on the model
                return {
                    columns: this.options.columns
                }
            },
            actions: {
                mgridAction: function($btn) {
                    var eventName = $btn.attr("event_name");
                    var id = $btn.attr("target_id");
                    var index = 0;
                    for (i = 0; i < this.arrIndex.length; i ++) {
                        srcTargetId = 'targetId' + this.arrIndex[i];
                        if(srcTargetId !== id) {
                            this["body"].$el.find("#radio" + this.arrIndex[i]).attr('checked',false);
                        } else {
                            index = this.arrIndex[i];
                        }
                    }
                    this.options.parentCt.contentTypeAction(index);
                },
            }
        });
        return View;
    });

})(Application);