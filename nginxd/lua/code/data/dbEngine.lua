--@ author: zhouxuehao
--@ date: 2015-4-7
--@ mongodb api base

local util = loadMod("core.util")
local exception = loadMod("core.exception")
local mongodb = loadMod("core.driver.mongodb")
local refsInMod = loadMod("config.refsInMod")
local sysConf = loadMod("config.system")
local conflictCheck = loadMod("config.conflictCheck")
local IpAddr = loadMod("core.util.ipaddr")
local Device = {
}

local function isNullVal(val)
	return not val or val == ""
end

--@param col table
--@param qry table
--@return result table
function Device:getMul(col, qry)
    local result = mongodb:getMul(col, qry)
    return  result
end

function Device:getOne(col, qry)
    ngx.log(ngx.DEBUG , "************************* col :", col)
    ngx.log(ngx.DEBUG, "************************* qry: ", util:jsonEncode(qry))
    local result = mongodb:getOne(col, qry)
    ngx.log(ngx.DEBUG, "*************************  result : ", util:jsonEncode(result))
    return  result
end

function Device:getCloneData(module, mkey, newmkey)
    local result = self:getOne(module, {_id = mkey})
    result.name = newmkey
    result._id = newmkey
    result.ref = 0
    result.defaultFlag = nil
    result.label = nil
    result.value = nil
    return result
end

function Device:addCloneSubTable(module, mkey, newmkey)
    local result = self:getMul(module, {parentID = mkey})
    local subItem = nil
    if next(result) ~= nil then
        for _, subItem in ipairs(result) do
            subItem._id = nil
            subItem.parentID = newmkey
            if subItem.ref then
                subItem.ref = nil
            end
        end
        mongodb:creat(module, result)
    end
    return
end

function Device:checkInterface(doc)
	local ret, errMsg
	local ifItems = self:getMul("Interface", {})

	-- name conflict check Interface
	for _, inf in pairs(ifItems) do
		if doc._id ~= inf._id then
			if inf.name == doc.name then
				errMsg = "Duplicate Name[" .. doc.name .. "] exist in Interface."
				return false, errMsg
			end
		end
	end

	local docItemInDB = self:getOne("ObjectsInterface", {_id = doc._id})
	if next(docItemInDB) ~= nil then
		if doc.addressingMode ~= docItemInDB.addressingMode or doc.ipv4Netmask ~= docItemInDB.ipv4Netmask then
			local vzones = self:getMul("Vzone", {})
			for _, vzone in pairs(vzones) do
				for _, vzinterface in ipairs(vzone.interface) do
					if vzinterface == doc._id then
						return false, "Entry is used."
					end
				end
			end
		end
	end

	-- name conflict check ObjectsInterface
	ifItems = self:getMul("ObjectsInterface", {})
	for _, inf in pairs(ifItems) do
		if doc._id ~= inf._id then
			if inf.name == doc.name then
				errMsg = "Duplicate Name[" .. doc.name .. "] exist in Interface."
				return false, errMsg
			end
		end
	end

	-- ip duplicate and subnet conflict v4
	if not IpAddr:isSameIpV4(doc.ipv4Netmask, "0.0.0.0/0") then
		local _, mask = IpAddr:getIpMask(doc.ipv4Netmask)
		if 32 ~= mask then
			if IpAddr:hostAddrIsBrdcast(doc.ipv4Netmask) or IpAddr:hostAddrIsZero(doc.ipv4Netmask) then
				return false, "Invalid IP Address."
			end
		end
		for _, inf in pairs(ifItems) do
			if doc._id ~= inf._id and not IpAddr:isSameIpV4("0.0.0.0/0", inf.ipv4Netmask) then
				if IpAddr:isSameIpV4(doc.ipv4Netmask, inf.ipv4Netmask) then
					return false, "Duplicate IP address."
				elseif 0 ~= mask and IpAddr:isSameSubnet4(doc.ipv4Netmask, inf.ipv4Netmask) then
					return false, "IP address is in same subnet as the others." 
				end
			end
		end
	end

	-- ip duplicate and subnet conflict v6
	if not IpAddr:isSameIpV6(doc.ipv6Netmask, "::/0") then
		local _, mask = IpAddr:getIpMask(doc.ipv6Netmask)
		for _, inf in pairs(ifItems) do
			if doc._id ~= inf._id and not IpAddr:isSameIpV6("::/0", inf.ipv6Netmask) then
				if IpAddr:isSameIpV6(doc.ipv6Netmask, inf.ipv6Netmask) then
					return false, "Duplicate IP address." 
				elseif 0 ~= mask and IpAddr:isSameSubnet6(doc.ipv6Netmask, inf.ipv6Netmask) then
					return false, "IP address is in same subnet as the others." 
				end
			end
		end
	end

	return true
