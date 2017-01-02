;(function(app) {

	app.editor('DateTime', function() {

		var UI = app.view({
			template: [
				'<label class="control-label {{layout.label}}" for="basic-editor-588">{{label}}</label>',
				'<div class="col-md-9 date-time-editor">',
					'<div class="clearfix ">',
						'<div class="col-md-2">',
							'<select tyle="width:60px" name="time_year" size="1" class="form-control" style="margin-bottom:0" >',
								'{{#each yearArray}}',
									'<option value="{{this}}">{{this}}</option>',
								'{{/each}}',
							'</select>',
						'</div>',
						'<div class="col-md-2">',
							'<select  name="time_month" size="1" class="form-control" style="margin-bottom:0" >',
								'<option value="01">Jan</option>',
								'<option value="02">Feb</option>',
								'<option value="03">Mar</option>',
								'<option value="04">Apr</option>',
								'<option value="05">May</option>',
								'<option value="06">Jun</option>',
								'<option value="07">Jul</option>',
								'<option value="08">Aug</option>',
								'<option value="09">Sep</option>',
								'<option value="10">Oct</option>',
								'<option value="11">Nov</option>',
								'<option value="12">Dec</option>',
							'</select> ',
						'</div>',
						'<div class="col-md-2">',
							'<select name="time_day" size="1" class="form-control" style="margin-bottom:0" >',
							'</select>',
						'</div>',
					'</div>',
					'<span class="help-block editor-help-text" style="margin-bottom:0;display:inline">',
						'<small>{{help}}</small>',
					'</span>',
					'<span class="help-block editor-status-text input-error" ui="msg"></span>',
				'</div>',
			],
			className: 'form-group',
			events:{
				"change select[name!='time_day']" : 'setDay',
			},
			initialize: function(options) {
				var dateObj=new Date();
				var currentYear = dateObj.getFullYear();
				var startYear = currentYear - 11;
				var endYear = currentYear + 15;
				var yearArray = [];
				for(var i = startYear;i<=endYear;i++){
					yearArray.push(i);
				}

				this.trigger('view:render-data', _.extend(options, {yearArray : yearArray}));
			},
			onRender: function(){
				this.setDay();
				if (this.options.value){
					this.setVal(this.options.value);
				}
			},
			getVal: function() {
				var dateTimeArray = this.$el.find('select').serializeArray();
				var dateTime = {};
				$.each( dateTimeArray, function(i, field){
					dateTime[field.name] = field.value;
				});

				return dateTime.time_year + '/' + dateTime.time_month + '/'+ dateTime.time_day;
			},
			setVal: function(val) {
				var date = val.split('/');

				this.$el.find('[name="time_year"]').children('[value="'+date[0]+'"]').attr("selected",true);
				this.$el.find('[name="time_month"]').children('[value="'+date[1]+'"]').attr("selected",true);
				this.$el.find('[name="time_day"]').children('[value="'+date[2]+'"]').attr("selected",true);
			},
			validate: function() {
			},
			disable: function(flag) {
			},
			setDay: function(){
				var year = parseInt(this.$el.find('select[name="time_year"]').val(),10);
				var month = parseInt(this.$el.find('select[name="time_month"]').val(),10);
				var day = 30;
				var $daySelect = this.$el.find('select[name="time_day"]');

				var nowDay = $daySelect.val();
				$daySelect.find('option').remove();

				if( month === 1 || month === 3|| month === 5 || month === 7 || month === 8 || month === 10 || month === 12){
					day = 31;
				}else if (month === 2){
					day = 28;
					if( year%100 === 0 ) {
						if ( year%400 === 0 ) day = 29;
					}
					else if ( year%4 === 0 ) day = 29;
				}
				var j;
				for (var i=1;i<=day;i++){
					if ( i<10 ) j= "0"+i;
					else j=i;
					$daySelect.append('<option value="'+j+'">'+ j +'<options>');
				}

				if(nowDay) $daySelect.find("option[value='"+nowDay+"']").attr("selected",true);

			}
		});
		return UI;
	});

})(Application);