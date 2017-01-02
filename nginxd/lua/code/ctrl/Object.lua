local util = loadMod("core.util")
local exception = loadMod("core.exception")
local request = loadMod("core.request")
local response = loadMod("core.response")
local ctrlBase = loadMod("core.base.ctrl")
local objectService = util:getService("object")

local Object = {}

function Object:post()
    local payload = request:getPayload()
    local api  =  request:getStrParam("module")
    local id   =  request:getStrParam("id")
    local apiSub =  request:getStrParam("subModule")
    local args = request:getArgsTbl()
    local isFile = string.find(request:getHeader("Content-Type"), "multipart")

    -- TODO vdom support infuture
    local vdom = request:getCookie("vdom") or "root"
    local res, status = objectService:post(api, args, payload, id, apiSub, isFile, vdom)
    response:reply(res, nil, status)
end

function Object:get()
    local args = request:getArgsTbl()
    --local apiSub =  request:getStrParam("subModule")
    --local loginUser = ctrlBase:getLoginUser()
    local res, header, status = objectService:get(args["depart"], args["departId"], args["section"], args["sectionId"], args["title"], args["titleId"], false)
    response:reply(res, header, status)
end

function Object:delete()
    local args = request:getArgsTbl()
    --local vdom = request:getCookie("vdom") or "root"

    local res = objectService:delete(args["depart"], args["departId"], args["section"], args["sectionId"], args["title"], args["titleId"])
    response:reply(res)
end

function Object:put()
    local args = request:getArgsTbl()
    local payload = request:getPayload()
    --local vdom = request:getCookie("vdom") or "root"
    local res, status = objectService:put(args["depart"], args["departId"], args["section"], args["sectionId"], args["title"], args["titleId"], payload)
    response:reply(res, nil, status)
end

return util:inherit(Object, ctrlBase)