end

function Device:XForwardedForSub(doc)
	local errMsg
	local ifItems = self:getMul("XForwardedFor", {parentID = doc.parentID})
	local ip1 = doc.iP .. '/0'
	if IpAddr:isIpV4(doc.iP) then
		for _, inf in pairs(ifItems) do
			if doc._id ~= inf._id and IpAddr:isIpV4(inf.iP) then
				local ip2 = inf.iP .. '/0'
				if IpAddr:isSameIpV4(ip1, ip2) then
					errMsg = "The IP address is already used by another vserver."
					return false, errMsg
				end
			end
		end
	else											-- FortiWeb allow zero ipv6
		for _, inf in pairs(ifItems) do
			if doc._id ~= inf._id and not IpAddr:isIpV4(inf.iP) then
				local ip2 = inf.iP .. '/0'
				if IpAddr:isSameIpV6(ip1, ip2) then
					errMsg = "The IP address is already used by another vserver."
					return false, errMsg
				end
			end
		end
	end
	return true
end

function Device:checkVirtualServer(doc)
	local errMsg, mask
    if doc.useInterfaceIP then
        return true
    end
	local ifItems = self:getMul("VirtualServer", {})
	-- canno ipv4 ipv6 both are zero ipaddr 
	if IpAddr:isSameIpV4("0.0.0.0/0", doc.ipv4Address) and IpAddr:isSameIpV6(doc.ipv6Address, "::/0") then
		errMsg = "Invalid IP Address."
		return false, errMsg
	end

	if not IpAddr:isSameIpV4("0.0.0.0/0", doc.ipv4Address) then
		local ipv4Address, ip4, mask = IpAddr:fixMaskOfIpV4Addr(doc.ipv4Address)
		if nil == mask then
			ip4, mask = IpAddr:getIpMask(ipv4Address)
		end
		local ip4mask = ip4 .. "/" .. mask
		if 0 == mask then
			errMsg = "Invalid IP Address."
			return false, errMsg
		end
		if mask ~= 32 then
			if IpAddr:hostAddrIsZero(ip4mask) then
				errMsg = "Invalid IP Address."
				return false, errMsg
			end
			if IpAddr:hostAddrIsBrdcast(ip4mask) then
				errMsg = "Invalid IP Address."
				return false, errMsg
			end
		end
		doc.ipv4Address = ipv4Address
	end

	for _, inf in pairs(ifItems) do
		if doc._id ~= inf._id then
			if not IpAddr:isSameIpV4("0.0.0.0/0", inf.ipv4Address) and not IpAddr:isSameIpV4(doc.ipv4Address, "0.0.0.0/0") and IpAddr:isSameIpV4(doc.ipv4Address, inf.ipv4Address) then
				errMsg = "The IP address is already used by another vserver."
				return false, errMsg
			end
			if not IpAddr:isSameIpV6("::/0", inf.ipv6Address) and not IpAddr:isSameIpV6(doc.ipv6Address, "::/0") and IpAddr:isSameIpV6(doc.ipv6Address, inf.ipv6Address) then
				errMsg = "The IP address is already used by another vserver."
				return false, errMsg
			end
		end
	end
	return true
