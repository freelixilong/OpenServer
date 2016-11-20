local util = loadMod("core.util")
local exception = loadMod("core.exception")
local session = loadMod("core.session")
local serviceBase = loadMod("core.base.service")
local sysConf = loadMod("config.system")
local response = loadMod("core.response")
local log = util:getService("log")

local User = {
    DBACC_NAME = "dbEngine",
    CACHE_HELPER = ngx.shared.cache,
}

local function setCookie(token)
    ngx.log(ngx.DEBUG, 'set cookie for token: ', token)

    local expires_after = sysConf.SESSION_EXPTIME
    local expiration = os.time() + expires_after
    local cookie = "sessionid=" .. token .. "; "
    cookie = cookie .. "Path=/;"
    cookie = cookie .. "Max-Age=" .. expires_after
    ngx.header['Set-Cookie'] = {cookie}
end

local function setLogoutcookie(token)
    ngx.log(ngx.DEBUG, 'set logout cookie for token: ', token)
    session:destroy(token)

    local expires_after = 0
    local expiration = os.time() + expires_after
    local cookie = "sessionid=" .. "xx" .. "; "
    cookie = cookie .. "Path=/;"
    cookie = cookie .. "Max-Age=" .. expires_after
    ngx.header['Set-Cookie'] = {cookie}
end

function User:mixPwd(passwd)
    return util.string:sha1(passwd .. sysConf.PASSWD_MIX_KEY)
end

function getUserInfo(username, password)
    local query = {["$and"] = {
        {["uname"] = username},
        {["pwd"] = password}
    }}
    util:zeroBasedArray(query)
    local res = self:getOne("UserInfo", query)
    return res
end

function User:login(module, args)
    ngx.log(ngx.DEBUG, "login starting ...", module, " username: ", args.uname)
    ngx.log(ngx.DEBUG, "login starting ...", module, " password: ", args.pwd)
    local userInfo = getUserInfo(args.uname, args.pwd)
    if not userInfo then
        ngx.log(ngx.ERR, 'Login fail and redirect to login.html')
        log:add(sysConf.LogLevel.CRITICAL, args.uname, sysConf.LogAction.LOGIN, {status = "failed"})
        return ngx.redirect("/login.html", 302)
    end

    local token = session:register(userInfo)
    setCookie(token)
    log:add(sysConf.LogLevel.INFO, args.uname, sysConf.LogAction.LOGIN, nil)
    ngx.log(ngx.DEBUG, 'redirect to /index.html')
    return ngx.redirect("/", 302)
end

function User:logout(module, args, token)
    ngx.log(ngx.DEBUG, "logout starting for token:", token)
    log:add(sysConf.LogLevel.INFO, nil, sysConf.LogAction.LOGOUT, nil)
    session:destroy(token)
    setLogoutcookie(token)
    self.cacheHelper:set("licInfoSent", 0)
    ngx.log(ngx.DEBUG, 'redirect to login page')
    return ngx.redirect("/login.html", 302)
end

function User:checkPassword(name, password)
    local userInfo = getUserInfo(name, password)
    if userInfo then
        return true
    else 
        ngx.log(ngx.DEBUG, "username ", name, "check failed!")
        return false
    end
end

return serviceBase:inherit(User):init()
