function isURLValid(url)
{
	var reg_url = new RegExp("^((https|http|ftp|rtsp|mms)?://)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\\.[a-z]{2,6})(:[0-9]{1,4})?((/?)|(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/?)$");
	return reg_url.test(url);
}

function padBeforeZero(str, cnt)
{
    while (str.length < cnt) {
        str = '0' + str;
    }
    return str;
}

function fullNameIpV4(str) {
    var digits = str.match(/[0-9]+/g);
    var i = -1;
    while (++i < digits.length) {
        digits[i] = padBeforeZero(digits[i], 4);
    }
    return digits.join(".");
}

function fullNameIpV6(str) {
    str = str.toLowerCase();
    var digits = str.match(/[0-9a-f]+|::/g);
    var i = -1, j = -1;
    while (++i < digits.length) {
        if ("::" == digits[i]) {
            j = i; break;
        }
    }

    while (j != -1 && digits.length < 8) {
        digits.splice(j, 1, "0", "0");
    }

    var i = -1;
    while (++i < digits.length) {
        digits[i] = padBeforeZero(digits[i], 4);
    }
    return digits.join(":");
}

function ipV4Gt(ip1, ip2) {
    return fullNameIpV4(ip1) > fullNameIpV4(ip2);
}

function ipV6Gt(ip1, ip2) {
    return fullNameIpV6(ip1) > fullNameIpV6(ip2);;
}

//test ipv4
function isIpV4AddrValid(ipv4) {
	return /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}$/.test(ipv4);
}


function isValidAddrMaskV4(str) 
{
    if (! isIpV4AddrValid(str)) 
        return false;

    var digits = str.split('.');
    var i = -1;
    while (++i < digits.length) {
        digits[i] = parseInt(digits[i]).toString(2);
        digits[i] = padBeforeZero(digits[i], 8);
    }
    str = digits.join('');
    return -1 != str.indexOf('1') && -1 == str.indexOf('01');
}


function simplifyIpV6Str(ipv6) {
	ipv6 = ipv6.replace(/:0+:/g, ":0:");
	if (-1 == ipv6.indexOf('::')) {
		ipv6 = ipv6.replace(/:0(:0)+/, "::");
		ipv6 = ipv6.replace(/::+/g, "::");
	}
	return ipv6;
}

//test ipv6
function isIpV6AddrValid(ipv6) {
	if (! /^\S+$/.test(ipv6))	 return false; // no space allow before or behind the ip str
	if (-1 == ipv6.indexOf(':')) return false; // fix bug for the following regex, which judges string without comma as legal
	ipv6 = simplifyIpV6Str(ipv6);
	return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(ipv6);
}

