local request = loadMod("core.request")
local util = loadMod("core.util")
local exception = loadMod("core.exception")
local session = loadMod("core.session")
local sysConf = loadMod("config.system")

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

function CtrlBase:getSessionInfo(accFlag)
    local sessionid = request:getCookie("sessionid")
    ngx.log(ngx.DEBUG, "get sessionid as token:   ", sessionid)
    local userInfo = session:check(sessionid, accFlag)
    return userInfo
end

return CtrlBase


