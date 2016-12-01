--@ author: zhouxuehao
--@ date: 2015-4-7
--@ response wrap utility
--
local json = require("cjson")
local ObjectID = require "resty.mongol.object_id"
local upload = require "resty.upload"
local exception = loadMod("core.exception")
local serviceBase = loadMod("core.base.service")
local sysConf = loadMod("config.system")

local Util = {
    table = loadMod("core.util.table"),
    string = loadMod("core.util.string"),
}

function Util:isTable(value)
    return type(value) == "table"
end
function Util:isString(value)
    return type(value) == "string"
end

function Util:isNumber(value)
    return type(value) == "number"
end

function Util:isBoolean(value)
    return type(value) == "boolean"
end

function Util:localTime()
    return ngx.localtime()
end
function Util:splitStr(str, token) --should put it in string file
    local t, i, j = {}, 1, 1
    if str == nil then
        return t
    end
    local len = string.len(str)
    while true do
        j = string.find(str, token, i)
        if j ~= nil then
            local s = string.sub(str, i, j-1)
            table.insert(t, s)
            i = j + 1
        else
            if i ~= len then
                local s = string.sub(str, i, -1)
                table.insert(t, s)   
            end
            break
        end
    end
    return t
end
-- @param mixed value 任意类型的值
-- @param boolean forSql 是否需要SQL转义(转义关键字符并在两端加单引号)
-- @return string 转化后的字符串
function Util:strval(value, forSql)
    local str = ""

    if value then
        str = self:isTable(value) and json.encode(value) or tostring(value)
    end

    if forSql then
        return ngx.quote_sql_str(str)
    end

    return str
end

-- @param mixed value 任意类型的值
-- @param boolean abs 是否取绝对值
-- @return number 转化后的数字
function Util:numval(value, abs)
    local num = 0

    if value then
        num = tonumber(value) or 0
    end

    if num ~= 0 and abs then
        num = math.abs(num)
    end

    return num
end


-- @param string jsonStr JSON字符串
-- @return mixed 解码数据
function Util:jsonDecode(jsonStr)
    local ok, data = pcall(json.decode, jsonStr)
    return ok and data or nil
end

function Util:jsonEncode(obj)
    local ok, jsonStr = pcall(json.encode, obj)
    return ok and jsonStr or nil
end


-- @param table data 数据
-- @param string indentStr 缩进字符
-- @param number indentLevel 缩进级别
-- @return string 可打印的字符串
function Util:toString(data, indentStr, indentLevel)
    local dataType = type(data)

    if dataType == "string" then
        return string.format('%q', data)
    elseif dataType == "number" or dataType == "boolean" then
        return tostring(data)
    elseif dataType == "table" then
        return self.table:toString(data, indentStr or "\t", indentLevel or 1)
    else
        return "<" .. tostring(data) .. ">"
    end
end


-- @param table module 模块
-- @param table parent 父模块
-- @return table 模块(第一个参数)
function Util:inherit(module, parent)
    module.__super = parent
    return setmetatable(module, { __index = parent })
end


-- @param string name 业务逻辑模块名
-- @return table 业务逻辑模块
function Util:getService(name)
    local path = "code.service." .. name
    local ok, service = pcall(loadMod, path)

    if not ok then
        -- 直接获取数据访问业务逻辑模块
        ngx.log(ngx.ERR, "Not OK Path: ", path)
        service = serviceBase:inherit({ DBACC_NAME = name }):init()
        saveMod(path, service)
    end

    return service
end

--@ resturn jsonStr from restApi server
function Util:proxy(uri, args, postData, headers, method)
    local params = type(args) == "table" and {args = args, method = method, headers = headers} or {method = method, headers = headers}
    uri = type(args) == "string" and uri .. "?" ..  args or uri
    if postData then
        if self:isTable(postData) then
            params.body = self:jsonEncode(postData)
        else
            params.body = tostring(postData)
        end
    end
    ngx.log(ngx.DEBUG, "set header:", self:jsonEncode(ngx.req.headers))
    --setProxyHeader(headers)
    local res = ngx.location.capture(uri, params)
    ngx.status = res.status
    
    return res.body, res.header
end


-- @param string file 文件路径
-- @return boolen 是否存在
function Util:isFile(file)
    local fd = io.open(file, "r")

    if fd then
        fd:close()
        return true
    end

    return false
end

function Util:getFileName(res)
    local fileName = ngx.re.match(res,'(.+)filename="(.+)"(.*)')
    if fileName then
        return fileName[2]
    end
end

function Util:getDataName(res)
    local dataName = ngx.re.match(res,'(.+) name="(.+)"(.*)')
    if dataName then
        return dataName[2]
    end
end

-- @return string pathName
function Util:fileUpload()
    local pathName, fileName, fd, dataName
    local formData = {}
    local form, err = upload:new(sysConf.FILEBLOCK)
    if not form then
        exception:raise("core.uploadFailed", { message=err,})
    end

    while true do
        local typ, res, err = form:read()

        if not typ then
            exception:raise("core.readDataFailed", { message=err,})
        end

        if typ == "header" then
            if res[1] ~= "Content-Type" then
                fileName = self:getFileName(res[2])
                dataName = self:getDataName(res[2])
                if fileName then
                    pathName = sysConf.FILE_UPLOAD_DIR .. fileName
                    os.execute("mkdir -p " .. sysConf.FILE_UPLOAD_DIR)
                    fd = io.open(pathName, "w+")

                    if not fd then
                        exception:raise("core.cantOpenFile", {file = fileName})
                    end
                end
            end

        elseif typ == "body" then

            if fd then
                fd:write(res)
            elseif dataName then
                formData[dataName] = res
                dataName = nil
            end

        elseif typ == "part_end" then
            if fd then
                fd:close()
                fd = nil
            elseif dataName then
                dataName = nil
            end

        elseif typ == "eof" then
            break

        else
            -- do nothing
        end
    end
    return pathName, fileName, formData
