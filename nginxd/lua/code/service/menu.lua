--@ author: qxyang
--@ date: 2015-4-16
--@ service logic module

local util = loadMod("core.util")
local exception = loadMod("core.exception")
local serviceBase = loadMod("core.base.service")
local sysConf = loadMod("config.system")
local license = loadMod("config.license")
local utilTable = loadMod("core.util.table")
local refMap = loadMod("config.refMap")
local decorator = loadMod("code.service.decorator")
local defaultTemplateSub = loadMod("config.defaultTemplateSub")
local Menu = {
    DBACC_NAME = "device",
}

function Menu:checkLicenseLimit(module)
    local licenseLimit = license.get_lic_info()
    --The device limitation for evaluation is 10 
    if licenseLimit == 2 then
        licenseLimit = 10
    end
    local deviceCount  = table.getn(self.dbmodule:getMul(module, {}))

    if deviceCount >= licenseLimit then
        ngx.log(ngx.DEBUG, "gate count reaches the max number ===>\n")
        return {status = 500, msg = "Gateway exceed max license limit [ " .. licenseLimit .. " ]"}
    else
        return {status = 200, msg = "Gateway remains number[ " .. licenseLimit - deviceCount .. " ]"}
    end
end

function insertDeviceMenuItem(groupsMenu, deviceMenu)
    local groupItem = nil
    for _, groupItem in ipairs(groupsMenu) do
        if groupItem["val"] == deviceMenu["group"] or groupItem["val"] == sysConf.DEFAULT_GROUP then
            groupItem["childNumber"] = groupItem["childNumber"] + 1
            groupItem["can_delete"] = false
            table.insert(groupItem["children"], deviceMenu)
        end       
    end
end

function constructDevicesMenu(groups, devices)
    local resultMenu = nil
    local menuItem = nil
    local groupItem = nil
    local deviceItem = nil
    resultMenu = utilTable:copy(sysConf.DEFAULT_DEVICES_GROUPS_MENU)
    for _, groupItem in ipairs(groups) do
        if groupItem["name"] then
            menuItem = utilTable:copy(sysConf.GROUP_MANAGER_ITEM)
            menuItem["val"] = groupItem["name"]
            menuItem["group"] = groupItem["name"]
            menuItem["module"] = sysConf.GROUPS_MENU_DIR .. groupItem["name"]
            menuItem["childNumber"] = "0"
            menuItem["children"] = {} 
            table.insert(resultMenu["children"], menuItem)
            menuItem = nil
        end
    end
    for _, deviceItem in ipairs(devices) do
        if deviceItem["name"] then
            menuItem = utilTable:copy(sysConf.DEVICE_MANAGER_ITEM)
            menuItem["val"] = deviceItem["name"]
            menuItem["group"] = deviceItem["groups"]
            menuItem["module"] = sysConf.DEVICES_MENU_DIR .. deviceItem["name"]
            insertDeviceMenuItem(resultMenu["children"], menuItem)
            menuItem = nil
        end
    end
    return resultMenu
end

function constructTemplatesMenu(templates)
    local resultMenu = nil
    local systemTemplate = nil
    local menuItem = nil
    local templateItem = nil
    resultMenu = utilTable:copy(sysConf.DEFAULT_PROVISIONING_TEMPLATES_MENU)
    if resultMenu and resultMenu["children"] and resultMenu["children"][1] then
        systemTemplate = resultMenu["children"][1]
    end

    for _, templateItem in ipairs(templates) do
        if templateItem["name"] then
            menuItem = utilTable:copy(sysConf.PORVISION_TEMPLATES_ITEM)
            if templateItem["name"] == "default" then
                menuItem["can_delete"] = false
                menuItem["can_edit"] = false
                menuItem["can_assign"] = true
            end
            menuItem["val"] = templateItem["name"]
            menuItem["module"] = sysConf.PROVISION_TEMPLATES_DIR .. templateItem["name"]
            table.insert(systemTemplate["children"], menuItem)
            menuItem = nil
        end
    end
    return resultMenu
end

function constructPackageMenu(policyPackages)
    local resultMenu = nil
    local menuItem = nil
    local packageItem = nil
    resultMenu = utilTable:copy(sysConf.DEFAULT_POLICY_PACKAGE_MENU)

    for _, packageItem in ipairs(policyPackages) do
        if packageItem["name"] then
            menuItem = utilTable:copy(sysConf.POLICY_PACKAGE_ITEM)
            menuItem["val"]    = packageItem["name"]
            menuItem["mode"]   = packageItem["mode"]
            menuItem["module"] = sysConf.POLICY_PACKAGE_DIR .. packageItem["name"]
            table.insert(resultMenu[1]["children"], menuItem)
            menuItem = nil
        end
    end
    return resultMenu
