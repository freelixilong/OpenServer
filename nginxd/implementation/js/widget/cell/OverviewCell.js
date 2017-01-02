/**
*for auto learn report view overview item cell
**/
;(function(app) { 
    app.widget('OverviewCell', function() {
        return app.view({                 
            template:[          
                '{{#if link}}',
                    '<a href="javascript:void(0)" action="gridAction" event_name="{{link}}">{{item}}</a>',
                '{{else}}',
                    '{{item}}',
                '{{/if}}'
            ],     
            initialize:function(options){           
                this.columnModel=options.columnModel; 
                this.rowModel=options.rowModel;
                this.idField=options.idField;        

                this.model=app.model();
                var link=this.rowModel.get("link");
                if(link&&link.length>0) this.model.set("link",link);
                this.model.set("item",this.rowModel.get("item"));
            }
        });
    });
})(Application);