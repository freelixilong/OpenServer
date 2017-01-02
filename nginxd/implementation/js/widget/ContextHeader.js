;(function(app) { 
    app.widget('ContextHeader', function() {
        return app.view({
        	template:[  
            '<ol class="breadcrumb">',
              '<li><i class="fa fa-bars"></i> {{contextName}}</li>',            
            '</ol>',            
	        ],
	        initialize: function(options){  
	            this.model=new Backbone.Model();
	            this.model.set({contextName:options.contextName||""});
	        }     
        });  
    });
})(Application);

        