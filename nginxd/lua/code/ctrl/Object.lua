--@ author: zhouxuehao
--@ date: 2015-4-14
--@ Object controller

local util = loadMod("core.util")
local exception = loadMod("core.exception")
local request = loadMod("core.request")
local response = loadMod("core.response")
local ctrlBase = loadMod("core.base.ctrl")
local ObjectService = util:getService("object")

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
    local res, status = ObjectService:post(api, args, payload, id, apiSub, isFile, vdom)
    response:reply(res, nil, status)
end


function Object:get()
    local args = request:getArgsTbl()
    local api = request:getStrParam("module")
    local id = request:getStrParam("id")
    local apiSub =  request:getStrParam("subModule")

    -- TODO vdom support infuture
    local vdom = request:getCookie("vdom") or "root"
    local loginUser = ctrlBase:getLoginUser()

    local res, header, status = ObjectService:get(api, args, id, apiSub, vdom, loginUser)
    response:reply(res, header, status)
end


function Object:delete()
    local api= request:getStrParam("module")
    local id = request:getStrParam("id")
    local apiSub = request:getStrParam("subModule")
    local subId = request:getStrParam("subId")
    local args = request:getArgsTbl()
    local vdom = request:getCookie("vdom") or "root"

    local res = ObjectService:delete(api, args, nil, id, apiSub, subId, vdom)
    response:reply(res)
end


function Object:put()
    local payload = request:getPayload()
    local api = request:getStrParam("module")
    local id = request:getStrParam("id")
    local apiSub = request:getStrParam("subModule")
    local subId = request:getStrParam("subId")
    local args = request:getArgsTbl()
    local vdom = request:getCookie("vdom") or "root"
    local res, status = ObjectService:put(api, args, payload, id, apiSub, subId, vdom)
    response:reply(res, nil, status)
end

return util:inherit(Object, ctrlBase)
