/**
*for auto learn report view overview item cell
**/
;(function(app) { 
    app.widget('AutolearnselectCell', function() {
        return app.view({                      
            template:[
                '<select name={{name}} target_id="{{_id}}">',
                '{{#each opts}}',
                    '<option value="{{val}}">{{label}}</options>',
                '{{/each}}',
                '</select>'
            ],   
            initialize:function(options){           
                this.columnModel=options.columnModel; 
                this.rowModel=options.rowModel;
                this.idField=options.idField;        

                this.model=this.columnModel.clone();
                this.model.set({_id:this.rowModel.get(this.idField)});

            },
            onRender:function(){
                if(_.isUndefined(this.rowModel.get(this.idField))) this.$el.html("");
                else{
                    this.$el.find('option[value='+this.columnModel.get("value")+']').attr("selected",true);

                    if(this.columnModel.get("disableConditions")){
                        _.each(this.columnModel.get("disableConditions"),function(c){                       
                            if(this.rowModel.get(c.key)==c.val){
                                this.$el.find("select").attr("disabled",true);
                            }
                        },this);
                    }
                }              
            }
        });
    });
})(Application);