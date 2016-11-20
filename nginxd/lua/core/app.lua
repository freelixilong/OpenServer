local exception = loadMod("core.exception")
local session = loadMod("core.session")
local request = loadMod("core.request")
local response = loadMod("core.response")
local sysConf = loadMod("config.system")
local mongodb = loadMod("core.driver.mongodb")
local util = loadMod("core.util")

local App = {}


function App:init()
    if not ngx.var.LUA_PATH then
        exception:raise("core.badConfig", { LUA_PATH = ngx.var.LUA_PATH })
    end

    math.randomseed(tostring(ngx.now() * 1000):reverse():sub(1, 6))
end


function App:clean()
    -- set keepalive for the mongodb connection
    mongodb:close()
end

function App:checkAccess(module, method)

    local sessionId = request:getCookie("sessionid")
    local userinfo = session:getUserInfo(sessionId)
    
    local params = {}
    params.user = userinfo
    params.module = module
    params.method = method
    
    local result = util:proxy(sysConf.ProxyModule["CheckAccess"].proxyURL, params, nil, ngx.HTTP_GET)
    result = util:jsonDecode(result)
    if result and result.status == 200 then
    	return result.allow
    else
    	local errmsg = string.format('module CheckAccess faild for user:%s, module:%s, method:%s', params.user, params.module, params.method)
        exception:raise(errmsg)
        return false
    end
end

function App:route()
    local module, method = unpack(request:getAction())

    if not module or not method then
        exception:raise("core.badAction", { module = module, method = method })
    end

    local path = "code.ctrl." .. module
    local _, ctrl = exception:assert("core.badCall", { command = "loadMod", args = { path } }, pcall(loadMod, path))
    if not ctrl or not ctrl[method] or not ctrl.filter or not ctrl.cleaner then
        exception:raise("core.badCall", { module = module, method = method })
    end
    ngx.log(ngx.DEBUG, "App:route module = ", module )
    ctrl:filter()
    if module ~= 'User' and module ~= 'RestAPI' then
        ctrl:getSessionInfo()
    end
    
    ctrl[method](ctrl)
    ctrl:cleaner()
end

-- router init and dispatch
function App:run()
    local status, err = pcall(function()
        self:init()
        self:route()
    end)

    if not status then
        response:error(err)
    end

    self:clean()
end


return App
