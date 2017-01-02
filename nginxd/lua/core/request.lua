local util = loadMod("core.util")
local exception = loadMod("core.exception")
local sysConf = loadMod("config.system")

local Request = {}

-- @param table args 源参数表(Hash模式)
-- @param table data 目标参数表(Hash模式)
local function parseArgs(args, data)
    for key, val in pairs(args) do
        data.params[key] = val
    end
end

local function parseUri(uri, data)
    local root, menu, subMenu = nil, nil, nil
    local method = ngx.var.request_method:lower()
    local root, depart, departId, section, sectionId, title, titleId = uri:match("^/([%w_-]+)/([%w_-]+)/?([%w%d%s-_]*)/?([%w%s-_]*)/?([%w%d%s-_]*)/?([%w%s-_]*)/?([%w%d%s-_]*)")
    --http://localhost/api/v1.0
    --http://localhost/data/departId/sectionId(composed)/titleId

    if root == "data" and depart and method then
        data.action = {"Object", method}
        data.params["depart"]    = depart
        data.params["departId"]    = departId
        data.params["section"] = section
        data.params["sectionId"] = sectionId
        data.params["title"] = section
        data.params["titleId"] = titleId
    elseif root == "auth" and departId then
        if departId == "login" or departId == "logout" then
            data.action = {"User", method}
        end
    elseif root == "api" then
        data.action = {"RestAPI", method}
    end
end

-- @return table (Hash mode)
local function parseRequestData()
    local body
    local data = {
        action = {},
        headers = ngx.req.get_headers(),
        params = {},
        cookies = {},
        time = ngx.req.start_time(),
        payload = {},
        ip = ngx.var.remote_addr
    }
    if sysConf.COOKIE_ENABLE then
        if data.headers.cookie then
            for key, value in data.headers.cookie:gmatch("([%w_]+)=([^;]+)") do
                data.cookies[key] = value
            end
        end
    end

    parseArgs(ngx.req.get_uri_args(), data)
    parseUri(ngx.var.uri, data)

    ngx.req.read_body()
    body = ngx.req.get_body_data()
    if not body and data.headers["Content-Type"] and string.find(data.headers["Content-Type"], "multipart") then
        local datafile = ngx.req.get_body_file()
        if not datafile then
            exception:raise("core.uploadFailed", "The file is too big!")
        else
            local fh, err = io.open(datafile, "r")
            if not fh then
                exception:raise("core.uploadFailed", "Can't open the temp file!")
            else
                fh:seek("set")
                body = fh:read("*a")
                fh:close()
                if body == "" then
                    exception:raise("core.uploadFailed", "Read temp file error!")
                end
            end
        end
    end
    if body then
        data.payload = body
    end

    ngx.ctx[Request] = data
    return ngx.ctx[Request]
end

--
-- @return table
local function getRequestData()
    return ngx.ctx[Request] or parseRequestData()
end

-- @return table
function Request:getPayload()
    return getRequestData().payload
end


-- @return table 动作[string 模块, string 方法]
function Request:getAction()
    return getRequestData().action
end

-- @param string key
-- @return string
function Request:getCookie(key)
    return getRequestData().cookies[key]
end

-- @param string key
-- @return string
function Request:getHeader(key)
    return getRequestData().headers[key]
end

-- @return number 带小数(毫秒)的时间戳
function Request:getTime()
    return getRequestData().time
end

-- @return string
function Request:getIp()
    return getRequestData().ip
end

-- @return boolean
function Request:isLocal()
    return getRequestData().ip == ngx.var.server_addr
end


-- @param string name    键名
-- @param boolean abs     是否取绝对值
-- @param boolean nonzero 是否不允许为零
-- @return number 参数值
function Request:getNumParam(name, abs, nonzero)
    local param = getRequestData().params[name]
    local value = util:numval(param, abs)

    if nonzero and value == 0 then
        exception:raise("core.badParams", { name = name, value = param })
    end

    return value
end

-- @param string name     键名
-- @param boolean nonempty 是否不允许为空
-- @param boolean trim     是否去除首尾空格
-- @return string 参数值
function Request:getStrParam(name, nonempty, trim)
    local param = getRequestData().params[name]
    local value = param or ""

    if trim and value ~= "" then
        value = util.string:trim(value)
    end

    if nonempty and value == "" then
        exception:raise("core.badParams", { name = name, value = param })
    end

    return value
end


-- @return table
function Request:getArgsTbl()
    return getRequestData().params
end



return Request
