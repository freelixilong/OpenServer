_G.loadMod = function(namespace)
    return require(ngx.var.SERVER_DIR .. ".lua." .. namespace)
end

ngx.log(ngx.DEBUG, "access ************** checker ")

loadMod("core.base.ctrl"):getSessionInfo(true)
