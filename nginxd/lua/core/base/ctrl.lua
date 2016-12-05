local request = loadMod("core.request")
local util = loadMod("core.util")
local exception = loadMod("core.exception")
local session = loadMod("core.session")
local sysConf = loadMod("config.system")
local response = loadMod("core.response")
local CtrlBase = {}

function CtrlBase:filter()
    --do something before module:method() process
end

function CtrlBase:cleaner()
    --do something after module:method() process
end

function CtrlBase:getLoginUser()
    return session:getUserInfo(request:getCookie("sessionid"))
end
function CtrlBase:proxyProc(uri, method)
	local headers = ngx.req.get_headers()

	ngx.req.set_header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	
	ngx.req.set_header("Accept-Language", "zh-CN,zh;q=0.8")
	
	--ngx.req.set_header("User-Agent", "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:49.0) Gecko/20100101 Firefox/49.0")
	ngx.req.set_header("Referer", "http://10.100.10.223/")
	ngx.req.set_header("path", uri)
	ngx.req.set_header("site", request:getHeader("host"))

	ngx.log(ngx.DEBUG, "host:   ", request:getHeader("host"))
	ngx.log(ngx.DEBUG, "path:   ", uri)
	strCookie = "proxyIP=" .. sysConf.PROXY_BROWSER .. ";proxyPort=".. sysConf.PROXY_PORT .. ";"
	strCookie = strCookie .. "site="..request:getHeader("host") ..";"
    ngx.req.set_header("Cookie", strCookie)
    ngx.req.clear_header("host")
	return util:proxy("/proxy/index.html", ngx.var.args, request:getPayload(), method)
end

function CtrlBase:getSessionInfo(accFlag)
    local sessionid = request:getCookie("sessionid")
    local proxyAut = request:getHeader("Proxy-Authorization")
    if proxyAut ~= nil then
    	ngx.log(ngx.DEBUG, "proxy request:   ", util:jsonEncode(ngx.ctx[request]))
    	ngx.log(ngx.DEBUG, "proxy uri:   ", ngx.var.uri)
    	local usp = util:splitStr(proxyAut, " ")
    	usp = util:base64Decode(usp[2])
    	local user, pass = usp:match("([%w%d-_.]*):([%w%d-_.]*)")
    	if user == "scrapy" and pass == "scrapy.123" then
    		ngx.req.clear_header("Proxy-Authorization")
    		local body, header = self:proxyProc(ngx.var.uri, ngx.HTTP_GET)
    		response:reply(body, header)
    		ngx.log(ngx.DEBUG, "reply header:", util:jsonEncode(header))
		    return {}
		else
			response:reply({msg = "error proxy name and user!"}, nil, 500)
    	end
    else
    	ngx.log(ngx.DEBUG, "get sessionid as token:   ", sessionid)
	    local userInfo = session:check(sessionid, accFlag)
	    return userInfo
    end
  
end

return CtrlBase


