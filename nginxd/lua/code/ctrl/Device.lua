--@ author: zhouxuehao
--@ date: 2015-4-7 --@ device controller

local util = loadMod("core.util")
local exception = loadMod("core.exception")
local request = loadMod("core.request")
local response = loadMod("core.response")
local ctrlBase = loadMod("core.base.ctrl")
local deviceService = util:getService("device")

local Device = {}


function Device:post()
    local remoteGate = request:getCookie("device")
    local payload = request:getPayload()
    local api =  request:getStrParam("module")
    local id  =  request:getStrParam("id")
    local apiSub =  request:getStrParam("subModule")
    local isFile = string.find(request:getHeader("Content-Type"), "multipart")
    local args = ngx.var.args
    deviceService.web = true
    local res = deviceService:post(api, args, payload, id, apiSub, isFile, remoteGate)
    deviceService.web = false
    response:reply(res)
end


function Device:get()
    local remoteGate = request:getCookie("device")
    local api = request:getStrParam("module")
    local id = request:getStrParam("id")
    local apiSub =  request:getStrParam("subModule")
    local args = ngx.var.args
    deviceService.web = true
    local res, header = deviceService:get(api, args, id, apiSub, remoteGate)
    deviceService.web = false
    response:reply(res, header)
end


function Device:delete()
    local remoteGate = request:getCookie("device")
    local api= request:getStrParam("module")
    local id = request:getStrParam("id")
    local apiSub = request:getStrParam("subModule")
    local subId = request:getStrParam("subId")
    local args = ngx.var.args
    local res = deviceService:delete(api, args, nil, id, apiSub, subId, remoteGate)
    response:reply(res)
end


function Device:put()
    local remoteGate = request:getCookie("device")
    local payload = request:getPayload()
    local api = request:getStrParam("module")
    local id = request:getStrParam("id")
    local apiSub = request:getStrParam("subModule")
    local subId = request:getStrParam("subId")
    local args = ngx.var.args
    deviceService.web = true
    local res = deviceService:put(api, args, payload, id, apiSub, subId, remoteGate)
    deviceService.web = false
    response:reply(res)
end


return util:inherit(Device, ctrlBase)
