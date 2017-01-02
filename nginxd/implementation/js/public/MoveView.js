 ;
(function(app) {
    MoveView = app.view({
        name: 'MoveView',
        overlay: true,
        className: 'widget',
        template: [
            '<div class="form-group" >',
            //'<div class="col-md-3">',
            '<label id="label" class="control-label" >Move Table Entry',
            '</label>',
            '<div class="panel-body"> <br>', 
            '<div class="seperate-trad"></div>',
            '<div class="seperate-line"></div><br>',
            '{{#if show}}',
            '<div id="id" class="col-xs-8" ><label class="control-label col-xs-3" >Entry ID: </label><label id="selectId" class="control-label" >{{select}}</label></div>',
            '<div id="moveTo" class="col-xs-8" ><label id="label" class="control-label col-xs-3" >Move To:</label> <input id = "before" ui="input" type="radio" value="1" checked action="before">Before</input></label> <input id = "after" action="after" ui="input" type="radio" value="2">After</input>',
            '<input id = "pos" ui="input" type="text" >(Entry ID)</input></div>',
            
            '<div  class="col-xs-12" ><br>',
            '<div class="seperate-trad"></div>',
            '<div class="seperate-line"></div><br>',
            '<button type="button" class="btn btn-primary" action="ok">OK</button>',
            '<button type="button" class="btn btn-default" action="cancel">Cancel</button>',
            '{{else}}',
            '<div>{{value}}</div>',
            '<button type="button" class="btn btn-primary" action="return">OK</button>',
            '{{/if}}',
            '</div>',
            '</div>', // body
            '</div>',
        ],
    
        initialize: function(options) {
            this.parentCt = options.parentCt;
            this.model = new Backbone.Model();
            this.realId = this.parentCt.getCurrentRealId();
            this.model.set({show:true, select: this.realId});
        },
        
        onShow: function() {
        },
        validate: function(){
            this.before = this.$el.find("#before").prop("checked"); 
            pos = parseInt(this.$el.find("#pos").val());
            min = 0;
            max = 0;
            self = this;
            find = false; 
            if (_.isNaN(pos) || pos == 0) {
                return "Input value is invalid."
            }
            _.each(this.parentCt.seqData, function(ele){
                
                if (ele.id > max) max = ele.id;
                if (ele.id < min) min = ele.id;
                if (ele.id == pos) find = true;
            });
            if (!find) {
                return "Entry not found."
            }
            this.pos = pos;
            return "";
        },
        onDataModify: function() {
            error = this.validate();
            if (error !== "") {
                this.model.set({show:false, value: error});
                this.render();
            } else {
                this.parentCt.trigger("view:data-modify", {before: this.before, pos: this.pos})    ;
                this.close();
            }
        },
        onModifyOver: function() {
            this.close();
        },
        actions: {
            'ok': function() {
                this.trigger('view:data-modify');
            },
            'cancel': function() {
                this.trigger('view:modify-over');
            },
            'before':function() {
                this.$el.find("#after").prop("checked",false);
            },
            'after':function() {
                this.$el.find("#before").prop("checked",false);
            },
            'return':function() {
                this.model.set({show:true, select: this.realId});
                this.render();
            },
        },
    }, true);
})(Application);