end

function Menu:getMenu(module, args, _id, subModule)
    ngx.log(ngx.DEBUG, "service.Menu.get starting ============== ")
    local resultMenu = {}
    local qry = {parentID = {["$exists"] = false}}
    if args.type == "Objects" then
        resultMenu = self.dbmodule:getOne("menus", {_id = menuId})
        resultMenu = resultMenu.menu
    elseif args.type == "Devices" then
        local subMenu = nil
        local groups = self.dbmodule:getMul("DevicesGroups", qry)
        local devices = self.dbmodule:getMul("Devices", qry)
        subMenu = constructDevicesMenu(groups, devices)
        table.insert(resultMenu, subMenu)

        local templates = self.dbmodule:getMul("SystemTemplates", qry)
        subMenu = constructTemplatesMenu(templates)
        table.insert(resultMenu, subMenu)
    elseif args.type == "PolicyPackageMenu" then
        local policyPackages = self.dbmodule:getMul("PolicyPackage", qry)
        resultMenu = constructPackageMenu(policyPackages)
    end   
    return resultMenu
end

function Menu:decorateResult(module, resultTable)
    if type(decorator[module]) == "function" then
        resultTable = decorator[module](resultTable)
    end
end

function Menu:get(module, args, _id, subModule, _subId)
    if module == "Menu" then
        return self:getMenu(module, args, _id, subModule)
    end

    local col = refMap[module] or module
    local qry = {}
    local mulFlag = false
    if _id == "" then
        qry = {parentID = {["$exists"] = false}} 
        mulFlag = true
    elseif _id ~= "" and subModule == "" then
        qry = {_id = _id}
    elseif _subId == "" then
        qry = {parentID = _id}
        mulFlag = true
    elseif _subId ~= "" then
        if module == "SystemTemplates" then
            qry = {["$and"]={
                {["name"] = _subId},
                {parentID = _id}
            }}
            util:zeroBasedArray(qry)
        else
            if args ~=nil and args["ssubmodue"] =='RoutingPolicy' then
                ngx.log(ngx.DEBUG, "Menu:get=====>args: ", util:jsonEncode(args))
                ngx.log(ngx.DEBUG, "Menu:get=====>args['ssubmodue']: ", args['ssubmodue'])
                _id = _id..'#'.._subId
                mulFlag = true
                args = nil
                qry = {parentID = _id} 
            else
                 qry = {_id = util:str2objID(_subId)} --default process
                 ngx.log(ngx.DEBUG, "Menu:get=====>query: ", subModule)
                
            end
        end
    end

    if args then
        local key, val
        for key, val in pairs(args) do
            if key ~= "module" and key ~= "subModule" and key ~= "id" and key ~= "subId" then
                qry[key] = val
            end
        end
    end

    local result = nil
    if mulFlag == true then
        result = self.dbmodule:getMul(col, qry)
    else
        result = self.dbmodule:getOne(col, qry)
        if result._id and not util:isString(result._id) then
            result._id = util:objID2str(result._id)
        end
    end

    self:decorateResult(col, result)
    return result
end
function Menu:httpRoutingCheck(_id, doc)
    local qry = {parentID = _id}
    local result = self.dbmodule:getMul('PolicyPackage', qry)
    for _, res in ipairs(result) do
        if res["httpContentRoutingPolicyName"] ~= '' and doc["httpContentRoutingPolicyName"] == res['httpContentRoutingPolicyName'] then
            return {status = 500, msg = "A duplicate entry already exists."}
        end 
        if res["default"] == 'Yes' and doc["default"] == 'Yes' then
            return {status = 500, msg = "There are too many default HTTP content routing rule."}
        end  
    end
    return {status = 200}