function isBracketIpV6AddrValid(ipv6) {
    if (! /^\S+$/.test(ipv6))    return false;
    if (-1 == ipv6.indexOf(':')) return false;
    ipv6 = simplifyIpV6Str(ipv6);
    var re = /^\[(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\]$|^\[(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])\]$|^\s*\[((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\]\s*$/g
    return re.test(ipv6);
}

function isBrdcastIpV4Addr(str) {
    return '0.0.0.0' == str;
}

function isBrdcastIpV6Addr(str) {
    return fullNameIpV6(str) == "0000:0000:0000:0000:0000:0000:0000:0000";
}

function isIpV6AddrWithMaskValid(str) {
    var pos = str.indexOf('/');
    if (-1 == pos) return false;

    var ip = str.substring(0, pos);
    var mask = str.substring(pos+1, str.length);

    if (! isIpV6AddrValid(ip) && ! isBrdcastIpV6Addr(ip)) {
        return false;
    }

    if (! /^[0-9]+$/.test(mask)) {
        return false;
    }
    mask = parseInt(mask);
    if (isNaN(mask) || mask > 128 || mask < 0) {
        return false;
    }

    return true;
}

function isIpV4V6RangeValid(str) {
	var pos = str.indexOf('-');
	if (-1 == pos) {
		if (isIpV4AddrValid(str)) {
			return ! isBrdcastIpV4Addr(str);
		} else if (isIpV6AddrValid(str)) {
			return ! isBrdcastIpV6Addr(str);
		} else {
			return false;
		}
	} else {
		var ip1 = str.substring(0, pos);
		var ip2 = str.substring(pos+1, str.length);
		if (isIpV4AddrValid(ip1) && isIpV4AddrValid(ip2)) {
			if (isBrdcastIpV4Addr(ip1) || isBrdcastIpV4Addr(ip2))
				return false;
			else
				return ipV4Gt(ip2, ip1);
		} else if (isIpV6AddrValid(ip1) && isIpV6AddrValid(ip2)) {
			if (isBrdcastIpV6Addr(ip1) || isBrdcastIpV6Addr(ip2))
				return false;
			else
				return ipV6Gt(ip2, ip1);
		} else {
			return false;
		}
	}
}

function isIpV4RangeValid(str) {
    var pos = str.indexOf('-');
    if (-1 == pos) {
        if (isIpV4AddrValid(str)) {
            return !isBrdcastIpV4Addr(str);
        }
    } else {
        var ip1 = str.substring(0, pos);
        var ip2 = str.substring(pos+1, str.length);
        if (isIpV4AddrValid(ip1) && isIpV4AddrValid(ip2)) {
            if (isBrdcastIpV4Addr(ip1) || isBrdcastIpV4Addr(ip2))
                return false;
            else
                return ipV4Gt(ip2, ip1);
        }
    }
    return false;
}

function isIpV6RangeValid(str) {
    var pos = str.indexOf('-');
    if (-1 == pos) {
        if (isIpV6AddrValid(str)) {
            return !isBrdcastIpV6Addr(str);
        }
    } else {
        var ip1 = str.substring(0, pos);
        var ip2 = str.substring(pos+1, str.length);
        if (isIpV6AddrValid(ip1) && isIpV6AddrValid(ip2)) {
            if (isBrdcastIpV6Addr(ip1) || isBrdcastIpV6Addr(ip2))
                return false;
            else
                return ipV6Gt(ip2, ip1);
        }
    }
    return false;
}


function checkHostname(str) {
	if(str.indexOf(",") > -1) {
		var strstr = str.split(',');
		var l = str.length;

		var re = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
		for(var i = 0; i < l; i++) {
			if(!re.test(strstr[i])) {
				return false;
			}
		}
	} else {
		var re = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
		if(!re.test(str)) {
			return false;
		}
	}

	return true;
}

function  checkOtherChar2(str,errmsg) 
{
       for(var loop_index=0; loop_index<str.length; loop_index++)  
       {  
         if(str.charAt(loop_index) == '~'   
           ||str.charAt(loop_index) == '!'  
           ||str.charAt(loop_index) == '@'  
           ||str.charAt(loop_index) == '#'  
           ||str.charAt(loop_index) == '$'  
           ||str.charAt(loop_index) == '%'  
           ||str.charAt(loop_index) == '^'  
           ||str.charAt(loop_index) == '&'  
           ||str.charAt(loop_index) == '('  
           ||str.charAt(loop_index) == ')'  
           ||str.charAt(loop_index) == '+'  
           ||str.charAt(loop_index) == '{'  
           ||str.charAt(loop_index) == '}'  
           ||str.charAt(loop_index) == '|'  
           //||str.charAt(loop_index) == ':'  
           ||str.charAt(loop_index) == '"'  
           ||str.charAt(loop_index) == '<'  
           ||str.charAt(loop_index) == '>'  
           ||str.charAt(loop_index) == '?'  
           ||str.charAt(loop_index) == '`'  
           ||str.charAt(loop_index) == '='  
           //||str.charAt(loop_index) == '['  
           //||str.charAt(loop_index) == ']'  
           ||str.charAt(loop_index) == '\\'  
           ||str.charAt(loop_index) == ';'  
           ||str.charAt(loop_index) == '\'') 
          {  
            //alert("~,!,@,#,$,%,^,&,*,+,`,\',\",:,(,),[,],{,},<,>,|,\\ and / are illegal. Please re-input."); 
            return false;  
   	   }  
         }//end of for(loop_index)  
      return true;
}

(function(app) {

    app.editor.validator('noSpaceStr', function(options, str, parentCt) {
		if (/^[\s]+$/.test(str)) {
			return 'Name is required.';
		}
	});
    app.editor.validator('wvsPolicyName', function(options, val, parentCt) {
        re = /^[\S]+$/g
        re2 = /^(\w)+$/g
        if (!re.test(val)) {
            return "The space character is not allowed.";
        } else if (!re2.test(val)) {
            return "The following characters are not allowed: ~ ` !  @ # $ % ^ & * ()  | ; ?  / ' \" < >"
        }
    });
    app.editor.validator('ipCheck', function(options, val, parentCt) {
        if (_.isEmpty(val)) {
            return options.emptyMessage ? options.emptyMessage : "This field is required.";
        } else if ((_.isObject(options) && options.errorMessage) && (options.invalidIp === val)) {
            return options.errorMessage;
        } else {
            re = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}$/g
            if (!re.test(val)) {
                return options.errorMessage ? options.errorMessage : val + " is not a valid IP address.";
            }
        }
    });
    app.editor.validator('ipV4V6Check', function(options, val, parentCt) {
        if (_.isEmpty(val)) {
            return options.emptyMessage ? options.emptyMessage : "This field is required.";
        } else if ((_.isObject(options) && options.errorMessage) && (options.invalidIp === val)) {
            return options.errorMessage;
        } else {
            var re = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}$/g
            if (! re.test(val)) {
                if (! isBracketIpV6AddrValid(val)) {
                    return options.errorMessage ? options.errorMessage : val + " is not a valid IP address.example: 192.168.1.10 or [2001::10]";
                };
            }
        }
    });
    app.editor.validator('ipv4Ipv6Check', function(options, val, parentCt) {
        if (_.isEmpty(val)) {
            return options.emptyMessage ? options.emptyMessage : "This field is required.";
        } else if ((_.isObject(options) && options.errorMessage) && (options.invalidIp === val)) {
            return options.errorMessage;
        } else {
            var re = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}$/g
            if (! re.test(val)) {
                if (! isIpV6AddrValid(val)) {
                    return options.errorMessage ? options.errorMessage : val + " is not a valid IP address.example: 192.168.1.10 or 2001::10";
                };
            }
        }
    });
    app.editor.validator('ipNumMaskCheck', function(options, val, parentCt) {
        re = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}\/(3[0-2]|[1-2][0-9]|[0-9])$/g
        if (!re.test(val)) {
            return "ip address error.example:192.168.1.10/12";
        }
    });
    app.editor.validator('optEmailCheck', function(options, val, parentCt) {
        re = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
        if (val == "")
            return;
        if (!re.test(val)) {
            return "The Email to is not valid.";
        }
    });
    app.editor.validator('requiredEmailCheck', function(options, val, parentCt) {
        re = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
        if (!re.test(val)) {
            return options.error;
        }
    });
    app.editor.validator('virtualServerIPCheck', function(options, val, parentCt) {
        re = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3})\/((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3})$/g
        if (!re.test(val)) {
            return "Invalid IP Address.";
        }
    });
    app.editor.validator('ipLineMaskCheck', function(options, val, parentCt) {
        re = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3})\/((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3})$/g
        if (!re.test(val)) {
            return "ip address error.example:192.168.1.10/255.255.255.0";
        }
    });
    app.editor.validator('ipLineMaskNumCheck', function(options, val, parentCt) {
        re = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3})\/((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3})$/g
        reNum = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}\/(3[0-2]|[1-2][0-9]|[0-9])$/g
        if (!re.test(val) && !reNum.test(val)) {
            return "ip address error.example:192.168.1.10/255.255.255.0 or 192.168.1.10/24";
        }
    });


    app.editor.validator('checkRangeIpV4V6', function(options, str, parentCt) {
		if (! isIpV4V6RangeValid(str)) {
			return 'Invalid IP Address.';
		}
    });

    app.editor.validator('checkIpV4AddrNoMask', function(options, val, parentCt) {
        if (! isIpV4AddrValid(val)) {
            return "ip address error.example:192.168.1.10";
        }
    });

    app.editor.validator('checkIpV6AddrNoMask', function(options, val, parentCt) {
        if (! isIpV6AddrValid(val)) {
            return "ip6 address error.example: 2012:0:0:0:1:2345:6789:abcd or ff06::c333";
        }
    });

    app.editor.validator('checkIpV4Addr', function(options, str, parentCt) {
        var pos = str.indexOf('/');
        var ip = str.substring(0, pos);
        var mask = str.substring(pos+1, str.length);
        mask = parseInt(mask);
        if (isNaN(mask) || mask > 32 || mask < 0 || ! isIpV4AddrValid(ip)) {
            return "ip address error.example:192.168.1.10/24";
        }
    });

    app.editor.validator('checkIpV6Addr', function(options, str, parentCt) {
        if (! isIpV6AddrWithMaskValid(str)) {
            return "ip address error.example: 2012:0:0:0:1:2345:6789:abcd/32 or ff06::c333/64";
        }
    });

    app.editor.validator('checkIpV4V6AddrNoMask', function(options, val, parentCt) {
        if (! isIpV4AddrValid(val) && ! isIpV6AddrValid(val)) {
            return "address error.example: 192.168.1.10 or 1050:0:0:0:5:600:300c:326b or ff06::c333";
        }
    });

    app.editor.validator('checkIpV4V6Addr', function(options, str, parentCt) {
        var pos = str.indexOf('/');
        var ip = str.substring(0, pos);
        var mask = str.substring(pos+1, str.length);
        mask = parseInt(mask);
        if (! isNaN(mask) && isIpV4AddrValid(ip) && mask <= 32 && mask >= 0) {
        } else if (! isNaN(mask) && isIpV6AddrValid(ip) && mask <= 128 && mask >= 0) {
        } else {
            return "address error.example: 192.168.1.10/24 or 1050:0:0:0:5:600:300c:326b/64 or ff06::c333/32";
        }
    });

    app.editor.validator('checkIpV4V6AddrNoMaskNoBrdcast', function(options, val, parentCt) {
        if (! isIpV4AddrValid(val) && ! isIpV6AddrValid(val)) {
            return "address error.example: 192.168.1.10 or 1050:0:0:0:5:600:300c:326b or ff06::c333";
        } else if (isBrdcastIpV4Addr(val) || isBrdcastIpV6Addr(val)) {
            return "Invalid IP Address."
        }
    });

    app.editor.validator('checkIpV4AddrNoMaskNoBrdcast', function(options, val, parentCt) {
        if (! isIpV4AddrValid(val) || isBrdcastIpV4Addr(val)) {
            return val + " is not a valid IP.";
        }
    });

    app.editor.validator('portCheck', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 65535) {
            return val + ' is not a valid value Port must in scope 1~65535';
        }
    });
    app.editor.validator('ipCheck0000', function(options, val, parentCt) {
        re = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}$/g
        if (val == "0.0.0.0") {
            return val + " is not a valid ip";
        }
        if (!re.test(val)) {
            return val + " is not a valid ip";
        }
    });
    app.editor.validator('pathCheck', function(options, val, parentCt) {
        re = /^\/.*$/g
        if (!re.test(val)) {
            return 'The request URL must start with "/" and without domain name.';
        }
    });
    app.editor.validator('periodCheck', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 3600) {
            return 'Period must be in 1~3600.';
        }
    });

    app.editor.validator('ip6LineCheck', function(options, val, parentCt) {
        re = /^((((([0-9a-fA-F]{4}|0):){7}([0-9a-fA-F]{4}|0))|((([0-9a-fA-F]{1,4}|0):){0,7}:([0-9a-fA-F]{1,4}|0|:){0,7}))\/(1[0-2][0-8]|0|[1-9][0-9]))$/g
        if (!re.test(val)) {
            return "ip6 address slash mask error.example: 1050:0:0:0:5:600:300c:326b/10 or ff06::c333/123";
        }
    });
    //for different count validation
    app.editor.validator('countCheck_2147483647', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 2147483647) {
            return val + ' is not a valid value. Value  must in scope 1~2147483647';
        }
    });
    app.editor.validator('countCheck_67108864', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 67108864) {
            return val + ' is not a valid value. Value  must in scope 1~67108864';
        }
    });
    app.editor.validator('countCheck_1048576', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 1048576) {
            return val + ' is not a valid value. Value must in scope 1~1048576';
        }
    });
    app.editor.validator('countCheck_86400', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 86400) {
            return val + ' is not a valid value. Value must in scope 1~86400';
        }
    });
    app.editor.validator('countCheck_10000', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 10000) {
            return val + ' is not a valid value. Value  must in scope 1~10000';
        }
    });
    app.editor.validator('countCheck_10240', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 10240) {
            return val + ' is not a valid value. Maximum Cached Page Size value must in scope 1~10240';
        }
    });
    app.editor.validator('countCheck_8192', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 8192) {
            return val + ' is not a valid value. Value must in scope 1~8192';
        }
    });
    app.editor.validator('countCheck_7200', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 7200) {
            return val + ' is not a valid value. Default Cache Timeout value must in scope 1~7200';
        }
    });
    app.editor.validator('countCheck_100', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 100) {
            return val + ' is not a valid value. Cache Buffer Size must in scope 1~100';
        }
    });
    app.editor.validator('countCheck_64', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 64) {
            return val + ' is not a valid value. Value  must in scope 1~64';
        }
    });
    app.editor.validator('countCheck_32', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 32) {
            return val + ' is not a valid value. Value  must in scope 1~32';
        }
    });
    app.editor.validator('countCheck_10', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 10) {
            return val + ' is not a valid value. Value  must in scope 1~10';
        }
    });
    app.editor.validator('countCheck_20', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 20) {
            return val + ' is not a valid value. value must in 1~20';
        }
    });
    app.editor.validator('countCheck_16', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 16) {
            return val + ' is not a valid value. Value  must in scope 1~16';
        }
    });
    app.editor.validator('countCheck_60', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 60) {
            return val + ' is not a valid value. Value  must in scope 1~60';
        }
    });
    app.editor.validator('countCheck_63', function(options, val, parentCt) {
        if (isNaN(val) || val < 0 || val > 63) {
            return val + ' is not a valid value. value must in scope 0~63';
        }
    });
    app.editor.validator('countCheck_9', function(options, val, parentCt) {
        if (isNaN(val) || val < 0 || val > 9) {
            return val + ' is not a valid value. value ust in scope 0~9';
        }
    });
    app.editor.validator('countCheck_480', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 480) {
            return val + ' is not a valid value. value must in scope 1~480';
        }
    });
    app.editor.validator('countCheck_3600', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 3600) {
            return val + ' is not a valid value. Period must in scope 1~3600';
        }
    });
    app.editor.validator('countCheck_65535', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 65535) {
            return val + ' is not a valid value. The value must in scope 1~65535';
        }
    });
    app.editor.validator('countCheck_99999', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 99999) {
            return val + ' is not a valid value. The value must in scope 1~99999';
        }
    });
    app.editor.validator('countCheck_999999', function(options, val, parentCt) {
        if (isNaN(val) || val < 1 || val > 999999) {
            return val + ' is not a valid value. The value must in scope 1~999999';
        }
    });
    app.editor.validator('countCheck_0_99999', function(options, val, parentCt) {
        if (isNaN(val) || val < 0 || val > 99999) {
            return val + ' is not a valid value. The value must in scope 0~99999';
        }
    });
    app.editor.validator('cookieTimeoutCheck_3600', function(options, val, parentCt) {
        if (isNaN(val) || val < 0 || val > 3600) {
            return val + ' is not a valid value. the value must in 0~3600';
        }
    });
    //count end
    app.editor.validator('urlChecker', function(options, val, parentCt) {
        re = /^(((http|https|www):?(\/\/|\.){1}[\w-_]+.*)|((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}:?[0-9]*))/g;
        if (!re.test(val)) {
            return 'please input a valid URL for OSCP.';
        }
    });
    app.editor.validator('characterCheck', function(options, value, parentCt) {
        if (value.length) {
            for (var i = 0; i < value.length; i++) {
                if (value[i] == "#" || value[i] == '<' || value[i] == '>' || value[i] == '\"' || value[i] == "\'" || value[i] == '\\' || value[i] == '(' || value[i] == ')') {
                    return 'The following characters are not allowed: < > ( ) # " \'';
                }
            }
        } else {
            return 'Name is required.';
        }
    });

    app.editor.validator('wvsnameCheck', function(options, value, parentCt) {
        if (value.length == 0)
            return 'Name is required.';
        for (var i = 0; i < value.length; i++) {
            if (value[i] == "~" ||
                value[i] == '`' || value[i] == '!' || value[i] == '@' ||
                value[i] == '#' || value[i] == '$' || value[i] == '%' ||
                value[i] == '^' || value[i] == '&' || value[i] == '*' ||
                value[i] == '(' || value[i] == ')' ||
                value[i] == '|' || value[i] == ';' || value[i] == '?' ||
                value[i] == '/' || value[i] == '\'' ||
                value[i] == '<' || value[i] == '>' ||
                value[i] == '"') {
                return 'The following characters are not allowed: ~ ` ! @ # $ % ^ & * ( ) | ; ? / \' " < >';
            }
        }
    });

    app.editor.validator('rangeCheck', function(options, value, parentCt) {
        if (_.isEmpty(value)) {
            return options.emptyMessage ? options.emptyMessage : 'field is reuqired.';
        } else if (isNaN(value) || value < options.start || value > options.end) {
            return options.errorMessage ? options.errorMessage : 'value must in (' + options.start + '~' + options.end + ')';
        }
    });

    app.editor.validator('smtpServerCheck', function(options, value, parentCt) {
        var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
            + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" // ftp的user@
            + "(([0-9]{1,3}\\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
            + "|" // 允许IP和DOMAIN（域名）
            + "([0-9a-zA-Z_!~*'()-]+\\.)*" // 域名- www.
            + "([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z]\\." // 二级域名
            + "[a-zA-Z]{2,6})" // first level domain- .com or .museum
            + "(:[0-9]{1,4})?" // 端口- :80
            + "((/?)|" // a slash isn't required if there is no file name
            + "(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/?)$";
        var re = new RegExp(strRegex);
        if (_.isEmpty(value)) {
            return options.emptyMessage ? options.emptyMessage : 'field is reuqired.';
        } else if (!re.test(value)) {
            return options.errorMessage ? options.errorMessage : "smtp address error.example:x.x.x.x or a@b.com";
        }
    });

    app.editor.validator('filenamecheck', function(options, value, parentCt) {
        if (value.length == 0)
            return 'Please select a file to upload';
    });
    app.editor.validator('lengthcheck_63', function(options, value, parentCt) {
        if (value.length >63){
            if(!_.isEmpty(options) && options.name) return options.name + ' are too long! (max:63)';
            else return 'Comments are too long! (max:63)';
        }
    });
    app.editor.validator('lengthcheck_199', function(options, value, parentCt) {
        if (value.length >199)
            return 'Comments are too long';
    });
    app.editor.validator('lengthcheck_100', function(options, value, parentCt) {
        if (value.length >100)
            return 'The maximum number of characters is 100.';
    });
    app.editor.validator('countCheck_1024', function(options, val, parentCt) {
        if (isNaN(val) || val < 0 || val > 1024) {
            return val + ' is not a valid value. Set Maxlen must in scope 0~1024';
        }
    });
})(Application);