end

-- @param table data 数据
-- @param string prefix 描述前缀
-- @param string logFile 日志文件路径
function Util:logData(data, prefix, logFile)
    self:writeFile(logFile or "/tmp/lua.log", (prefix or "") .. self:toString(data) .. "\n", true)
end

-- @param string file 文件路径
-- @param string content 内容
-- @param string append 追加模式(否则为覆盖模式)
function Util:writeFile(file, content, append)
    local fd = exception:assert("core.cantOpenFile", { file = file }, io.open(file, append and "a+" or "w+"))
    local result, err = fd:write(content)
    fd:close()

    if not result then
        exception:raise("core.cantReadFile", { file = file , errMsg = err})
    end
end

function Util:isFile(file)
    local fd = io.open(file, "r")

    if fd then
        fd:close()
        return true
    end

    return false
end

-- @param string file 文件路径
-- @return string 文件内容
function Util:readFile(file)
    local fd = exception:assert("core.cantOpenFile", { file = file }, io.open(file, "r"))
    local result = fd:read("*a")
    fd:close()

    if not result then
        exception:raise("core.cantReadFile", { file = file })
    end

    return result
end


function Util:hex2string(hex)
    local str, n = hex:gsub("(%x%x)[ ]?", function (word)
        return string.char(tonumber(word, 16))
    end)
    return str
end

function Util:str2objID(hexStr)
    local str = self:hex2string(hexStr)
    return ObjectID.new(str)
end


function Util:objID2str(objID)
    return objID:tostring()
end


function Util:zeroBasedArray( t )
    for idx, value in pairs(t) do

        -- if value is table, keep on checking nested..
        if type(value) == "table" then
            self:zeroBasedArray( value )
        end

        -- once nested is fixed, check whether this is an array.
        -- if it's is, fix it.
        if type(idx) == "number" then
            -- array
            t[idx-1] = value

            t[idx]=nil

        end
    end
end


function Util:base64Encode(str)
    return ngx.encode_base64(str)
end

function Util:base64Decode(str)
    return ngx.decode_base64(str)
end

-- launch a http file upload  request to the upstream
local gen_boundary = function()
    local t = {"BOUNDARY-"}
    for i=2,17 do t[i] = string.char(math.random(65, 90)) end
    t[18] = "-BOUNDARY"
    return table.concat(t)
end


local multFormEncode = function(t, boundary)
  local str = "--" .. boundary .. "\r\n"
  str = str .. 'Content-Disposition: form-data; name="' .. t["name"] .. '"; filename="' .. t["name"] .. '"\r\n';
  str = str .. "Content-Type:  text/plain\r\n\r\n"
  str = str .. t["data"] .. "\r\n"
  str = str .. "--" .. boundary .. "\r\n"

  return str
end


function Util:multipartPost(uri, args, postData, method)
    local boundary = gen_boundary()
    local multForm = multFormEncode({name = args.fileName, data = postData}, boundary)
    ngx.req.set_header("Content-Type", "multipart/form-data; boundary=" .. boundary)

    ngx.log(ngx.DEBUG, "URI: ", uri)
    local result, header = self:proxy(uri, args, multForm, method)
    ngx.log(ngx.DEBUG, "Proxy result : ", result)

    return result, header
end

function Util:multipartPostEx(uri, args, files, method)
    local boundary = gen_boundary()
	local fileForms = ''

	for _, fileInfo in pairs(files) do
		local multForm = multFormEncode({name = fileInfo.name, data = fileInfo.content}, boundary)
		fileForms = fileForms .. multForm
	end

    ngx.req.set_header("Content-Type", "multipart/form-data; boundary=" .. boundary)

    local result, header = self:proxy(uri, args, fileForms, method)
	result = self:jsonDecode(result)

    return result.status, result.msg, header
end


local function asciiStr(str)
    local converted = {} 
    local i = 0
    while i < string.len(str) do
        i = i + 1
        converted[i] = string.byte(str, i)
    end
    return table.concat(converted, "#")
end

function Util:subStrIndex(hay, needle)
    return string.find(asciiStr(hay), asciiStr(needle)) 
end

local function containsBadChars(str)
	local badChars = '<>#()\"\''
	local i = 0
	while i < string.len(str) do
		i = i + 1
		local j = 0
		while j < string.len(badChars) do
			j = j + 1
			if string.byte(str, i) == string.byte(badChars, j) then
				return true 
			end
		end
	end
	return false
end

function Util:checkItemName(item)
	if nil == item.name then
		return true
	elseif item.name == "" then
		return false, 'Name is required.'
	elseif containsBadChars(item.name) then
		return false, 'The following characters are not allowed: < > ( ) # \" \''
	else
		return true
	end
end


return Util