end
function Device:getCollctIntersection (dstTabl, srcTabl, hasExtend)
    local ele = nil
    local intersect = {}
    if hasExtend == false then
        ngx.log(ngx.DEBUG, "------+++++getCollctIntersection  : init =0")
        for _, ele in ipairs(srcTabl) do
            intersect[ele] = true
        end
        return intersect
    end
                   
    for _, ele in ipairs(srcTabl) do
        ngx.log(ngx.DEBUG, "------+++++getCollctIntersection  : ", dstTabl[ele], " ele:", ele)
        if dstTabl[ele] == true then
            intersect[ele] = true
        end   
    end
    return intersect
end
function Device:fillDefaultDisableSig(doc)
    local elem = nil
    local qry , hasExtend= {}, false
    local dstTabl = {}
    if doc.web_server ~= nil then
        for _, elem in ipairs(doc.web_server) do
            if elem.checked == true then
                local result = mongodb:getOne("BaseSignatureDisable", {_id = elem.name})
                local sigList = result["disable_list"] and result["disable_list"] or {}
                dstTabl = self:getCollctIntersection(dstTabl, sigList, hasExtend)
                hasExtend = true
            end
          
        end
    end
    if doc.database ~= nil then
        for _, elem in ipairs(doc.database) do
            if elem.checked == true then
                local result = mongodb:getOne("BaseSignatureDisable", {_id = elem.name})
                local sigList = result["disable_list"] and result["disable_list"] or {}
                dstTabl = self:getCollctIntersection(dstTabl, sigList, hasExtend)
                hasExtend = true                 
            end
        end
    end
    if hasExtend == true then
        local k= nil
        doc.signature_disable_list = {}
        for k, _ in pairs(dstTabl) do
            table.insert(doc.signature_disable_list, k)
        end
    else
        qry = {_id = "init"}
        local baseDisable = self:getOne("BaseSignatureDisable", qry)
        doc.signature_disable_list = baseDisable.disable_list
    end
    
end

function Device:getMaxRealId(col, doc)
    local currentRealId = 1

    while (1) do
        if next(mongodb:getOne(col, {["parentID"] = doc.parentID, ["realId"] = currentRealId})) == nil then
            break;
        end
        currentRealId = currentRealId + 1
    end
    ngx.log(ngx.DEBUG, "getMaxRealId -----> ", currentRealId)
    return currentRealId 
end
function Device:getMaxSeqId(col, doc)
    local currentSeqId = 1

    while (1) do
        if next(mongodb:getOne(col, {["parentID"] = doc.parentID, ["seq"] = {["$gte"]=currentSeqId}})) == nil then
            break;
        end
        currentSeqId = currentSeqId + 1
    end
    ngx.log(ngx.DEBUG, "getMaxSeqId -----> ", currentSeqId)
    return currentSeqId 
end
function Device:changeAfterItemSeq(col, doc, seq)
    local qry = {["parentID"] = doc.parentID, ["seq"] = {["$gte"]=seq}}
    local res = mongodb:getMul(col, qry)
    if res ~= nil then
        local elem = nil
        local currentSeq = seq
        local findSeqStart = false
        table.sort(res, function(pre, next)
            return pre.seq < next.seq
        end)
        for _, elem in ipairs(res) do
            ngx.log(ngx.DEBUG, "changeAfterItemSeq trarverse-----> ", elem.seq)
            if elem.seq == currentSeq then
                findSeqStart = true
                --elem._id = util:objID2str(elem._id)
                elem.seq = currentSeq + 1
                ngx.log(ngx.DEBUG, "changeAfterItemSeq changed curSeqId-----> ", currentSeq)
                elem._id = util:str2objID(elem._id)
                local subQry =  {["_id"] = elem._id}
                mongodb:update(col, subQry, elem)
                currentSeq = currentSeq + 1
            elseif(findSeqStart and elem.seq > currentSeq) then
                ngx.log(ngx.DEBUG, "changeAfterItemSeq curSeqId-----> ", currentSeq)
                ngx.log(ngx.DEBUG, "changeAfterItemSeq ele.seqId-----> ", elem.seq)
                break
            end
        end
    end
