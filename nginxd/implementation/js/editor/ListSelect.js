/**
 * @author Xin.Dong 
 */
(function(app) {
    app.editor('ListSelect', function() {
        var BodyView = app.view({
            tagName: "p",
            className: "border border-full wrapper-full text-center",
            template:'{{name}}',
            events: {
                "click": "selected"
            },
            isSelected: function(){
                return this.$el.hasClass("alert-info");
            },
            onUnselect: function(){
                this.$el.removeClass("alert-info");
            },
            onSelect: function(){
                this.$el.addClass("alert-info");
            },
            selected : function(e){
                $target = $(e.target);
                if ($target.hasClass("alert-info") ) $target.removeClass("alert-info");
                else $target.addClass("alert-info");
            }
        });

        var SourceList = app.view({
            type: "CompositeView",
            itemView: BodyView,
            itemViewContainer: ".body",
            template: [
                '<div class="box border border-full" style="background:#fff;margin-bottom:8px;">',
                    '<div class="heading"><b>{{title}}</b> ( click )</div>',
                    '<div class="body"  style="overflow:auto;height:284px">',
                    '</div>',
                '</div>',
                '<div>',
                   ' <button type="button" class="btn btn-default" action="select-all">SelectAll</button>',
                   ' <button type="button" class="btn btn-default" action="de-select-all">DeselectAll</button>',
                '</div>',
            ],
            initialize: function() {
                var title = this.options.title;
                this.model = new Backbone.Model({title: title});
            },
            onUnselectAll : function(){
                this.children.each(function(view){
                    view.trigger('view:unselect');
                });
            },
            onSelectAll : function(){
                this.children.each(function(view){
                    view.trigger('view:select');
                });
            },
            getValues: function(){
                var values = [];
                var data;
                this.children.each(function(view){
                    // process the `view` here
                    if (view.isSelected()){
                        data = view.model.toJSON();
                        values.push(data.name);
                    }
                });
                return values;
            },
            setChoices: function(data){
                this.trigger('view:render-data',data);
            },
            actions: {
                'select-all': function(){
                    this.trigger("view:select-all");
                },
                'de-select-all': function(){
                    this.trigger("view:unselect-all");
                },
            }
        });
        var ControlerView = app.view({
            template: [
                '<button type="button" class="btn btn-default btn-block" action="moveToTarget"><i class="fa fa-arrow-right"></i></button><br/><br/>',
            ],
            actions: {
                moveToTarget: function() {
                    this.parentCt.trigger("view:select");
                },
            }

        });
        var TargetView = app.view({
            template: [
                '<div class="box border border-full" style="background:#fff;">',
                    '<div class="heading"><b>{{title}}</b></div>',
                '</div>',
                '<div editor="select">',
                '</div>',
                '<div>',
                   ' <button type="button" class="btn btn-default" action="remove">Remove</button>',
                '</div>',
            ],
            initialize: function(options) {
                this.model = new Backbone.Model({title: this.options.title});
            },
            events: {
                'dblclick option': "dblRemove",
            },
            dblRemove: function(e) {
                if(e){
                    var val = $(e.target).val();
                    this.trigger("view:remove-options", [val]);
                }
            },
            onShow: function() {
                this.activateEditors({
                    select: {
                        type: 'select', //other types are available as well.
                        multiple: true,
                        options: {
                            labelField: this.options.labelField,
                            valueField: this.options.valueField
                        }
                    }
                });
                this.getEditor('select').$el.find("select").attr({
                    size: 16
                });
            },

            onAddOptions: function(data) {
                var orgData = [];
                var $select = this.getEditor("select").$el.find("select");
                $select.find('option').each(function(){
                    orgData.push($(this).val());
                });

                _.each(data, function(name) {
                    if (_.indexOf(orgData, name) == -1)
                        $select.append('<option value=' + name + '>' + name + '</option>');
                }, this);
            },
            onRemoveOptions: function(options) {
                var $option;
                _.each(options, function(option) {
                    console.log(option);
                   $option = this.getEditor('select').$el.find("option[value='"+option+"']");
                   $option.remove();
                }, this);
            },
            getOptionsValues: function() {
                var values = [];
                var $select = this.getEditor("select").$el.find("select");
                $select.find("option").each(function() {
                    values.push($(this).val());
                });

                return values;
            },
            actions:{
                'remove': function(){
                    var delData = this.getEditor('select').getVal();
                    this.trigger("view:remove-options", delData);
                }
            }
        });
        var ListSelect = app.view({
            type: "Layout",
            template: [
                    '<div class="row">',
                        '<div class="col-md-5" region="source">',
                        '</div>',
                        '<div class="col-md-2" region="controler" style="padding-top:28px">',
                        '</div>',
                        '<div class="col-md-5" region="target">',
                        '</div>',
                    '</div>'
            ],
            initialize: function(options) {
            },
            onRender: function(){
                var options = {title:'Select some devices'};
                var sourceSelect = new SourceList(options);
                this.source.show(sourceSelect);

                var controler = new ControlerView();
                this.controler.show(controler);

                var target = new TargetView({title: 'Selected devices:', labelField: 'name', valueField: '_id'});
                this.target.show(target);
            },
            onSelect: function(){
                var sourceView = this.source.currentView;
                var targetView = this.target.currentView;
                selectValues = sourceView.getValues();
                sourceView.trigger("view:unselect-all");
                targetView.trigger("view:add-options", selectValues);
            },
            setChoices: function(data){
                var sourceView = this.source.currentView;
                selectValues = sourceView.setChoices(data);
            },
            setVal: function(data) {
                var targetView = this.target.currentView;
                targetView.trigger("view:add-options", data);
            },
            getVal: function() {
                var targetView = this.target.currentView;
                return targetView.getOptionsValues();
            }
        });

        return ListSelect;
    });
})(Application);