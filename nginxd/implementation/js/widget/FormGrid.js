(function(app) {
	app.widget('FormGrid', function() {

		var RowViewTd = app.view({
			type: 'Layout',
			tagName: 'td',
			initialize: function(options) {
				this.columns = options.columns;
				this.onEditorChange = options.onEditorChange;
				this.onIconClick = options.onIconClick;
				this.rawModel = options.rawModel;
				this.parentCt = options.parentCt;
			},
			showEditor: function(options) {
				if ('ro' === options.type) {
					this.$el.append(this.model.get('value'));
				} else if ('radio' === options.type) {
					if (true === this.model.get('value').value) {
						this.$el.append('<input type="radio" name=' + options.name + ' action="change" checked>');
					} else {
						this.$el.append('<input type="radio" name=' + options.name + ' action="change">');
					}
					if ('disabled' === this.model.get('value').status) {
						this.$el.find('input').attr('disabled', true);
					}
				} else if ('checkbox' === options.type) {
					if (true === this.model.get('value') || true === this.model.get('value').value) {
						this.$el.append('<input type="checkbox" name=' + options.name + ' action="change" checked>');
					} else {
						this.$el.append('<input type="checkbox" name=' + options.name + ' action="change">');
					}
					if ('disabled' === this.model.get('value').status) {
						this.$el.find('input').attr('disabled', true);
					}
				} else if ('text' === options.type) {
					this.$el.append('<input type="text" name= ' + options.name + ' value=' + this.model.get('value') + '>');
				} else if ('select' === options.type) {
					this.$el.append('<select class="form-control" name=' + options.name + '></select>');
					var that = this;
					_.each(options.options, function(elem) {
						that.$el.find('select').append('<option value="' + elem.value + '">' + elem.name + '</option>');
					});
					that.$el.find('select').val(this.model.get('value'));
				} else if ('icon' === options.type) {
					this.$el.append('<i class="' + options.options.icon + '" action="icon" target_id=' + this.rawModel.get('_id') + '></i>');
				} else if ('sslradio' === options.type) {
					var subname = this.model.get('value').name;
					if (true === this.model.get('value').value) {
						this.$el.append('<input type="radio" name=' + subname + ' value=' + options.name + ' action="change" checked>');
					} else {
						this.$el.append('<input type="radio" name=' + subname + ' value=' + options.name + ' action="change">');
					}
				}
			},
			onShow: function() {
				var options = {};

				var that = this;
				var editorName;

				_.each(this.columns, function(element) {
					if (element.name === that.model.get('name')) {
						editorName = element.name;
						options.name = element.name;
						options.type = element.type;
						options.checked = element.checked;
						options.unchecked = element.unchecked;
						options.options = element.options;
					}
				});

				this.showEditor(options);
				this.editorName = editorName;
			},
			actions: {
				'change': function() {
					if (this.onEditorChange) {
						this.onEditorChange(this);
					}
				},
				'icon': function($btn) {
					if (this.onIconClick) {
						this.onIconClick(this.parentCt, $btn);
					}
				}
			}
		});

		var RowViewTr = app.view({
			type: 'CollectionView',
			tagName: 'tr',
			itemView: RowViewTd,
			initialize: function(options) {
				this.columns = options.columns;
				this.onEditorChange = options.onEditorChange;
				this.onIconClick = options.onIconClick;
				this.parentCt = options.parentCt;
			},
			onShow: function() {
				var col = [];
				for (var p in this.model.attributes) {
					if (p !== '_id') {
						col.push({
							name: p,
							value: this.model.get(p)
						});
					}
				}

				this.trigger('view:render-data', col);
			},
			itemViewOptions: function(model, index) {
				return {
					columns: this.columns,
					onEditorChange: this.onEditorChange,
					onIconClick: this.onIconClick,
					rawModel: this.model,
					parentCt: this.parentCt,
				}
			},
			getValues: function() {
				var obj = {};
				var col = this.$el.find('input, select').serializeArray();
				_.each(col, function(element) {
					obj[element.name] = element.value;
				})
				return obj;
			},
		});

		var FormGridView = app.view({
			type: 'CompositeView',
			itemView: RowViewTr,
			itemViewContainer: 'tbody',
			template: [
				'<table class="table table-striped table-hover table-condensed">',
				'<thead><tr class="headinfo"></tr></thead>',
				'<tbody></tbody>',
				'</table>',
			],
			initialize: function(options) {
				this.columns = options.columns;
				this.table = options.table.slice(0);
				this.onEditorChange = options.onEditorChange;
				this.onIconClick = options.onIconClick;
			},
			onShow: function() {
				this.trigger('view:render-data', this.table);
				this.addThead();
			},
			addThead: function() {
				var that = this;
				_.each(this.columns, function(element) {
					that.$el.find('thead > tr').append('<th>' + element.label + '</th>');
				});
			},
			itemViewOptions: function(model, index) {
				return {
					columns: this.columns,
					onEditorChange: this.onEditorChange,
					onIconClick: this.onIconClick,
					parentCt: this,
				}
			},
			getValues: function() {
				var values = [];

				for (var view in this.children._views) {
					values.push(this.children._views[view].getValues());
				}

				return values;
			},
			update: function(newData) {
				var values = this.getValues();
				var keys = _.keys(newData);
				var that = this;
				_.each(values, function(elem, index) {
					_.each(keys, function(keyElem) {
						if (values[index][keyElem] && that.table[index]) {
							that.table[index][keyElem] = values[index][keyElem];
						}
					})
				})
				this.table.push(newData);
				this.trigger('view:render-data', this.table);
				this.addThead();
			},
		});

		return FormGridView;
	});

})(Application);
