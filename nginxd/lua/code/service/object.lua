local util = loadMod("core.util")
local exception = loadMod("core.exception")
local serviceBase = loadMod("core.base.service")
local sysConf = loadMod("config.system")
local refMap = loadMod("config.refMap")
local license = loadMod("config.license")
local decorator = loadMod("code.service.decorator")
local log =  util:getService("log")
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

function Object:licenseCheck()
    local licInfoSent = self.cacheHelper:get("licInfoSent")
    ngx.log(ngx.DEBUG, "licInfoSent -----> ", licInfoSent)
    if licInfoSent == 0 then
        local licInfo = license.get_lic_info()
        if licInfo == 2 then
            local regInfo  = self.dbmodule:getOne("LicenseInfo", {_id = "single"})
            local trialPrd = tonumber(regInfo.trialPrd)
            local now = ngx.time()
            local remains = math.floor((trialPrd-now)/(60*60*24))

            licInfoSent = self.cacheHelper:incr("licInfoSent", 1)
            ngx.log(ngx.DEBUG, "licInfoSent =====> ", licInfoSent)

            return {status = 500, msg =  "The Evaluation License will expire in " .. remains .. " days!" }
        end
    end
    return {status = 200}
end

function Object:getSpecialSubModule(module, subModule, _id)
    local qry = {["$and"]={
            {["subModule"] = subModule},
            {["parentID"] = _id}
        }}
    util:zeroBasedArray(qry)
    return self.dbmodule:getMul(module, qry)
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

function Object:getDeviceInfo(device)
    local deviceInfo = self.dbmodule:getOne("Devices", {_id = device})
    if not deviceInfo or not deviceInfo.ipAddress then
        ngx.log(ngx.ERR, "Device ", device, " not exist in database!")
    end
    return deviceInfo
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

function Object:getDeviceInterface(device)
    local result = {}
    local deviceInfo = self:getDeviceInfo(device)
    self:proxyPreProcess(device)
    local proxyApi = "/proxy/api/v1.0/System/Network/Interface"
    result = util:proxy(proxyApi, args, nil, ngx.HTTP_GET)
    if ngx.status < 300 then
        result = util:jsonDecode(result)
        deviceInfo["interface"] = result
        self:put("Devices", "", util:jsonEncode(deviceInfo), device, "", "")
    else
        ngx.status = 200
        result = deviceInfo["interface"]
    end
    return not result and {} or result
end

function Object:getVzoneInterface(objectsInterfaceModule, vzoneModule, vzoneName)

    local result = self.dbmodule:getMul(objectsInterfaceModule, {parentID = {["$exists"] = false}})
    local vzones = self.dbmodule:getMul(vzoneModule, {})
    if vzoneName then
        removeItemByName(vzones, vzoneName)
    end

    local vzoneItem = nil
    local interfaceName = nil
    for _, vzoneItem in ipairs(vzones) do
        for _, interfaceName in ipairs(vzoneItem["interface"]) do
            removeItemByName(result, interfaceName)
        end
    end
    return result
end

function Object:getSignatureViolationSubSig (module, qry)
    local subSigntures = self.dbmodule:getOne(module, qry)
    local result = {}
    if next(subSigntures) ~= nil then
        result = subSigntures["data"]
    end
    return result
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

function Object:get(module, args, _id, subModule, vdom, loginUser)
    local key, val, res
    if _id ~= "" and subModule == "" then
        exception:raise("core.badCall", {
            errMsg = "there should be subModule in your restfull API.",
        })
    end

    local col = refMap[module] or module
    local qry = _id == "" and {parentID = {["$exists"] = false}} or {parentID = _id}

    if args then
        for key, val in pairs(args) do
            if key ~= "module" and key ~= "subModule" and key ~= "id" and key ~= "subId" then
                qry[key] = val
            end
        end
    end

    res = self.dbmodule:getMul(col, qry)
 

    self:decorateResult(col, res, _id)
    return table.getn(res) == 0 and '[]' or res

end

function Object:post(module, args, jsonStr, _id, subModule, isFile)
    if not isFile and _id ~= "" and subModule == "" then
        exception:raise("core.badCall", {
            errMsg = "there should be subModule in your restfull API.",
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

	local doc = formData and formData or util:jsonDecode(jsonStr)

	local ret, errMsg = util:checkItemName(doc)
	if not ret then
		response:reply({msg = errMsg}, nil, 500)
    end

    local isSub = ""
    if _id == "" then
        doc._id = doc.name and doc.name or "single"  --default process move here
    else
        -- sub
        doc.parentID = _id
        isSub = "Sub"
    end

    if subModule ~= "" then
        if module == "HiddenFieldsRule" or module == "CSRFProtection" then 
            doc.subModule = subModule
        elseif module == "ObjectsInterface" then
            doc = self:setObjectsInterfaceSub(doc)
        end
    end

    if sysConf.spSubMods[subModule] == true then
        self.dbmodule:delete(module, {parentID = _id})
        doc.sp = 1
    end

    return self.dbmodule:add(module..isSub, doc)
end


function Object:put(module, args, jsonStr, _id, subModule, subId, vdom)
    local result = nil
    if _id == "" then
        exception:raise("core.badCall", {
            errMsg = "there should be id in your restfull API.",
        })
    elseif subModule ~= "" and subId == "" then
        exception:raise("core.badCall", {
            errMsg = "there should be subID in your restfull API.",
        })
    end
    local newDoc = util:jsonDecode(jsonStr)

    local qry = {_id = subId == "" and _id or util:str2objID(subId)}
    local col =  module
    if subId ~= "" then
        newDoc._id = nil
        newDoc.parentID = _id
        col = col.."Sub"
    end

    return self:update(col, qry, newDoc)
end

function Object:delete(module, args, jsonStr, _id, subModule, subId, vdom)
    if _id == ""  then
        exception:raise("core.badCall", {
            errMsg = "there should be id in your restfull API.",
        })
    elseif subModule ~= "" and subId == "" then
        exception:raise("core.badCall", {
            errMsg = "there should be subID in your restfull API.",
        })
    end

    ngx.log(ngx.DEBUG, "delete starting ...", module)

    
    local qry = nil
    local col =  module
    local deleteItem = nil
    if subModule == "" then
        qry = {["$or"]={
            {["name"] = _id},
            {["parentID"] = _id}
        }}
        util:zeroBasedArray(qry)

        deleteItem = self.dbmodule:getOne(module, {_id = _id})
        if deleteItem and deleteItem.ref and deleteItem.ref ~= 0 then
            ngx.exit(ngx.HTTP_NOT_ALLOWED)
        end
    else
        qry = {_id = util:str2objID(subId)}
        deleteItem = self.dbmodule:getOne(module, qry)
        if deleteItem and deleteItem.ref and deleteItem.ref ~= 0 then
            ngx.exit(ngx.HTTP_NOT_ALLOWED)
        end
        
        col = col.."Sub"
    end

    return  self.dbmodule:delete(col, qry)
end


return serviceBase:inherit(Object):init()
