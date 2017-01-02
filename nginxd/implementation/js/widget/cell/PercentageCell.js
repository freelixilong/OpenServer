/**
*for auto learn report view overview item cell
**/
;(function(app) { 
    app.widget('PercentageCell', function() {
        return app.view({                 
            template:"{{value}}%",     
            initialize:function(options){           
                this.columnModel=options.columnModel; 
                this.rowModel=options.rowModel;
                this.idField=options.idField;        

                this.model=this.columnModel.clone();
            }
        });
    });
})(Application);