end

function Device:getCurrentSeqId(col, doc, realId)
    local qry = {["parentID"] = doc.parentID, ["realId"] = realId}
    local res = mongodb:getOne(col, qry)
    if res ~= nil then
        return res.seq
    end
end

function Device:changeSeqPolicyProc(module, col, doc, method)
    if sysConf.supportMoveTable[module] then
        if doc["order"] == nil and doc._id == nil then-- create
            ngx.log(ngx.DEBUG, "changeSeqPolicyProc realId:", module) 
            doc.realId = self:getMaxRealId(col, doc)
            doc.seq = self:getMaxSeqId(col, doc)
            doc.order = nil
        elseif doc["order"] == "before" and doc["child_mkey"] == nil then --insert
            doc.realId = self:getMaxRealId(col, doc)
            doc.seq = self:getCurrentSeqId(col, doc, doc["to"])
            ngx.log(ngx.DEBUG, "changeSeqPolicyProc get current seq:", doc.seq) 
            self:changeAfterItemSeq(col, doc, doc.seq)
            doc.order = nil
        elseif (doc["order"] == "before" or doc["order"] == "after") and doc["child_mkey"] ~= nil then --move
            local qry = {["parentID"] = doc.parentID, ["realId"] = doc["child_mkey"]}
            local item = self:getOne(col, qry)
            local seq = 1
            if doc["order"] == "before" then
                seq = self:getCurrentSeqId(col, doc, doc["to"])
            else
                seq = doc["beforeSeqId"]
            end
            self:changeAfterItemSeq(col, doc, seq)
            item.seq = seq
            item._id = util:str2objID(item._id)
            return item
        end 
    end
    return doc
end
function Device:checkVzone(doc)
	local count = 0
	for _, v in ipairs(doc.interface) do
		if next(self:getOne("Interface", {name = v})) ~= nil then
			count = count + 1
		end
	end
	if 1 == count then
		return false, "Interfaces must be the same type."
	end
	return true
end

function Device:updateReferenceNum(module, refName, number)
    if type(refName) == "table" then
        for _, refItem in ipairs(refName) do
            mongodb:update(module, {_id = refItem}, {["$inc"] = {ref = number}})
        end
    else
        mongodb:update(module, {_id = refName}, {["$inc"] = {ref = number}})
    end
end

function Device:updateDeviceInGroup(newJson)
    local device = nil 
    local addArray = {}
    local removeArray = {}

    if newJson and newJson.devices then
        addArray = newJson.devices
    end
    local query = {["$and"] = {{["addToGroups"] = "specific"}, {["groups"] = newJson["name"]}}}
    util:zeroBasedArray(query)
    local devices = self:getMul("Devices", query)

    for _, device in ipairs(devices) do
        table.insert(removeArray, device["name"])
    end
    local addIndex, addDevice, removeIndex, removeDevice, findFlag
    addIndex = 1

    while addIndex <= #addArray do
        findFlag = false
        removeIndex = 1
        while removeIndex <= #removeArray do
            if addArray[addIndex] == removeArray[removeIndex] then
                table.remove(addArray, addIndex)
                table.remove(removeArray, removeIndex)
                findFlag = true
                break
            else
                removeIndex = removeIndex + 1
            end
        end

        if findFlag == false then
            addIndex = addIndex + 1
        end
    end

    for _, addDevice in ipairs(addArray) do
       mongodb:update("Devices", {_id = addDevice}, {["$set"] = {addToGroups = "specific", groups = newJson["name"]}})
    end
    for _, removeDevice in ipairs(removeArray) do
        mongodb:update("Devices", {_id = removeDevice}, {["$set"] = {addToGroups = "none", groups = ""}})
    end
