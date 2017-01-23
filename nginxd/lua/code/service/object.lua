local util = loadMod("core.util")
local exception = loadMod("core.exception")
local serviceBase = loadMod("core.base.service")
---local sysConf = loadMod("config.system")
--local decorator = loadMod("code.service.decorator")
--local log =  util:getService("log")
local response = loadMod("core.response")

local Object = {
    DBACC_NAME = "dbEngine",
    CACHE_HELPER = ngx.shared.cache,
}

function Object:getUniqueID(module)
    local uniqueID = 1
    local namePrefix = sysConf.ProxyModule[module].namePrefix
    while (1) do
        if next(self.dbmodule:getOne(module, {_id = namePrefix .. uniqueID})) == nil then
            break;
        end
        uniqueID = uniqueID + 1
    end
    return uniqueID
end

local function mixPwd(passwd)
    return util.string:sha1(passwd .. sysConf.PASSWD_MIX_KEY)
end

function Object:fileUpload()
    local pathName, fileName, formData = util:fileUpload()
    return {status = 200, file_name = fileName}, formData
end

function Object:getMergeTable (subMod1, subMod2, qry)
    local mergeResult = self.dbmodule:getMul(subMod1, qry)
    local subResult = self.dbmodule:getMul(subMod2, qry)
    for i, v in ipairs(subResult) do
        table.insert(mergeResult, v)
    end
    return mergeResult
end

function Object:getSubTable(module, nameKey)
    local qry = {parentID = {["$exists"] = true}}
    local result = self.dbmodule:getMul(module, qry)
    for i = 1, #result do
        result[i]["name"] = result[i][nameKey]
    end
    return result
end


function removeItemByName(items, name)
    local index = nil
    local item = nil
    for index, item in ipairs(items) do
        if item["name"] == name then
            table.remove(items, index)
        end
    end
end

function Object:proxyPreProcess(device)
    local deviceInfo = self:getDeviceInfo(device)
    local cookies = ngx.req.get_headers()["Cookie"]
    if cookies then
        ngx.req.set_header("Cookie", "remoteIP=" .. deviceInfo.ipAddress .. "; " .. cookies)
    else
        ngx.req.set_header("Cookie", "remoteIP=" .. deviceInfo.ipAddress .. ";")
    end
    ngx.req.set_header("Authorization", util:base64Encode(deviceInfo.username .. ":" .. deviceInfo.password))
    return
end

function Object:decorateResult(module, resultTable, _id)
    if type(decorator[module]) == "function" then
        resultTable = decorator[module](resultTable)
    end
    if _id == "" and tableCountMap[module] then
        local singleResult = nil
        local countKey = tableCountMap[module]
        for _, singleResult in ipairs(resultTable) do
            singleResult[countKey] = table.getn(self.dbmodule:getMul(module, {parentID = singleResult._id}))
        end
    end
end
function valueIsValid(v)
    if v ~= nil and v ~= " " and v ~= ""then
        return true
	end
    return false
end
function isGetAllDeps(dep, depId, sec, secId, title, titleId)
    ngx.log(ngx.ERR, "isGetAllDeps dep:", dep)
    ngx.log(ngx.ERR, "isGetAllDeps depId:", depId)
    ngx.log(ngx.ERR, "isGetAllDeps sec:", sec)
 
    if valueIsValid(dep) and not valueIsValid(depId) and not valueIsValid(sec)
        and not valueIsValid(secId) and not valueIsValid(title) and not valueIsValid(titleId) then
        ngx.log(ngx.ERR, "isGetAllDeps true")
        return true
    end
    ngx.log(ngx.ERR, "isGetAllDeps false")
    return false
end
function isGetSepecDep(dep, depId, sec, secId, title, titleId)
    if valueIsValid(dep) and valueIsValid(depId) and not valueIsValid(sec)
        and not valueIsValid(secId) and not valueIsValid(title) and not valueIsValid(titleId) then
        return true
    end
    return false
end
function isGetAllSecs(dep, depId, sec, secId, title, titleId)
    if valueIsValid(dep) and valueIsValid(depId) and valueIsValid(sec) and not valueIsValid(secId) and not valueIsValid(title) 
        and not valueIsValid(titleId) then
        return true
    end
    return false
end
function isGetSepecSec(dep, depId, sec, secId, title, titleId)
    if valueIsValid(dep) and valueIsValid(depId) and valueIsValid(sec) and valueIsValid(secId) and not valueIsValid(title) and not valueIsValid(titleId) then
        return true
    end
    return false
end
function isGetSepecSec(dep, depId, sec, secId, title, titleId)
    if valueIsValid(dep) and valueIsValid(depId) and valueIsValid(sec) and valueIsValid(secId) and not valueIsValid(title) and not valueIsValid(titleId) then
        return true
    end
    return false
