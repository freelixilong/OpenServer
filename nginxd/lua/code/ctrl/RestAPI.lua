local util = loadMod("core.util")
local exception = loadMod("core.exception")
local request = loadMod("core.request")
local response = loadMod("core.response")
local ctrlBase = loadMod("core.base.ctrl")
local restAPIMap = loadMod("config.restAPIMap")
local sysConf = loadMod("config.system")
local ObjectService = util:getService("object")
local UserService = util:getService("user")
local menuService = util:getService("menu")


require "bit"

local RestAPI = {}

function restFulAPICheck(api, methodID)
    local accessCode = restAPIMap[api]
    if not accessCode then
        ngx.exit(ngx.HTTP_NOT_FOUND)
    end
    if bit.band(methodID, accessCode) == 0 then
        ngx.exit(ngx.HTTP_NOT_ALLOWED)
    end
end

function accessProfileCheck(user, module, method)
    local params = {}
    params.user = user
    params.module = module
    params.method = method

    local result = util:proxy(sysConf.ProxyModule["CMCheckAccess"].proxyURL, params, nil, ngx.HTTP_GET)
    result = util:jsonDecode(result)
    if ngx.status ~= 200 or not result.allow then
        ngx.exit(ngx.HTTP_NOT_ALLOWED)
    end
end

function RestAPI:authorizationCheck()
    local authorization = ngx.req.get_headers()["Authorization"]

    if authorization == nil then
        ngx.log(ngx.DEBUG, "header Authorization: missing")
        ngx.exit(ngx.HTTP_UNAUTHORIZED)
    end
    local authorizationDecoded = ngx.decode_base64(authorization)
    ngx.log(ngx.DEBUG, "decode_base64 header Authorization: [", authorizationDecoded, "]")
    if not authorizationDecoded then
        ngx.log(ngx.DEBUG, "decode_base64 failed for ", authorization)
        ngx.exit(ngx.HTTP_UNAUTHORIZED)
    end
    _, _, name, password = string.find(authorizationDecoded, "([^:]+):(.*)")

    if not name or not password then
        ngx.log(ngx.DEBUG, "name or password is nill")
        ngx.exit(ngx.HTTP_UNAUTHORIZED)
    end
    if UserService:checkPassword('Users', name, password) ~= true then
        ngx.log(ngx.DEBUG, "password check faild!")
        ngx.exit(ngx.HTTP_UNAUTHORIZED)
    end

    return name
end

function RestAPI:get()
    ngx.log(ngx.DEBUG, "RestAPI get: ", ngx.var.uri)

    local admin = self:authorizationCheck()
    local res, header
    local args = request:getArgsTbl()
    local payload = Request:getPayload()
    local jsonObj = util:jsonDecode(payload)
    ngx.log(ngx.DEBUG, "RestAPI get: ", payload)
    --restFulAPICheck(context .. '/' .. parentTable .. '/' .. table .. '/' .. module, ngx.HTTP_GET)
    --accessProfileCheck(admin, module, 'get')
   
    res, header = ObjectService:get(jsonObj.mkey, jsonObj.subKey, args, jsonObj.data)

    response:reply(res, header)
end

function RestAPI:post()
    ngx.log(ngx.DEBUG, "RestAPI post: ", ngx.var.uri)
    local user = self:authorizationCheck()
    local res, status
    local isFile
    local args = request:getArgsTbl()
    local contentType = request:getHeader("Content-Type")
    if contentType then 
        isFile = string.find(request:getHeader("Content-Type"), "multipart")
    end
    local payload = Request:getPayload()
  
    ngx.log(ngx.DEBUG, "RestAPI post: ", payload)
    local jsonObj = util:jsonDecode(payload)
    --http://localhost/api/v1.0
    --restFulAPICheck(context .. '/' .. parentTable .. '/' .. table .. '/' .. module, ngx.HTTP_POST)
    --accessProfileCheck(user, module, 'post')
    res, status = ObjectService:post(jsonObj.mkey, jsonObj.subKey, args, jsonObj.data, isFile)

    response:reply(res, nil, status)
end

function RestAPI:put()
    ngx.log(ngx.DEBUG, "RestAPI put: ", ngx.var.uri)
    local admin = self:authorizationCheck()
    local res
    local args = request:getArgsTbl()
    local payload = Request:getPayload()
    local jsonObj = util:jsonDecode(payload)
    ngx.log(ngx.DEBUG, "RestAPI put: ", payload)
    --restFulAPICheck(context .. '/' .. parentTable .. '/' .. table .. '/' .. module, ngx.HTTP_PUT)
    --accessProfileCheck(admin, module, 'put')
    res, status = ObjectService:put(jsonObj.mkey, jsonObj.subKey, args, jsonObj.data, isFile)
    response:reply(res, nil, status)
end

function RestAPI:delete()
    ngx.log(ngx.DEBUG, "RestAPI delete: ", ngx.var.uri)
    local admin = self:authorizationCheck()
    local res
    local uri = ngx.var.uri
    local args = request:getArgsTbl()
    local payload = Request:getPayload()
    local jsonObj = util:jsonDecode(payload)
    
    ngx.log(ngx.DEBUG, "RestAPI put: ", payload)
    --restFulAPICheck(context .. '/' .. parentTable .. '/' .. table .. '/' .. module, ngx.HTTP_DELETE)
    --accessProfileCheck(admin, module, 'delete')

    res = ObjectService:delete(jsonObj.mkey, jsonObj.subKey, args, jsonObj.data)
    response:reply(res)
end

return util:inherit(RestAPI, ctrlBase)