end
function Menu:post(module, args, jsonStr, _id, subModule,subId)
    if _id ~= "" and subModule == "" then
        exception:raise("core.badCall", {
            errMsg = "there should be subModule in your restfull API.",
            hint = "/PolicyObject/User/UserGroup/module/id/subModule",
        })
    end

    local doc = util:jsonDecode(jsonStr)
    local sub =''
    if _id == "" then
        doc._id = doc.name and doc.name or "single"
    else
        if args ~=nil and args["ssubmodue"] =='RoutingPolicy' then
            ngx.log(ngx.DEBUG, "Menu:post=====>args: ", util:jsonEncode(args))
            ngx.log(ngx.DEBUG, "Menu:post=====>args['ssubmodue']: ", args['ssubmodue'])
            _id = _id..'#'..subId
            sub = 'Sub'
            local res = self:httpRoutingCheck(_id, doc)
            if  res.status ~= 200 then
                return res   
            end
        end
        ngx.log(ngx.DEBUG, "Menu:post=====>_id: ",_id)
        doc.parentID = _id
    end

    local col = module
    if module == "Devices" then
        local res = self:checkLicenseLimit(module)
        if res.status ~= 200 then
            return res, 500
        end
    end
    
    local result, status = self.dbmodule:add(col..sub, doc)
    if status == 500 then
        return result, status
    end
	if module == "SystemTemplates" and subModule == "" and result.status == 201 then
		sub = 'Sub'
		local key = nil
		local content = {}
		for key, content in pairs(defaultTemplateSub) do
			content.parentID = doc._id
			content.name = key
			ngx.log(ngx.DEBUG, "Menu:post=====>SystemTemplates, content: ", util:jsonEncode(content))
			result = self.dbmodule:add(col..sub, content)
		end
	end
	
	return result
end
function Menu:httpRoutingPutCheck(id, doc)
    local qry = {parentID = doc.parentID}
    local result = self.dbmodule:getMul('PolicyPackage', qry)
    for _, res in ipairs(result) do
        if res["_id"] ~= id then
            if res["httpContentRoutingPolicyName"] ~= '' and doc["httpContentRoutingPolicyName"] == res['httpContentRoutingPolicyName'] then
                return {status = 500, msg = "A duplicate entry already exists."}
            end 
            if res["default"] == 'Yes' and doc["default"] == 'Yes' then
                return {status = 500, msg = "There are too many default HTTP content routing rule."}
            end
        end   
    end
    return {status = 200}
end
function Menu:put(module, args, jsonStr, _id, subModule, subId)
    if _id == ""  then
        exception:raise("core.badCall", {
            errMsg = "there should be id in your restfull API.",
            hint = "/PolicyObject/User/UserGroup/module/id",
        })
    elseif subModule ~= "" and subId == "" then
        exception:raise("core.badCall", {
            errMsg = "there should be subID in your restfull API.",
            hint = "/PolicyObject/User/UserGroup/module/id/subModule/subID",
        })
    end

    local col = module
    local sub = ''
    local qry = {_id = subId == "" and _id or util:str2objID(subId)}
    local newDoc = util:jsonDecode(jsonStr)
    -- for the modules in SystemTemplates
    if subId ~= "" then
        newDoc._id = nil
        newDoc.parentID = _id
        if args ~=nil and args["ssubmodue"] =='RoutingPolicy' then
            ngx.log(ngx.DEBUG, "Menu:put=====>args: ", util:jsonEncode(args))
            ngx.log(ngx.DEBUG, "newDoc:put=====>args: ", util:jsonEncode(jsonStr))
            newDoc.parentID =  _id..'#'..subId
            subId = args["realId"]
            local res = self:httpRoutingPutCheck(subId, newDoc)
            if  res.status ~= 200 then
                return res   
            end
            qry = {_id = util:str2objID(subId)}
            sub = 'Sub'
        end
    end
    return  self:update(col..sub, qry, newDoc)
end

function Menu:delete(module, args, jsonStr, _id, subModule, subId)
    if _id == ""  then
        exception:raise("core.badCall", {
            errMsg = "there should be id in your restfull API.",
            hint = "/PolicyObject/User/UserGroup/module/id",
        })
    elseif subModule ~= "" and subId == "" then
        exception:raise("core.badCall", {
            errMsg = "there should be subID in your restfull API.",
            hint = "/PolicyObject/User/UserGroup/module/id/subModule/subID",
        })
    end
    local qry = nil
    local col = module
    local sub =''
    if module == "Devices" and args.groups then
        local device = self.dbmodule:getOne(col, {_id = _id})
        device.addToGroups = 'none'
        device.groups = nil
        return self:update(col, {_id = _id}, device)
    elseif subModule == "" then
        qry = {["$or"]={
            {["name"] = _id},
            {["parentID"] = _id}
        }}
        util:zeroBasedArray(qry)
    else
        if args ~=nil and args["ssubmodue"] =='RoutingPolicy' then
            ngx.log(ngx.DEBUG, "Menu:delete=====>args: ", util:jsonEncode(args))
            subId = args["realId"]
            sub = 'Sub'
        end
        qry = {_id = util:str2objID(subId)}
    end

    if module == "Devices" then
        self.dbmodule:delete("ObjectsInterface", {device = _id})
    end
    return  self.dbmodule:delete(col..sub, qry)
end

return serviceBase:inherit(Menu):init()
