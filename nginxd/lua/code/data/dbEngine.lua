--@ mongodb api base
local util = loadMod("core.util")
local exception = loadMod("core.exception")
local mongodb = loadMod("core.driver.mongodb")
local sysConf = loadMod("config.system")
local conflictCheck = loadMod("config.conflictCheck")
local IpAddr = loadMod("core.util.ipaddr")
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
--[[
function MongoEngine:getCollctIntersection (dstTabl, srcTabl, hasExtend)
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

function MongoEngine:getMaxRealId(col, doc)
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
function MongoEngine:getMaxSeqId(col, doc)
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
function MongoEngine:changeAfterItemSeq(col, doc, seq)
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

function MongoEngine:getCurrentSeqId(col, doc, realId)
    local qry = {["parentID"] = doc.parentID, ["realId"] = realId}
    local res = mongodb:getOne(col, qry)
    if res ~= nil then
        return res.seq
    end
end

function MongoEngine:changeSeqPolicyProc(module, col, doc, method)
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


function MongoEngine:updateReferenceNum(module, refName, number)
    if type(refName) == "table" then
        for _, refItem in ipairs(refName) do
            mongodb:update(module, {_id = refItem}, {["$inc"] = {ref = number}})
        end
    else
        mongodb:update(module, {_id = refName}, {["$inc"] = {ref = number}})
    end
end
--]]
function MongoEngine:add(module, doc)
    local docs = {}
    local oldName, newName
    local sub =string.sub(module,-3,-1)
    local col = module
    local conflictQuery = nil
    local isClone = false
    if sub == "Sub" then
        col = string.sub(module,1,-4)
    end

    if doc._id and next(self:getOne(col, {_id = doc._id})) ~= nil then
        ngx.log(ngx.ERR, "Duplicate Name[", doc._id, "] exist in ", col)
        return {msg = "A duplicate entry already exists."}, 500
    end

    --self:changeSeqPolicyProc(module, col, doc, "post")
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

    return {status=201, msg="creat successfully in database."}
end

function MongoEngine:delete(module, qry)
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
    
    return {affected = 1}
end

function MongoEngine:updateSubTblRefNum(m, f, resSub, docTbl)
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
function MongoEngine:update(module, qry, doc)
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
    --doc = self:changeSeqPolicyProc(module, col, doc, "put")
    
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
