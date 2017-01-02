/**
 * @author Xin.Dong
 * @create 2014.04.22
 * type: 'picker',
 * sourceLabel:"Source",// the source Label
 * targetLabel:"Selected",// the target Label
 * options: {
 *    data:{
 *         entity://data source entity in the app.remote;
 *         [OR]url://data source url in the app.remote;
 *         [OR]static:[] //data
 *    }
 *    labelField
 *    valueField
 * },
 * validate:function only,
 * layout: {
 *     left: col-xs-xx,
 *     middle: col-xs-xx,
 *     right: col-xs-xx,
 * }
 *
 *
 */
(function(app) {
    app.editor('picker', function() {

        var SeletectView = app.view({
            initialize: function(options) {
                this.options = options;
            },
            events: {
                'dblclick option': "dblclickOption",
            },
            dblclickOption: function(e) {
                var val = $(e.target).val();
                this.trigger("view:move-options", [val]);
            },
            onShow: function() {
                this.activateEditors({
                    select: {
                        type: 'select', //other types are available as well.
                        label: this.options.label,
                        multiple: true,
                        options: {
                            labelField: this.options.labelField,
                            valueField: this.options.valueField
                        }
                    }
                });
                this.getEditor('select').$el.find("select").attr({
                    size: 15
                });
            },
            onMoveSelectOption: function() {
                var $select = this.getEditor("select").$el.find("select");
                var selectedValues = $select.val();
                if (selectedValues) {
                    this.trigger("view:move-options", selectedValues);
                }
            },
            onMoveOptions: function(vals) {
                var options = [];
                _.each(vals, function(v) {
                    var $option = this.$el.find('option[value="' + v + '"]');
                    if (_.size($option)) {
                        var group = $option.parent("optgroup").attr("label");
                        options.push({
                            group: group,
                            optionEl: $option
                        });
                    }
                }, this);

                if (_.size(options)) this.parentCt.trigger("view:move-options", options, this.options.viewType);
            },
            onAddOptions: function(options) {
                var $select = this.getEditor("select").$el.find("select");
                _.each(options, function(option) {
                    var $group = $select.find("optgroup[label='" + option.group + "']");
                    if ($group.length <= 0) {
                        $group = $('<optgroup label="' + option.group + '">');
                        $select.append($group);
                    }
                    $group.append(option.optionEl.attr("selected", false));
                }, this);
            },
            onRemoveOptions: function(options) {
                _.each(options, function(option) {
                    var $group = this.$el.find("optgroup[label=\"" + option.group + "\"]");
                    if ($group.find("option").length <= 0) {
                        $group.remove();
                    }
                }, this);
            },
            onSetData: function(data) {
                this.data = _.clone(data);
                this.getEditor('select').setChoices(data);
                this.getEditor('select').$el.find("select").attr({
                    size: 15
                });
            },
            getOptionsValues: function() {
                var values = [];
                var $select = this.getEditor("select").$el.find("select");
                $select.find("option").each(function() {
                    values.push($(this).attr("value"));
                });

                return values;
            }
        });

        var ControlerView = app.view({
            template: [
                '<button type="button" class="btn btn-default" action="moveToTarget"><i class="fa fa-arrow-right"></i></button><br/><br/>',
                '<button type="button" class="btn btn-default" action="moveToSource"><i class="fa fa-arrow-left"></i></button>'
            ],
            actions: {
                moveToTarget: function() {
                    this.parentCt.trigger("view:move-select-option", "source");
                },
                moveToSource: function() {
                    this.parentCt.trigger("view:move-select-option", "target");
                }
            }

        });
        var Picker = app.view({
            type: "Layout",
            className: "row",
            attributes: {
                style: "text-align:center"
            },
            initialize: function(configs) {
                configs.options = configs.options || {};
                configs.options.data = configs.options.data || {};
                this.configs = configs;
                this.configs.options.valueField = this.configs.options.valueField || "_id";
                this.configs.options.labelField = this.configs.options.labelField || "name";
                if (this.configs.options.clearStatics && this.configs.options.data.statics)
                    this.configs.options.data.statics = null;
            },
            template: [
                '<div class="" region="source">',
                '</div>',
                '<div class="" region="controler" style="padding-top:28px">',
                '</div>',
                '<div class="" region="target">',
                '</div>',
            ],
            onRender: function() {
                var sourceSelect = new SeletectView({
                    viewType: "source",
                    label: this.configs.sourceLabel,
                    valueField: this.configs.options.valueField,
                    labelField: this.configs.options.labelField
                });
                this.source.show(sourceSelect);

                var targetSelect = new SeletectView({
                    viewType: "target",
                    label: this.configs.targetLabel,
                    valueField: this.configs.options.valueField,
                    labelField: this.configs.options.labelField
                });
                this.target.show(targetSelect);

                var controlerView = new ControlerView();
                this.controler.show(controlerView);

                if (this.configs.layout) {
                    this.$el.find('div[region="source"]').addClass(this.configs.layout.left);
                    this.$el.find('div[region="controler"]').addClass(this.configs.layout.middle);
                    this.$el.find('div[region="target"]').addClass(this.configs.layout.right);
                } else {
                    this.$el.find('div[region="source"]').addClass('col-xs-5');
                    this.$el.find('div[region="controler"]').addClass('col-xs-2');
                    this.$el.find('div[region="target"]').addClass('col-xs-5');
                }

                this.bindData();

                if (this.configs.validate && _.isFunction(this.configs.validate)) {
                    this.listenTo(this, 'editor:change editor:keyup', function() {
                        if (this.eagerValidation) {
                            this.validate(true);
                        }

                    });
                    this.validate = function(show) {
                        var error = false;
                        if (this.configs.validate && _.isFunction(this.configs.validate)) {
                            error = this.configs.validate(this.getVal(), this.parentCt);
                            if (show) {
                                this._followup(error);
                            }
                            return error;
                        }
                    },
                    this._followup = function(error) {
                        if (!_.isEmpty(error)) {
                            this.target.currentView.status({
                                'select': error
                            });
                            //become eagerly validated
                            this.eagerValidation = true;
                        } else {
                            this.target.currentView.status();
                            this.eagerValidation = false;
                        }
                    }
                }
            },
            onMoveSelectOption: function(from) {
                if (from == "source")
                    this.source.currentView.trigger("view:move-select-option");
                else
                    this.target.currentView.trigger("view:move-select-option");
            },
            onMoveOptions: function(options, from) {
                if (from == "source") {
                    this.target.currentView.trigger("view:add-options", options);
                    this.source.currentView.trigger("view:remove-options", options);
                } else {
                    this.source.currentView.trigger("view:add-options", options);
                    this.target.currentView.trigger("view:remove-options", options);
                }

                this.trigger("editor:change");

            },
            setChoices: function(data) {
                this.configs.options.data.statics = data;
                this.bindData();
            },
            bindData: function() {
                if (this.configs.options.data.url || this.configs.options.data.entity) {
                    var dataSource;
                    dataSource = (this.configs.options.data.url) ? {
                        url: this.configs.options.data.url
                    } : {
                        entity: this.configs.options.data.entity
                    };
                    var that = this;
                    app.remote(dataSource).done(function(data) {
                        that.bindDataToSourceSelect(data);
                        that.bindDataToTargetSelect();
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        app.failCommon(jqXHR, textStatus, errorThrown);
                    });
                } else if (this.configs.options.data.statics) {
                    this.bindDataToSourceSelect(this.configs.options.data.statics);
                    this.bindDataToTargetSelect();
                } else {
                }
            },
            bindDataToSourceSelect: function(data) {
                if (_.isArray(data)) {
                    data = {
                        "": data
                    };
                }
                this.data = data;
                this.source.currentView.trigger('view:set-data', data);
            },
            bindDataToTargetSelect: function() {
                if (this.data && this.values) {
                    this.source.currentView.trigger("view:move-options", this.values);
                } else {
                }
            },
            setVal: function(data) {
                if (!_.isArray(data)) data = [data];
                this.values = data;
                this.bindDataToTargetSelect();
            },
            getVal: function() {
                return this.target.currentView.getOptionsValues();
            },
        });

        return Picker;
    });
})(Application);