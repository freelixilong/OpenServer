--@ author: zhouxuehao
--@ date: 2015-4-7
--@ service module base

local exception = loadMod("core.exception")

local ServiceBase = {
    --- 数据访问模块名
    DBACC_NAME = nil,

    --- 数据访问模块实例
    dbmodule = nil,

    -- 缓存访问模块
    cacheHelper = nil,
}

-- @return table 业务逻辑模块
function ServiceBase:init()

    if not self.DBACC_NAME then
        exception:raise("core.badConfig", { DBACC_NAME = self.DBACC_NAME })
    end

    self.dbmodule = loadMod("code.data." .. self.DBACC_NAME)
    self.cacheHelper = self.CACHE_HELPER

    return self
end

-- @param table module 模块
-- @return table 模块
function ServiceBase:inherit(module)
    -- here self means the ServiceBase 
    module.__super = self

    return setmetatable(module, {
        __index = function(self, key)
            if self.__super[key] then
                return self.__super[key]
            end

            if type(self.dbmodule[key]) == "function" then
                -- change the ctx for the self.dbmodule[key] module method
                return function(...)
                    local args = { ... }
                    -- args[1] means self in self.dbmodule[key]
                    args[1] = self.dbmodule

                    return self.dbmodule[key](unpack(args))
                end
            end

            return nil
        end
    })
end

return ServiceBase