end

function Device:add(module, doc)
    local docs = {}
    local oldName, newName
    local sub =string.sub(module,-3,-1)
    local col = module
    local conflictQuery = nil
    local isClone = false
    if sub == "Sub" then
        col = string.sub(module,1,-4)
    end

    if doc.mkey and doc.newkey then
        oldName = doc.mkey
        newName = doc.newkey
        doc = self:getCloneData(col, oldName, newName)
        isClone = true

    elseif doc.nameClone and doc.name then
        oldName = doc.name
        newName = doc.nameClone
        doc = self:getCloneData(col, oldName, newName)
        isClone = true
    end  

    if doc._id and next(self:getOne(col, {_id = doc._id})) ~= nil then
        ngx.log(ngx.ERR, "Duplicate Name[", doc._id, "] exist in ", col)
        return {msg = "A duplicate entry already exists."}, 500
    end

    if module == "VirtualServer" then
        local ret, errMsg = self:checkVirtualServer(doc)
        if not ret then
            ngx.log(ngx.ERR, errMsg)
            return {msg = errMsg}, 500
        end
    end
    if module == "XForwardedForSub" then
        local ret, errMsg = self:XForwardedForSub(doc)
        if not ret then
            ngx.log(ngx.ERR, errMsg)
            return {msg = errMsg}, 500
        end
    end
    if module == "Signatures" and isClone == false then
        self:fillDefaultDisableSig(doc)
    end
    self:changeSeqPolicyProc(module, col, doc, "post")
    if doc.parentID and module ~= "PolicyPackageSub" and next(self:getOne(col, {_id = doc.parentID})) == nil then
        ngx.log(ngx.ERR, "The parentId[", doc.parentID, "] of ", col, " not exist")
        return {msg = "Entry not found."}, 500
    end

    conflictQuery = conflictCheck:getDuplicateQuery(col, doc)
    if conflictQuery and next(self:getMul(col, conflictQuery)) ~= nil then
        ngx.log(ngx.ERR, "ConflictCheck fail for ", col, ": ", util:jsonEncode(doc))
        return {msg = "The same item has already been in the table."}, 500
    end

    if doc.sp == 1 then
        local contentSet = doc.contentTypeSet and doc.contentTypeSet or doc.picker
        if (nil == next(contentSet)) then
            mongodb:delete(module, {parentID = doc._id})
            return {status=201, msg="update successfully in database."}
        end
        local temp = util.table:copy(doc)
        for _, val in ipairs(contentSet) do
            ngx.log(ngx.DEBUG, "<val> :  ".. val)
            local tblTmp = util.table:copy(temp)
            tblTmp.realId = val
            table.insert(docs, tblTmp)
        end
    else
        table.insert(docs, doc)
    end

    local result = mongodb:creat(col, docs)

    -- now the doc has been insert into mongodb successfully
   
    if module == "PolicyPackage" then  -- special process for policyPackage create
        module = "ServerPolicy"
    end
    if module == "PolicyPackageSub" then
        module = "ServerPolicySub"
    end
    local refmods = type(refsInMod[module]) == "function" and refsInMod[module](doc) or refsInMod[module]
    
    if refmods and type(refmods) == "table" then
        for _, mem in ipairs(refmods) do
            --for m, f in pairs(mem) do
                m = mem[1]
                f = mem[2]
               
                if type(f) == "table" then 
                    local subk, subf = nil, nil
                    for subk, subf in pairs(f) do
                        if type(doc[subk]) == "table" then
                            if not isNullVal(doc[subk][subf]) then
                                ngx.log(ngx.DEBUG , "***** Device:add subk:",subk, " subf ", subf, "val: ", doc[subk][subf])
                                self:updateReferenceNum(m, doc[subk][subf], 1)
                            end
                        end
                    end
                else
                    if not isNullVal(doc[f]) then
                        self:updateReferenceNum(m, doc[f], 1)
                    end
                end
            --end
        end
    end
    if oldName and newName then
        self:addCloneSubTable(col, oldName, newName)
    end

    if module == "DevicesGroups" then
        self:updateDeviceInGroup(doc)
    end

    return {status=201, msg="creat successfully in database."}
