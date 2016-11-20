--@ author: zhouxuehao
--@ date: 2015-6-10
--@ user login / logout controller

local util = loadMod("core.util")
local exception = loadMod("core.exception")
local request = loadMod("core.request")
local response = loadMod("core.response")
local ctrlBase = loadMod("core.base.ctrl")
local UserService = util:getService("user")

local User = {
    Col = "Users",
}

function User:login()
    ngx.log(ngx.DEBUG, "user login ctrl ... ")
    local payload = request:getPayload()
    if type(payload) ~= "string" then
        return ngx.redirect("/login.html", 302)
    end
    _, _, uname, passwd = string.find(payload, "name=([^&]+)&password=([^&]*)")
    local args = {
        name = ngx.unescape_uri(uname),
        password = ngx.unescape_uri(passwd)
    }

    local res, header, status  = UserService:login(self.Col, args)
    response:reply(res, header, status)
end

function User:logout()
    ngx.log(ngx.DEBUG, "user logout ctrl ... ")
    local args = request:getArgsTbl()
    local token = request:getCookie("sessionid")
    ngx.log(ngx.DEBUG, "user logout ctrl get token :  ", token)
    local res  = UserService:logout(self.Col, args, token)
    response:reply(res)
end

function User:license()
    ngx.log(ngx.DEBUG, "user license ctrl ... ")
    local payload = request:getPayload()
    ngx.log(ngx.DEBUG, "License Input payload: ", payload)
    
    _, _, licenseKey = string.find(payload, "key=([%w]+)")

    local res, status = UserService:license(licenseKey)
    response:reply(res, status)
end

return util:inherit(User, ctrlBase)
