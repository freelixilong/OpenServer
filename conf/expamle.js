var gov = {
	_id : "gov_bjfgw",
	type : "default", 
	key : "bjfgw", 
	name : "北京市发改委",
	link : "http://www.bjpc.gov.cn/",
	area : "北京",
	condition : '//*[@id="container"]/div[6]/h1', 
	fields : { 
		section : {
			select : [{ 
					xpath : '//*[@id="container"]/div[5]',
					condition : "and",
					seq : "1"
				}
			],
            needProcess: {split: true, token: '>'},
			option : false,
		},
		
		title : {
			select : [{ 
					xpath : '//*[@id="container"]/div[6]/h1',  
					condition : "and",
					seq : "1"
				}
			],
			option : false,
		},
		content : {
			select : [{ 
					xpath : '//*[@id="container"]/div[6]/div[1]/div/p/text()',
					condition : "and",
					seq : "1"
				}
			],
			option : true,
		},
        link : { 
			option : true, 
		},
        date : { 
			option : true,
            select : [{ 
                    xpath : '//*[@id="container"]/div[6]/h2/span[2]',
                    condition : "and",
                    seq : "1"
                }
            ],            
		},
	},
};

db.GovDepartment.insert(gov);
