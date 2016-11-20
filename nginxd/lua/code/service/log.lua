local util = loadMod("core.util")
local request = loadMod("core.request")
local session = loadMod("core.session")
local sysConf = loadMod("config.system")
local mongodb = loadMod("core.driver.mongodb")
local Log = {}

function Log:getUserName( )
	local userInfo = nil
	local token = request:getCookie("sessionid")
	local userInfo = session:getUserInfo(token)

	return userInfo
end
function Log:getMsg(userName,action,arg)
	local msg = ""
	if(action == sysConf.LogAction.LOGIN) then
		if arg ~= nil then
			msg = "User "..userName.." login failed from "..ngx.var.remote_addr
		else
			msg = "User "..userName.." logged in successfully from "..ngx.var.remote_addr
		end 
	elseif(action == sysConf.LogAction.LOGOUT) then
		msg = "User "..userName.." logged out from "..ngx.var.remote_addr
	elseif (action == sysConf.LogAction.CHANGEPASS) then
		msg = "User "..userName.." changed local-user "..arg.." from "..ngx.var.remote_addr
	elseif(action == sysConf.LogAction.USERADD) then
		msg = "User "..userName.." added local-user "..arg.." from "..ngx.var.remote_addr
	elseif(action == sysConf.LogAction.USERDEL) then
		msg = "User "..userName.." deleted local-user "..arg.." from "..ngx.var.remote_addr
	elseif (action == sysConf.LogAction.CFGIMPORT) then
		msg = "User "..userName.." import config from device "..arg.." from "..ngx.var.remote_addr
	elseif (action == sysConf.LogAction.IMPORTFAIL) then
		msg = "User "..userName.." import config from device "..arg.." failed from "..ngx.var.remote_addr
	elseif (action == sysConf.LogAction.IMPORTREVERT) then
		msg = "User "..userName.." revert to previous version successfully from "..ngx.var.remote_addr
	end
	ngx.log(ngx.DEBUG , "Log getMsg Remote ip:", ngx.var.remote_addr)
	return msg

end
function Log:add(level, user, action, arg)
 	-- body
 	docs = {}
 	local userName = user or Log:getUserName()
 	if userName == nil then
 	    return
 	end 
 	local msg = Log:getMsg(userName, action, arg)
 	
 	local doc = {date = os.date("%Y-%m-%d"), time = os.date("%X"), level = level, user = userName, action= action, message= msg}
 	local jsonStr = util:jsonEncode(doc)
 	table.insert(docs, doc)
 	mongodb:creat("LogEvent", docs)
end
function Log:moduleEventAdd(module, level, user, action, arg)
	docs = {}
 	local userName = user or Log:getUserName()
 	if userName == nil then
 	    return
 	end 
 	local msg = Log:getMsg(userName, action, arg)
 	local doc = {date = os.date("%Y-%m-%d"), time = os.date("%X"), level = level, user = userName, action= action, message= msg}
 	local jsonStr = util:jsonEncode(doc)
 	table.insert(docs, doc)
 	mongodb:creat(module, docs)
end
return Log