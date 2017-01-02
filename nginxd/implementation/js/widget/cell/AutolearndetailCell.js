/**
*for auto learn report view overview item cell
**/
;(function(app) { 
    app.widget('AutolearndetailCell', function() {
        return app.view({                 
            template:'<a href="javascript:void(0);" action="gridAction" event_name="detail" target_id={{_id}}><i class="fa fa-pencil-square"></i></a>',     
            initialize:function(options){           
                this.columnModel=options.columnModel; 
                this.rowModel=options.rowModel;
                this.idField=options.idField;        

                this.model=app.model();
                this.model.set("_id",this.rowModel.get(this.idField))
            }
        });
    });
})(Application);