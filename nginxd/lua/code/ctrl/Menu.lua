--@ author: qxyang
--@ date: 2015-4-16
--@ Menu controller

local util = loadMod("core.util")
local exception = loadMod("core.exception")
local request = loadMod("core.request")
local response = loadMod("core.response")
local ctrlBase = loadMod("core.base.ctrl")
local MenuService = util:getService("menu")

local Menu = {}

function Menu:get()
    local api = request:getStrParam("module")
    local args = ngx.req.get_uri_args()
    local id = request:getStrParam("id")
    local apiSub = request:getStrParam("subModule")
    local subId = request:getStrParam("subId")

    ngx.log(ngx.DEBUG, "ctrl.Menu.get starting ============== ")
    local res, header = MenuService:get(api, args, id, apiSub, subId)
    response:reply(res, header)
end

function Menu:post()
    local api  =  request:getStrParam("module")
    local args = ngx.req.get_uri_args()
    local payload = request:getPayload()
    local id = request:getStrParam("id")
    local apiSub = request:getStrParam("subModule")
    local subId = request:getStrParam("subId")

    ngx.log(ngx.DEBUG, "ctrl.Menu.post starting ============== ")
    local res, status = MenuService:post(api, args, payload, id, apiSub, subId)
    response:reply(res, nil, status)
end

function Menu:put()
    local api = request:getStrParam("module")
    local args = ngx.req.get_uri_args()
    local payload = request:getPayload()
    local id = request:getStrParam("id")
    local apiSub = request:getStrParam("subModule")
    local subId = request:getStrParam("subId")

    ngx.log(ngx.DEBUG, "ctrl.Menu.put starting ============== ")
    local res, status = MenuService:put(api, args, payload, id, apiSub, subId)
    response:reply(res, nil, status)
end

function Menu:delete()
    local api= request:getStrParam("module")
    local args = ngx.req.get_uri_args()
    local id = request:getStrParam("id")
    local apiSub = request:getStrParam("subModule")
    local subId = request:getStrParam("subId")

    ngx.log(ngx.DEBUG, "ctrl.Menu.delete starting ============== ")
    local res = MenuService:delete(api, args, nil, id, apiSub, subId)
    response:reply(res)
end

return util:inherit(Menu, ctrlBase)
