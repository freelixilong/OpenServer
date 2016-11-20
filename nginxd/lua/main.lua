
_G.NULL = ngx.null

_G.loadMod = function(namespace)
    -- ngx.log(ngx.WARN, "load " .. namespace .. " model")
    return require(ngx.var.SERVER_DIR .. ".lua." .. namespace)
end

_G.saveMod = function(namespace, model)
    package.loaded[ngx.var.SERVER_DIR .. ".lua." .. namespace] = model
end

-- starting the request process
_G.loadMod("core.app"):run()


