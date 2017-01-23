--@ mongodb api base
local util = loadMod("core.util")
local exception = loadMod("core.exception")
local mongodb = loadMod("core.driver.mongodb")
local sysConf = loadMod("config.system")
--local IpAddr = loadMod("core.util.ipaddr")
local MongoEngine = {
}

local function isNullVal(val)
	return not val or val == ""
end

--@param col table
--@param qry table
--@return result table
function MongoEngine:getMul(col, qry)
    local result = mongodb:getMul(col, qry)
    return  result
end

function MongoEngine:getOne(col, qry)
    ngx.log(ngx.DEBUG , "************************* col :", col)
    ngx.log(ngx.DEBUG, "************************* qry: ", util:jsonEncode(qry))
    local result = mongodb:getOne(col, qry)
    ngx.log(ngx.DEBUG, "*************************  result : ", util:jsonEncode(result))
    return  result
end

function createDepMain(dep)
    local docs = {}
    local doc = {name = dep, parent="", desc = "top section"}
    table.insert(docs, doc)
    local result = mongodb:creat(dep, docs)
end
function MongoEngine:splitSectionCheckandInsert(dep, sec)
    
    local arrSec =  util:getSplictUTF8Arry(sec)
    ngx.log(ngx.DEBUG, "get section array is:", util:jsonEncode(arrSec))
    for i = 2, #arrSec do
        if next(self:getOne(dep, {name=arrSec[i]})) == nil then
            local docs = {}
            local parent = i==2 and dep or arrSec[i-1]
            table.insert(docs, {name=arrSec[i], parent= parent})
            mongodb:creat(dep, docs)
        end
    end
    return arrSec[#arrSec]
    
end
function MongoEngine:add(dep, sec, data)
    local docs = {}
    
    if next(self:getOne(dep, {name = dep})) == nil then
        createDepMain(dep)
    end
    local parent = self:splitSectionCheckandInsert(dep, sec)

    if next(self:getOne(dep, {link = data.link})) == nil then 
        if parent ~= nil then
            data.parent = parent
            table.insert(docs, data)
            local result = mongodb:creat(dep, docs)
        end
    end
    return {status=201, msg="creat successfully in database."}
end

function MongoEngine:delete(col, qry)
    ngx.log(ngx.DEBUG, "MongoEngine delete: ++++>  " , type(qry))
   
    --local rescol = mongodb:getMul(col, qry)

	--[[if rescol then
		for _, rec in ipairs(rescol) do
			local ret, err = self:fileRemove(module, rec)
			if not ret then
				ngx.log(ngx.ERR, "***** Device:delete sub m:", m," f :",f)
				return  { affected = 0, err}
			end
		end
	end--]]

    local result = mongodb:delete(col, qry)
    
    return {affected = 1}
end

function MongoEngine:update(col, qry, doc)
   
    local res = mongodb:getOne(col, qry)
    ngx.log(ngx.ERR, "***** update :",util:jsonEncode(qry))
    if next(res) == nil  then
        if (doc["_id"]== "single" ) then
            doc["_id"] = doc["key"];
            local docs = {}
            table.insert(docs, doc)
            mongodb:creat(col, docs)
            return {status=201, msg="create  successfully."}
        end
        return {msg = "Entry not found."}, 500
    end
    ngx.log(ngx.DEBUG, "doc = ", util:jsonEncode(doc))
    local result = mongodb:update(col, qry, doc)
    -- now the doc has been updated in mongodb successfully
    return {status=201, msg="update  successfully in database."}
end

function MongoEngine:fileUpload(col, pathName)
    return mongodb:fileUpload(col, pathName)
end

function MongoEngine:delFile(col, pathName)
    return mongodb:delFile(col, pathName)
end

-- @return string: file content
function MongoEngine:fileDownload(col, qry)
    local fileContent = mongodb:fileDownload(col, qry)
    return fileContent, {["Content-Disposition"] = string.format("attachment; filename=\"%s\";", qry.filename), ["Content-Type"] = "application/x-binary"}
end


-- @return string: file delete result
function MongoEngine:fileRemove(module, rec)

	local fileNameFields = {
		InstallLog = {'original', 'name'},
		AssignLog  = {'original', 'name'},
	}

	local fileds = fileNameFields[module]
	if not fileds then 
		return true
	elseif 'function' == type(fileds) then
		fileds = fileds(rec)
	end

	for _, fld in ipairs(fileds) do
		if rec[fld] then
			local ret, err = mongodb:delFile('fs', '/var/log/nginxd/upload/' .. rec[fld])
			if not ret then
				local errMsg = 'Failed to delete file: ' .. rec[fld] .. 'errMsg: ' .. util:toString(err)
				ngx.log(ngx.ERR, errMsg)
				return false, errMsg
			end
		end
	end

	return true
end

return MongoEngine
