--@ author: zhouxuehao
--@ date: 2015-4-7
--@ exception module

local sysConf = loadMod("config.system")
local errCode = loadMod("config.error")

local Exception = {}

-- @param string code 错误代码
-- @return string 错误代码
-- @return string 错误说明
function Exception:checkCode(code)
    local pos = code:find("%.")

    if pos then
        local m, s = code:sub(1, pos - 1), code:sub(pos + 1)

        if errCode[m] and errCode[m][s] then
            return code, errCode[m][s]
        end
    end

    return "core.unknowErr", errCode["core"]["unknowErr"]
end

-- @param string code 错误代码
-- @param table data 错误数据(可省略)
-- @return table 错误信息
function Exception:pack(code, data)
    local realCode, desc = self:checkCode(code)
    local err = { error = realCode, data = data }

    if sysConf.DEBUG_MODE then
        local traceback = {}
        local index = -3

        for line in debug.traceback():gmatch("%s*([^\n]+)") do
            if index >= 0 then
                traceback[#traceback + 1] = line
            end

            index = index + 1
        end

        err.errInfo = { traceback = traceback, desc = desc }
    end

    return err
end

-- @param string code 错误代码
-- @param table data 错误数据(可省略)
function Exception:raise(code, data)
    error(self:pack(code, data), 2)
end

-- @param string code 错误代码
-- @param table data 错误数据
-- @param mixed status 执行状态
-- @param mixed err 执行错误
-- @return mixed 执行状态
-- @return mixed 执行错误
function Exception:assert(code, data, status, err)
    data = data or {}

    if status then
        return status, err
    end

    data.msg = err
    error(self:pack(code, data), 2)
end

return Exception
