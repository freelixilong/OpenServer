local exception = loadMod("core.exception")
local sysConf = loadMod("config.system")
local response = loadMod("core.response")

local TOKEN_INDEX_PREFIX = sysConf.SERVER_MARK .. ".userToken."

local Session = {
    cacheHelper = nil,
}

function Session:init()
    self.cacheHelper = ngx.shared.cache

    -- chains sematics
    return self
end

function Session:register(userInfo, sso)
    ngx.log(ngx.DEBUG, "session register ... ")
    local succ, err, forcible

    if not userInfo or not userInfo._id then
        exception:raise("core.systemErr", { userInfo = userInfo })
    end

    local index = TOKEN_INDEX_PREFIX .. userInfo._id

    -- already login
    if sso then
        local token = self.cacheHelper:get(index)
        self.cacheHelper:delete(token)
    end

    ngx.log(ngx.DEBUG, "session register ... userid =====> ", userInfo._id)

    -- produce new login
    token = ngx.md5(table.concat({ sysConf.SERVER_MARK, ngx.now(), userInfo._id}, "."))
    succ, err, forcible = sso and self.cacheHelper:set(index, token, sysConf.SESSION_EXPTIME) or self.cacheHelper:set(token, userInfo._id, sysConf.SESSION_EXPTIME)

    local again = self.cacheHelper:get(token)
    ngx.log(ngx.DEBUG, "session token get agagin ====> ", again)

    return token
end
function Session:getUserInfo(token)
    -- body
    local userInfo = self.cacheHelper:get(token)
    ngx.log(ngx.DEBUG, "session check for token val: ", userInfo)
    if not userInfo then
        return nil
    end
    return userInfo
end
function Session:check(token, accFlag)
    ngx.log(ngx.DEBUG, "session check ... ", token)
    if not token  then
        if accFlag and not string.find(ngx.var.uri, "/data") then
            ngx.log(ngx.DEBUG, "access session check ... failed for uri =========+++++++++<> ", ngx.var.uri)
            return  ngx.redirect("/login.html", 302)
        else
            ngx.log(ngx.DEBUG, "session check ... failed for uri =========+++++++++<> ", ngx.var.uri)
            ngx.log(ngx.DEBUG, "session check ... failed and rediect to 302 /login.html")
            response:reply('', nil, 424)
        end
    end
    local userInfo = self.cacheHelper:get(token)
    ngx.log(ngx.DEBUG, "session check for token val: ", userInfo)
    if not userInfo then
        if accFlag and not string.find(ngx.var.uri, "/data") then
            ngx.log(ngx.DEBUG, "access session check ... failed and rediect to /login.html")
            return ngx.redirect("/login.html", 302)
        else
            ngx.log(ngx.DEBUG, "session check ... failed and rediect to /login.html")
            response:reply('', nil, 424)
        end
    end
    --    --[[
    --    while not (self.cacheHelper:add(token .. ".lock",  sysConf.LOCKER_TIMEOUT)) do
    --        ngx.sleep(sysConf.LOCKER_RETRY_INTERVAL)
    --    end
    --    --]]
    ngx.ctx[Session] = token
    return userInfo
end

function Session:destroy(token)
    ngx.log(ngx.DEBUG, "sesseion destroy token: ", token)
    self.cacheHelper:delete(token)
    local again = self.cacheHelper:get(token)
    ngx.log(ngx.DEBUG, "session token get token val: ====> ", again)
end

--- 解除操作锁
function Session:unlock()
    local token = ngx.ctx[Session]

    if token then
        self.cacheHelper:delelte(token .. ".lock")
    end
end

return Session:init()
