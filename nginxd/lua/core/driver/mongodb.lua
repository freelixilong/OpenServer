local mongo = require("resty.mongol")
local util = loadMod("core.util")
local exception = loadMod("core.exception")
local dbConf = loadMod("config.mongol")
local sysConf = loadMod("config.system")

local MongoDB = {}

local function initClient()
    local client = exception:assert("core.connectFailed", {}, mongo:new())
    client:set_timeout(dbConf.TIMEOUT)

    local options = {
        user = dbConf.USER,
        password = dbConf.PASSWORD,
        database = dbConf.DATABASE
    }

    options.host = dbConf.HOST
    options.port = dbConf.PORT

    local result, errMsg = client:connect(options.host, options.port)
    if not result then
        exception:raise("core.connectFailed", {
            message = errMsg,
        })
    end


    ngx.ctx[MongoDB] = client
    return ngx.ctx[MongoDB]
end

local function getClient()
    return ngx.ctx[MongoDB] or initClient()
end

local function getDB()
   local db = getClient():new_db_handle(dbConf.DATABASE)
   --TODO
   --local result = db:auth(dbConf.USER, dbConf.PASSWORD)
   --if not result then
   --    exception:raise("core.connectFailed", {
   --        message = errMsg,
   --    })
   --end
   return db
end


local function closeClient()
    if ngx.ctx[MongoDB] then
        ngx.ctx[MongoDB]:set_keepalive(dbConf.TIMEOUT, dbConf.POOL_SIZE)
        ngx.ctx[MongoDB] = nil
    end
end


--@ retrun result number of been inserted into mongodb collection
function MongoDB:creat(col, docs)

    ngx.log(ngx.DEBUG, "MongoDB: post ==> col: ", col)
    ngx.log(ngx.DEBUG, "MongoDB: post ==> docs : ", util:jsonEncode(docs))

    local col = getDB():get_col(col)
    local result, errMsg = col:insert(docs, nil, true)
    if not result then
       exception:raise("core.queryFailed", {
           message = "failed insert the doc into mongodb: " .. errMsg,
       })
    end
    return result
end


--@ retrun result number of been deleted in mongodb collection
function MongoDB:delete(col, qry)

    ngx.log(ngx.DEBUG, "MongoDB: delete ==> col: ", col)
    ngx.log(ngx.DEBUG, "MongoDB: delete ==> qry: ", util:jsonEncode(qry))

    local col = getDB():get_col(col)
    -- local result, errMsg = col:delete(qry, nil, 1)
    local result, errMsg = col:delete(qry, 0, 1)
    if not result then
       exception:raise("core.queryFailed", {
           message = errMsg,
       })
    end
    return result
end


function MongoDB:getOne(col, qry)
    ngx.log(ngx.DEBUG, "MongoDB: getone ==> col: ", col)
    ngx.log(ngx.DEBUG, "MongoDB: getone ==> qry: ", util:jsonEncode(qry))
    local resp = {}
    local col = getDB():get_col(col)
    local result = col:find_one(qry)
    if result and result.name and not result.label then
        result.label = result.name
        result.value = result.name
    end

    if result and result._id and not util:isString(result._id) then
        result._id = util:objID2str(result._id)
    end

    return result or {}
end


function MongoDB:getMul(col, qry)

    ngx.log(ngx.DEBUG, "MongoDB``get==> col: ", col)
    ngx.log(ngx.DEBUG, "MongoDB: get==> qry: ", util:jsonEncode(qry))

    local resp = {}
    local colName = col
    local col = getDB():get_col(col)
    local result = col:find(qry, nil, sysConf.MONGO_NUM_EACH_QUERY)
    local cnt = 0
    for _, item in result:pairs() do
        if not util:isString(item._id) then
            item._id = util:objID2str(item._id)
        end
        cnt = cnt + 1
        item.id = cnt
        if item and item.name and not item.label then
            item.label = item.name
            item.value = item.name
        end

        table.insert(resp, item)
    end

    return resp
end


function MongoDB:update(col, qry, doc)

    ngx.log(ngx.DEBUG, "MongoDB: put ==> col: ", col)
    ngx.log(ngx.DEBUG, "===============> qry: ", util:jsonEncode(qry))
    ngx.log(ngx.DEBUG, "===============> doc: ", util:jsonEncode(doc))

    local col = getDB():get_col(col)
    result, errMsg = col:update(qry, doc, nil, nil, true)
    if not result then
       exception:raise("core.queryFailed", {
           message = errMsg,
       })
    end
    return result
end


-- @restult is 0/success, nil/failed
-- @return String the filename
-- @col default: "fs"
function MongoDB:fileUpload(col, pathName)
    local fs = getDB():get_gridfs(col or "fs")
    local fd, err = io.open(pathName, "rb")
    if not fd then exception:raise("core.cantOpenFile", { file = pathName,}) end
    local current = fd:seek()
    local size = fd:seek("end")
    fd:seek("set", current)
    local fileName = string.match(pathName, "/var/log/nginxd/upload/(.+)")
    local result, err = fs:insert(fd, {chunkSize = size, filename=fileName}, true)
    if not result then exception:raise("core.dbFileInsertFailed", { file = fileName, errMsg = err}) end
    io.close(fd)
    return fileName
end

function MongoDB:delFile(col, pathName)
    local fs = getDB():get_gridfs(col or "fs")
    local fileName = string.match(pathName, "/var/log/nginxd/upload/(.+)")
    local result, err = fs:remove({filename=fileName})
    if not result then exception:raise("db gridfs remove file failed", { file = fileName, errMsg = err}) end
    return fileName
end


-- @return string: file content
function MongoDB:fileDownload(col, qry)

    ngx.log(ngx.DEBUG, "mongodb download ...    ", util:jsonEncode(qry) )

    local fs = getDB():get_gridfs(col)
    local tmpFile = sysConf.FILE_UPLOAD_DIR .. ngx.now()

    ngx.log(ngx.DEBUG, "mongodb tmpFile...    ", tmpFile)
    local dirFd = io.open(sysConf.FILE_UPLOAD_DIR, "r")
    if nil == dirFd then
        os.execute("mkdir " .. sysConf.FILE_UPLOAD_DIR)
    else
        io.close(dirFd)
    end
    local fd = io.open(tmpFile, "wb")
    if not fd then exception:raise("core.cantOpenFile", { file = tmpFile,}) end

    local result = fs:get(fd, qry)
    if not result then exception:raise("core.downloadFailed", { file = qry.filename, errMsg = err}) end
    io.close(fd)

    result = util:readFile(tmpFile)
    ngx.log(ngx.DEBUG, "mongodb download ...    ", type(result) )
    os.remove(tmpFile)
    return result
end


function MongoDB:close()
    closeClient()
end

return MongoDB