end
function isGetAllDocs(dep, depId, sec, secId, title, titleId)
    if valueIsValid(dep) and valueIsValid(depId) and valueIsValid(sec) and valueIsValid(secId) and valueIsValid(title) and not valueIsValid(titleId) then
        return true
    end
    return false
end
function isGetSepecDoc(dep, depId, sec, secId, title, titleId)
    if valueIsValid(dep) and valueIsValid(depId) and valueIsValid(sec) and valueIsValid(secId) and valueIsValid(title) and valueIsValid(titleId) then
        return true
    end
    return false
end

function getAllDeps(dep)
    return "GovDepartment",  {key = {["$ne"] = ""}}
end
function getSepecDep(dep, depId)
    return "GovDepartment", {_id = depId}
end
function getAllSecs(depId)
    return depId, {section = {["$exists"] = true}}
end
function getSepecSec(depId, secId)
    return depId, {_id = secId}
end
function getSecAllDocs(depId, secId)
    local res = self:getOne(depId, {_id= secId})
    if next(res) then
        return depId, {parent = res["section"]}
    else
        ngx.log(ngx.ERR, "error happened for secId:", secId)
        return depId, {} 
    end
end
function getSecDoc(depId, secId, titleId)
    local res = self:getOne(depId, {_id= secId})
    if next(res) then
        return depId, {_id = titleId}
    else
        ngx.log(ngx.ERR, "error happened for secId:", secId)
        return depId, {} 
    end
end 
function getWhichOperate(dep, depId, sec, secId, title, titleId )
    ngx.log(ngx.ERR, "getWhichOperate:", dep)
    ngx.log(ngx.ERR, "getWhichOperate:", depId)
    ngx.log(ngx.ERR, "getWhichOperate:", sec)
    local col, qry = nil, nil
    if isGetAllDeps(dep, depId, sec, secId, title, titleId) then
        col, qry = getAllDeps(dep)
        util:zeroBasedArray(qry)
        ngx.log(ngx.DEBUG, "get qry:", util:jsonEncode(qry))
    elseif isGetSepecDep(dep, depId, sec, secId, title, titleId) then
        col, qry = getSepecDep(dep, depId)
    elseif isGetAllSecs(dep, depId, sec, secId, title, titleId) then
        col, qry = getAllSecs(depId)
    elseif isGetSepecSec(dep, depId, sec, secId, title, titleId) then
        col, qry = getSepecSec(depId, secId)

    elseif isGetAllDocs(dep, depId, sec, secId, title, titleId) then
        col, qry = getSecAllDocs(depId, secId)
    elseif isGetSepecDoc(dep, depId, sec, secId, title, titleId) then
        col, qry = getSecDoc(depId, secId, titleId)
    else
        ngx.log(ngx.ERR, "get error in object conditions")
    end
    return col, qry
end

function Object:get(dep, depId, sec, secId, title, titleId, isFile)
    local col, qry, res
    ngx.log(ngx.DEBUG, "get dep", dep)  
    col, qry = getWhichOperate(dep, depId, sec, secId, title, titleId)

    res = self.dbmodule:getMul(col, qry)
    --self:decorateResult(col, res, _id)
    return table.getn(res) == 0 and '[]' or res

end
--(jsonObj.mkey, jsonObj.subKey, args, jsonObj.data, isFile)
function Object:post(dep, sec, args, data, isFile) --only for restAPI
    if not isFile and(dep == "" or data == nil )  then
        exception:raise("core.badCall", {
            errMsg = "there should be specific dep in your restfull API.",
        })
    end

	local formData = nil
    if isFile then
		local ret, formData1 = self:fileUpload()
		if sysConf.DirectUploadFile[module] then
			formData = formData1
		else
			return ret
		end
    end
	--local ret, errMsg = util:checkItemName(data)
    return self.dbmodule:add(dep, sec, data)
end
function Object:put(dep, depId, sec, secId, title, titleId, jsonStr)
    local col, qry
    if valueIsValid(depId) and valueIsValid(secId) and valueIsValid(titleId) then
        ngx.log(ngx.ERROR, "get error in object put")
        return {msg = "Invalid update operate."}, 500
    end
    col, qry = getWhichOperate(dep, depId, sec, secId, title, titleId)

    return self:update(col, qry, util:jsonDecode(jsonStr))

end

function Object:delete(dep, depId, sec, secId, title, titleId)
    
    if valueIsValid(depId) and valueIsValid(secId) and valueIsValid(titleId) then
        ngx.log(ngx.ERROR, "get error in object put")
        return {msg = "Invalid delete operate."}, 500
    end
    local col, qry = getWhichOperate(dep, depId, sec, secId, title, titleId)
    ngx.log(ngx.DEBUG, "delete object", util:jsonEncode(qry))
    return  self.dbmodule:delete(col, qry)
end


return serviceBase:inherit(Object):init()