end


function Device:delete(module, qry)
    ngx.log(ngx.DEBUG, "Device delete: ++++>  " , type(qry))
   
    local sub =string.sub(module,-3,-1)
    local col = module
    local subcol = module

    if sub ~= "Sub" then  --delete sub
        subcol = subcol.."Sub"
    else
        --subcol =''
        col = string.sub(module,1,-4)
    end
    local rescol = mongodb:getMul(col, qry)

	if rescol then
		for _, rec in ipairs(rescol) do
			local ret, err = self:fileRemove(module, rec)
			if not ret then
				ngx.log(ngx.ERR, "***** Device:delete sub m:", m," f :",f)
				return  { affected = 0, err}
			end
		end
	end

    local result = mongodb:delete(col, qry)
    if module == "PolicyPackage" then  -- special process for policyPackage create
        col = "ServerPolicy"
        subcol = "ServerPolicySub"
    end
    if module == "PolicyPackageSub" then
        subcol = "ServerPolicySub"
    end
    
    -- now the doc has been deleted from mongodb successfully
    local subrefmods = refsInMod[subcol]
    if rescol and subrefmods then
        for _, res in ipairs(rescol) do
            subrefmods = type(refsInMod[subcol]) == "function" and refsInMod[subcol](res) or refsInMod[subcol]
            if type(subrefmods) == "table" then
                for _, mem in ipairs(subrefmods) do
                    m = mem[1]
                    f = mem[2]
                    ngx.log(ngx.DEBUG , "***** Device:delete sub m:", m," f :",f)
                    if not isNullVal(res[f]) then
                        self:updateReferenceNum(m, res[f], -1)
                    end
                end
            end
        end
    end
    local refmods = refsInMod[col]
    if sub ~= "Sub" and rescol and refmods and type(refmods) == "table"then
        for _, res in ipairs(rescol) do
            for _, mem in ipairs(refmods) do
                m = mem[1]
                f = mem[2]
                if type(f) == "string" then
                    ngx.log(ngx.DEBUG , "***** Device:delete m:", m," f :",f)
                    if not isNullVal(res[f]) then
                        self:updateReferenceNum(m, res[f], -1)
                    end
                elseif type(f) == "table" then
                    local subk, subf = nil, nil
                    for subk, subf in pairs(f) do
                        if type(res[subk]) == "table" then
                            if not isNullVal(res[subk][subf]) then
                                ngx.log(ngx.DEBUG , "***** Device:delete subk:",subk, " subf ", subf, "val: ", res[subk][subf])
                                self:updateReferenceNum(m, res[subk][subf], -1)
                            end
                        end
                    end
                end 
            end
        end
    end

    return {affected = 1}
end

function Device:updateSubTblRefNum(m, f, resSub, docTbl)
    if not isNullVal(resSub[f]) and isNullVal(docTbl[f]) then
        self:updateReferenceNum(m, resSub[f], -1)
    elseif not isNullVal(resSub[f]) and not isNullVal(docTbl[f]) then
        if resSub[f] ~= docTbl[f] then
            self:updateReferenceNum(m, resSub[f], -1)
            self:updateReferenceNum(m, docTbl[f], 1)
        end
    elseif isNullVal(resSub[f]) and not isNullVal(docTbl[f]) then
        self:updateReferenceNum(m, docTbl[f], 1)                  
    elseif isNullVal(resSub[f]) and isNullVal(docTbl[f])  then

    end
