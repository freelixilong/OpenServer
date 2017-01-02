(function(app) {
    app.editor('ImportTree', function() {
        
        var node = app.view({
            type: 'ItemView',
            tagName: 'li',
            //itemViewContainer: 'ul',
            template: '<input type= "checkbox" id = {{policyName}}>{{policyName}}</>',
            // className: function() {
            //     if (_.size(this.model.get('children')) >= 1) {
            //         return 'menu-item dropdown dropdown-submenu';
            //     }
            //     return 'menu-item';
            // },
            initialize: function(options) {
                // if (this.className() === 'menu-item dropdown dropdown-submenu')
                //     this.collection = app.collection(this.model.get('children'));
            },
            onRender: function(){
                this.trigger('view:render-data', this.model);
            },
        });

        var treeView = app.view({
            type: 'CompositeView',
            itemView: node,
            itemViewContainer: 'ul',
            template: [
                '<div class="form-group" >',
                //'<div class="col-md-3">',
                '<label id="label" class="control-label col-md-3" >',
                '</label>',
                '<div class="panel-body col-md-3"  style="height:100px;overflow-y:auto; border:1px solid"> ', 
                '<ul ></ul>',
                '</div>',  
                '</div>',
            ],

            initialize: function(options) {
                this.options = options;
            },
            onRender: function() {
                this.$el.find("#label").text(this.options.label);
                data = [];
                data.push(this.options.val);
            },
            getVal: function() {
                var data = [];
                _.each(this.$el.find('input'), function(e){
                    data.push({policyName: e.id, value: e.checked})
                });
                return data;
            },
            setVal: function(data) {
                //data = [{policyName: , value: false}, {policyName:"", value: true}];
                this.trigger('view:render-data', data);
               
            },
            disable: function(data) {
                if (data) {
                    this.$el.find('input').prop('disabled', false);
                } else {
                    this.$el.find('input').prop('disabled', true);
                }
            },
            validate: function() {},
            status: function() {},
        });
        return treeView;
    });

})(Application);
