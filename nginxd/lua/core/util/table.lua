local exception = loadMod("core.exception")

local function checkTable(t)
    if type(t) ~= "table" then
        exception:raise("core.badParams", { t = t })
    end
end

local Table = {}


-- @param table t 
-- @return number 
function Table:length(t)
    checkTable(t)

    local length = 0

    for _ in pairs(t) do
        length = length + 1
    end

    return length
end


function Table:merge(t, t1)
    checkTable(t)
    checkTable(t1)

    for k, v in pairs(t1) do
        t[k] = v
    end

    return t
end


--- 将表连接到Array模式源表尾部
--
-- @param table t 源表
-- @param table t1 待连接表
-- @return table 连接后的表
function Table:concat(t, t1)
    checkTable(t)
    checkTable(t1)

    local length = #t

    for i, v in ipairs(t1) do
        t[length + i] = v
    end

    return t
end


--- 获取表中最大元素的键名和值
--- * 指定比较键名，则使用元素指定键名的值比较
--
-- @param table t 源表
-- @param mixed key 比较键名
-- @return mixed 最大元素键名
-- @return mixed 最大值
function Table:max(t, key)
    checkTable(t)

    local maxKey, maxValue

    for k, v in pairs(t) do
        local value = key and v[key] or v

        if not maxValue or value > maxValue then
            maxKey, maxValue = k, value
        end
    end

    return maxKey, maxValue
end

--- 获取表中最小元素的键名和值
--- * 指定比较键名，则使用元素指定键名的值比较
--
-- @param table t 源表
-- @param mixed key 比较键名
-- @return mixed 最小元素键名
-- @return mixed 最小值
function Table:min(t, key)
    checkTable(t)

    local minKey, minValue


    for k, v in pairs(t) do
        local value = key and v[key] or v

        if not minValue or value < minValue then
            minKey, minValue = k, value
        end
    end

    return minKey, minValue
end

--- 获取Array模式表中的随机元素的值
--
-- @param table t 源表
-- @return mixed 随机元素值
function Table:random(t)
    checkTable(t)

    return #t > 0 and t[math.random(1, #t)] or nil
end


--- 对表进行序列化
--
-- @param mixed t 表
-- @param string prefix 定义前缀
-- @param string indentStr 缩进字符
-- @param number indentLevel 缩进级别
-- @param table marks 已标记列表
-- @param table quotes 引用列表
-- @return string 定义字符串
-- @return table 引用列表
function Table:serialize(t, prefix, indentStr, indentLevel, marks, quotes)
    checkTable(t)

    marks = marks or {}
    quotes = quotes or {}
    marks[t] = prefix

    local items = {}
    local equal, brace, backbrace, comma = "=", "{", "}", ","

    if indentStr then
        local space = indentStr:rep(indentLevel)
        local preSpace = indentLevel > 1 and indentStr:rep(indentLevel - 1) or ""

        equal, brace, backbrace, comma = " = ", "{\n" .. space, "\n" .. preSpace .. "}", ",\n" .. space
    end

    for key, value in pairs(t) do
        local kType = type(key)
        local name

        if kType == "string" then
            name = "[" .. string.format("%q", key) .. "]"
        elseif kType == "number" or kType == "boolean" then
            name = "[" .. tostring(key) .. "]"
        end

        if name then
            local prefix = prefix .. name
            local vType = type(value)

            if vType == "table" then
                if marks[value] then
                    quotes[#quotes + 1] = prefix .. equal .. marks[value]
                else
                    items[#items + 1] = name .. equal .. (self:serialize(value, prefix, indentStr, indentLevel + 1, marks, quotes))
                end
            elseif vType == "string" then
                items[#items + 1] = name .. equal .. string.format('%q', value)
            elseif vType == "number" or vType == "boolean" then
                items[#items + 1] = name .. equal .. tostring(value)
            end
        end
    end

    return brace .. table.concat(items, comma) .. backbrace, quotes
end


--- 将表转化为可打印的字符串
--
-- @param table t 表
-- @param string indentStr 缩进字符
-- @param number indentLevel 缩进级别
-- @param table marks 已标记列表
-- @return string 可打印的字符串
function Table:toString(t, indentStr, indentLevel, marks)
    checkTable(t)

    indentStr = indentStr or "\t"
    indentLevel = indentLevel or 1
    marks = marks or {}

    local items = {}
    local tName = "<" .. tostring(t) .. ">"

    marks[t] = tName

    local space = indentStr:rep(indentLevel)
    local preSpace = indentLevel > 1 and indentStr:rep(indentLevel - 1) or ""

    for key, value in pairs(t) do
        local kType = type(key)
        local name

        if kType == "string" then
            name = string.format("%q", key)
        elseif kType == "number" or kType == "boolean" then
            name = tostring(key)
        else
            name = "<" .. tostring(key) .. ">"
        end

        local vType = type(value)

        if vType == "string" then
            items[#items + 1] = name .. " = " .. string.format('%q', value)
        elseif vType == "number" or vType == "boolean" then
            items[#items + 1] = name .. " = " .. tostring(value)
        elseif vType == "table" then
            if marks[value] then
                items[#items + 1] = name .. " = " .. marks[value]
            else
                items[#items + 1] = name .. " = " .. self:toString(value, indentStr, indentLevel + 1, marks)
            end
        else
            items[#items + 1] = name .. " = " .. "<" .. tostring(value) .. ">"
        end
    end

    return tName .. ":{\n" .. space .. table.concat(items, ",\n" .. space) .. "\n" .. preSpace .. "}"
end

function Table:filter(t, func)
    checkTable(t)

    for k, v in pairs(t) do
        func(t, k, v)
    end
end


function Table:copy(srcT, desT, keys)
    checkTable(srcT)
    desT = desT or {}
    checkTable(desT)

    if keys then
        for _, key in ipairs(keys) do
            desT[key] = srcT[key]
        end
    else
        for key, value in pairs(srcT) do
            desT[key] = value
        end
    end

    return desT
end

return Table
