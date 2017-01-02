;
(function(app) {

    var NotifyView = app.view({
        template: [
            '<div class="notify-unit {{className}}">',
            '<span class="close" type="button" action="close">×</span>',
            '<div style="padding:20px 20px">{{msg}}</div>',
            '<div> ',
            '{{#each btn}}',
            '<span class="btn {{this.btnType}}" event_name="view:btn-{{@index}}" action="btnAction">{{this.label}}</span> ',
            '{{/each}}',
            '</div>',
            '</div>',
        ],
        initialize: function(options) {
            this.closeFunc = options.closeFunc || null;
            this.autoClose = options.autoClose || false;
            this.type = options.model.get('type');

            _.each(this.model.get("btn"), function(b, index) {
                if (index == 0) b.btnType = "btn-primary";
                else b.btnType = "btn-info";

                this["onBtn" + index] = function() {
                    b.closeOnClick = _.isUndefined(b.closeOnClick) ? true : b.closeOnClick;
                    if (b.closeOnClick) this.trigger('view:close-option');
                    if (b.action && _.isFunction(b.action)) {
                        b.action();
                    }
                }
            }, this);
        },
        onCloseOption: function() {
            if (this.closeFunc) {
                this.close();
                this.closeFunc();
            } else {
                var that = this;
                this.$el.slideUp(function() {
                    that.close();
                });
            }
        },
        onClose: function() {
            if (this.timeHandle) clearTimeout(this.timeHandle);
        },
        actions: {
            'close': function() {
                this.trigger('view:close-option');
            },
            btnAction: function($btn) {
                var event_name = $btn.attr("event_name");
                this.trigger(event_name);
            }
        },
        onRender: function() {
            if (this.autoClose) {
                var that = this;
                if ('error' !== this.type) {
                    this.timeHandle = setTimeout(function() {
                        that.trigger('view:close-option');
                    }, 6000);
                }
            }
        }
    });

    var NotifyGroupView = app.view({
        type: 'CollectionView',
        itemView: NotifyView,
        className: "applicaton-notify",
        attributes: {
            style: "position:fixed;width:300px"
        },
        itemViewOptions: {
            autoClose: true
        },
        collectionEvents: {
            "add": "modelAdded"
        },
        modelAdded: function() {
            if (this.collection.length > this.MAX) {
                this.collection.remove(this.collection.at(0));
            }
        },
        initialize: function() {
            this.collection = new Backbone.Collection();
        },
        renderFlag: false,
        MAX: 5,
        isRender: function() {
            return this.renderFlag;
        },
        onRender: function() {
            this.$el.appendTo($("body"));
            this.$el.position({
                my: "right top",
                at: "right top",
                of: ".body",
                using: function(offset, obj) {
                    obj.element.element.css({
                        top: obj.target.top,
                        right: 50
                    });
                }
            });
            this.renderFlag = true;
        },
        appendHtml: function(collectionView, itemView, index) {
            // If we've already rendered the main collection, just
            // append the new items directly into the element.
            collectionView.$el.prepend(itemView.$el);
            itemView.$el.hide();
            itemView.$el.slideDown();
        }
    });

    var notifyGroup = new NotifyGroupView();

    app.onNotifyConfirm = function(options) {
        var model = new Backbone.Model({
            className: "well",
            msg: options.msg,
            btn: options.btn
        });

        var notify = new NotifyView({
            model: model,
            closeFunc: function() {
                $("body").overlay(false);
            }
        });

        notify.$el.css({
            //todo: add custom css
        });

        $("body").overlay({
            content: notify.render().el,
        });
    }

    app.onNotify = function(options) {
        if (!notifyGroup.isRender()) notifyGroup.render();
        if (options.type == "success") {
            options.className = "alert alert-dismissable alert-success";
        } else if (options.type == "error") {
            try {
                var msgStr = $.parseJSON(options.ResObj.responseText).msg;
            } catch (e) {
                var msgStr = null;
            }

            if (msgStr) {
                options.className = "alert alert-dismissable alert-warning";
                options.msg = msgStr;
            } else {
                options.className = "alert alert-dismissable  alert-danger";
            }
        } else if (options.type == "confirm") {
            app.trigger("app:notify-confirm", options);
            return true;
        }

        notifyGroup.collection.add([{
            msg: options.msg,
            className: options.className,
            btn: options.btn,
            type: options.type || null
        }]);
    }
})(Application);