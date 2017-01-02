(function(app) {
    app.widget('ScanPolicyCell', function() {
        return app.view({
            template: [
                '{{#if name}}',

                '{{#is tree "parent"}}',

                '{{#is treeFlag "open"}}',
                '<span class="glyphicon glyphicon-chevron-down" main_id="icon" action="gridAction" event_name="{{main.eventName}}" target_id="{{target_id}}">&nbsp;</span>',
                '{{else}}',
                '<span class="{{main.icon}}" main_id="icon" action="gridAction" event_name="{{main.eventName}}" target_id="{{target_id}}">&nbsp;</span>',
                '{{/is}}',
                '<span>{{name}}</span>',

                '{{else}}',

                '{{#is ret "crawling"}}',
                '<pre>',
                'Fortiweb WVS is crawling urls...<br><br>',
                'Crawled Url With Input : {{crawling_input}}<br>',
                'Crawled Application Pages : {{crawling_app}}<br>',
                'Crawled External Links : {{crawling_ext}}',
                '</pre>',
                '{{/is}}',

                '{{#is ret "discovering"}}',
                '<pre>',
                'Fortiweb WVS is discovering vulnerability...<br><br>',
                'Discovered Information : {{discinfo}}<br>',
                'Discovered Low Severity Vulnerability : {{disclow}}<br>',
                'Discovered Medium Severity Vulnerability: {{discmedium}}<br>',
                'Discovered High Severity Vulnerability : {{dischigh}}',
                '</pre>',
                '{{/is}}',

                '{{#is ret "finished"}}',
                '<pre>',
                'Scan has finished.<br><br>',
                'Discovered Information : {{discinfo}}<br>',
                'Discovered Low Severity Vulnerability : {{disclow}}<br>',
                'Discovered Medium Severity Vulnerability: {{discmedium}}<br>',
                'Discovered High Severity Vulnerability : {{dischigh}}',
                '</pre>',
                '{{/is}}',

                '{{#is ret "not_running_runonce"}}',
                '<pre>',
                'Fortiweb WVS is ready to run...<br><br>',
                '</pre>',
                '{{/is}}',

                '{{#is ret "not_running_schedule"}}',
                '<pre>',
                'Fortiweb WVS is waitting to run...<br><br>',
                '</pre>',
                '{{/is}}',

                '{{#is ret "initializing"}}',
                '<pre>',
                'Fortiweb WVS is initializing...<br><br>',
                '</pre>',
                '{{/is}}',

                '{{#is ret "unknown_stage"}}',
                '<pre>',
                'Unknown Stage<br><br>',
                '</pre>',
                '{{/is}}',

                '{{/is}}',

                '{{/if}}'
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;
            },
            onShow: function() {
                var cookieName = "WVSCookie";
                var val = "";
                var that = this;
                var flag;

                if(val = getCookie(cookieName))
                {
                    _.each(JSON.parse(val), function(el){
                        if(el.name == that.rowModel.get(that.idField)){
                            flag = el.flag;
                        }
                    });
                }
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    target_id: this.rowModel.get(this.idField),
                    name: this.rowModel.get(this.columnModel.get('name')),
                    tree: this.rowModel.get('tree'),
                    discinfo: this.rowModel.get('discinfo'),
                    disclow: this.rowModel.get('disclow'),
                    discmedium: this.rowModel.get('discmedium'),
                    dischigh: this.rowModel.get('dischigh'),
                    treeFlag: flag,
                    ret: this.rowModel.get('ret'),
                    crawling_input: this.rowModel.get('crawling_input'),
                    crawling_app: this.rowModel.get('crawling_app'),
                    crawling_ext: this.rowModel.get('crawling_ext'),
                    crawling_ext: this.rowModel.get('crawling_ext'),

                }));
                this.hideAllSubNode();
            },
            hideAllSubNode: function() {
                var that = this;
                var model = that.rowModel;
                var val = "";
                var flag;
                var cookieName = "WVSCookie";
                var isHave = 0;

                if(val = getCookie(cookieName))
                {
                    _.each(JSON.parse(val), function(el){
                        if(el.name == that.rowModel.get(that.idField)){
                            flag = el.flag;
                            isHave = 1;
                        }
                    })
                }
                else{
                    flag = "close";
                }

                if (model.get('tree') == "parent" && flag == "close") {
                    $('tr[target_id="' + model.get('_id') + '"]').next().hide();
                }
                else if(model.get('tree') == "parent" && flag == "open"){
                    $('tr[target_id="' + model.get('_id') + '"]').next().show();
                }
                else if(model.get('tree') == "parent" && isHave == 0)
                {
                    $('tr[target_id="' + model.get('_id') + '"]').next().hide();
                }
            }
        });
    });

    app.widget('RunStartCell', function() {
        return app.view({
            template: [
                '{{#is tree "parent"}}',
                '{{#is nret "0"}}',
                '<span><img width="15" height="15" src="../themes/project/img/icon/st_ok.gif"></span>',
                '{{else}}',
                '<span><img width="15" height="15" src="../themes/project/img/icon/loading.gif"><img width="15" height="15" src="../themes/project/img/icon/db_shutdown.gif" action="gridAction" event_name="{{show.shutdownEventName}}" target_id="{{target_id}}"></span>',
                '{{/is}}',

                '{{#is ret "finished"}}',
                '<span><img width="15" height="15" src="../themes/project/img/icon/db_show.gif" action="gridAction" event_name="{{show.eventName}}" target_id="{{target_id}}"></span>',
                //'{{/is}}',
                //'{{#is ret "not_running_runonce"}}',
                //'<span></span>',
                '{{else}}',
                '<span></span>',
                '{{/is}}',

                '{{/is}}'
            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    target_id: this.rowModel.get(this.idField),
                    tree: this.rowModel.get('tree'),
                    nret: this.rowModel.get('nret'),
                    ret: this.rowModel.get('ret'),
                    treeFlag: this.rowModel.get('treeFlag')
                }))
            }
        });
    });

    app.widget('ScanActionCell', function() {
        return app.view({
            template: [
                '{{#is tree "parent"}}',
                '{{#each actions}}',
                '<span class="btn btn-primary" action="gridAction" event_name="{{eventName}}" target_id="{{../target_id}}">{{label}}</span> ',
                '{{/each}}',
                '{{/is}}'

            ],
            initialize: function(options) {
                this.columnModel = options.columnModel;
                this.rowModel = options.rowModel;
                this.idField = options.idField;
            },
            onShow: function() {
                this.trigger('view:render-data', _.extend(this.columnModel.toJSON(), {
                    target_id: this.rowModel.get(this.idField),
                    tree: this.rowModel.get('tree')
                }))
            }
        });
    });
})(Application);