--@ author: zhouxuehao
--@ date: 2015-4-7
--@ response wrap utility
local json = require("cjson")
local util = loadMod("core.util")
local exception = loadMod("core.exception")
local request = loadMod("core.request")
local sysConf = loadMod("config.system")

local Response = {
}

--- Response模块初始化
--
-- @return table Response模块
function Response:init()
    return self
end

-- @param jsonStr message 消息
function Response:output(message, header, status)
    if util:isTable(message) then
        message = util:jsonEncode(message)
    end
    
    ngx.header.content_type = header and header["Content-Type"] or "application/json"
    ngx.header.content_length = header and header["Content-Length"] or message:len() + 1
    if header and header["Content-Disposition"] then
        ngx.header["Content-Disposition"] = header["Content-Disposition"]
    end

    if status then
        ngx.status = status
    end

    ngx.say(message)
    ngx.eof()
    ngx.exit(status and status or 200)
end

-- @param String: data 消息
function Response:reply(data, header, status)
    self:output(data, header, status)
end

-- @param table|string err 错误
function Response:error(err)
    if util:isString(err) then
        err = exception:pack("core.systemErr", { msg = err })
    end

    err.data = err.data or {}

    err.error = err.error or "core.systemErr"

    ngx.status = 500

    local errMsg = util:strval(err.error)
    errMsg = errMsg .. util:toString(err.data, '\t', 1)
    ngx.log(ngx.ERR, errMsg)

    self:output(err.data)
end


return Response:init()