end
function Device:update(module, qry, doc)
    local sub =string.sub(module,-3,-1)
    local col = module
    if sub == "Sub" then
        col = string.sub(module,1,-4)
    end

    local res = mongodb:getOne(col, qry)

    if next(res) == nil or 
        (doc.parentID and module ~= "PolicyPackageSub" and next(self:getOne(col, {_id = doc.parentID})) == nil) then
        return {msg = "Entry not found."}, 500
    end
    doc = self:changeSeqPolicyProc(module, col, doc, "put")
    if module == "VirtualServer" then
        local ret, errMsg = self:checkVirtualServer(doc)
        if not ret then
            ngx.log(ngx.ERR, errMsg)
            return {msg = errMsg}, 500
        end
    end
    if module == "XForwardedForSub" then
        local ret, errMsg = self:XForwardedForSub(doc)
        if not ret then
            ngx.log(ngx.ERR, errMsg)
            return {msg = errMsg}, 500
        end
    end
    conflictQuery = conflictCheck:getDuplicateQuery(col, doc)
    if conflictQuery then
        local confictObject = nil
        local conflictArray = self:getMul(col, conflictQuery)
        if next(conflictArray) ~= nil then
            for _, confictObject in pairs(conflictArray) do
                if confictObject._id ~= res._id then
                    ngx.log(ngx.ERR, "ConflictCheck fail for ", col, ": ", util:jsonEncode(doc))
                    return {msg = "The same item has already been in the table."}, 500
                end
            end
        end    
    end
    doc.ref = res.ref
    doc.can_delete = res.can_delete
    local result = mongodb:update(col, qry, doc)

    -- now the doc has been updated in mongodb successfully

    if module == "PolicyPackage" then  -- special process for policyPackage create
        module = "ServerPolicy"
        if res["deploymentMode"] ~= doc["deploymentMode"] and res["deploymentMode"] == "httpContentRouting" then
            ngx.log(ngx.DEBUG , "***** Device:update get res[_id] :",res["_id"])
            mongodb:delete(col, {parentID = res["parentID"]..'#'..res["_id"]}) 
        end
    end
    if module == "PolicyPackageSub" then
        module = "ServerPolicySub"
    end

    local refmods = type(refsInMod[module]) == "function" and refsInMod[module](doc) or refsInMod[module]
    
    if refmods and type(refmods) == "table" then
        for _, mem in ipairs(refmods) do
            m = mem[1]
            f = mem[2]
            if type(f) == "string" then  --only support two level ref table
                if not isNullVal(res[f]) and isNullVal(doc[f]) then
                    self:updateReferenceNum(m, res[f], -1)
                elseif not isNullVal(res[f]) and not isNullVal(doc[f]) then
                    if res[f] ~= doc[f] then
                        self:updateReferenceNum(m, res[f], -1)
                        self:updateReferenceNum(m, doc[f], 1)
                    end
                elseif isNullVal(res[f]) and not isNullVal(doc[f]) then
                    self:updateReferenceNum(m, doc[f], 1)                  
                elseif isNullVal(res[f]) and isNullVal(doc[f])  then
                end
            elseif type(f) == "table" then
                local subk, subf = nil, nil
                for subk, subf in pairs(f) do
                    if type(res[subk]) == "table" and type(doc[subk]) == "table" then
                        self:updateSubTblRefNum(m, subf, res[subk], doc[subk])
                    end
                end
            end
        end 
    end

    if module == "DevicesGroups" then
        self:updateDeviceInGroup(doc)
    end

    return {status=201, msg="update  successfully in database."}
end


function Device:fileUpload(col, pathName)
    return mongodb:fileUpload(col, pathName)
end

function Device:delFile(col, pathName)
    return mongodb:delFile(col, pathName)
end

-- @return string: file content
function Device:fileDownload(col, qry)
    local fileContent = mongodb:fileDownload(col, qry)
    return fileContent, {["Content-Disposition"] = string.format("attachment; filename=\"%s\";", qry.filename), ["Content-Type"] = "application/x-binary"}
end


-- @return string: file delete result
function Device:fileRemove(module, rec)

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

return Device
