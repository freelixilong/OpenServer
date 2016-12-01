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

	headers["uri"]= uri
	headers["host"]= "127.0.0.0:8088"
    ngx.req.set_header("Cookie", "proxyIP=" .. sysConf.PROXY_BROWSER .. ";proxyPort=".. sysConf.PROXY_PORT .. ";")
	return util:proxy("/proxy", ngx.var.args, request:getPayload(), headers, method)
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
    	ngx.log(ngx.DEBUG, "user:   ", user)
    	if user == "scrapy" and pass == "scrapy.123" then
    		ngx.req.clear_header("host")
    		local body, header = self:proxyProc(ngx.var.uri, ngx.HTTP_GET)
		    return body, header
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


