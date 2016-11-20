--@ author: wwliu
--@ date: 2015-6-25
--@ service logic module

local util = loadMod("core.util")
local exception = loadMod("core.exception")
local serviceBase = loadMod("core.base.service")
local sysConf = loadMod("config.system")
local refMap = loadMod("config.refMap")
--local systemst = loadMod("config.systemst")
local ffi                = require 'ffi'
local ffi_new            = ffi.new
local ffi_cdef           = ffi.cdef
local ffi_typeof         = ffi.typeof
local ffi_cast           = ffi.cast
local ffi_load           = ffi.load
local ffi_string         = ffi.string
local ffi_fill           = ffi.fill

local fwmsysst            = ffi.load("fwmsysst")

local int_t              = ffi_typeof("int")
local int_arr_t          = ffi_typeof("int[?]")
local uintptr_t          = ffi_typeof("uintptr_t")
local c_str_t            = ffi_typeof("char *")
local char_arr_t         = ffi_typeof("char [?]")
local c_str_arr_t        = ffi_typeof("const char *[?]")

ffi.cdef[[
typedef struct {
    char sn[16 + 1];
    char liclimit[32];
    char vmLicense[64];
}st_license_info;
char * get_hostname();
char * get_serialnum();
char * get_hastatus();
char * get_systemtime();
char * get_fwmver();
char * get_systemuptime();
char * get_vmlicense();
int get_sys_cpu_usage_rate();
int get_sys_memory_usage_rate();
int get_sys_logdisk_usage_rate();
char * get_network_name_by_num(int n);
char * get_network_alias_by_num(int n);
char * get_network_mask_by_num(int n);
int get_network_num();
char * get_sys_name();
char * get_network_speedDuplex_by_num(int n);
char * get_network_id_by_num(int n);
int get_network_tx_by_num(int n);
int get_network_rx_by_num(int n);
char * get_network_link_by_num(int n);
char * get_lic_limit();
void get_fwm_license_info(st_license_info *lic);
int system_shutdown(char *reason);
int system_reboot(char *reason);
int system_reset();
]]

local Sysstatus = {
    DBACC_NAME = "device",
}

local function get_ManagerStatus()
    ngx.log(ngx.DEBUG, "start call get_ManagerStatus \n")
    local tab = {}
    local resp = {}

    local licinfo = ffi_new("st_license_info")
    fwmsysst.get_fwm_license_info(licinfo)
    ngx.log(ngx.DEBUG,"*********", ffi.string(licinfo.vmLicense), "***", ffi.string(licinfo.liclimit), "***", ffi.string(licinfo.sn), "**\n")

    resp.id = 1
    resp._id = "ManagerStatus"
    resp.hostName = ffi.string(fwmsysst.get_hostname())
    resp["serialNumber"] = ffi.string(licinfo.sn)
    resp["haStatus"] = ffi.string(fwmsysst.get_hastatus())
    resp["firmwareVersion"] = ffi.string(fwmsysst.get_fwmver())
    resp["systemUptime"] = ffi.string(fwmsysst.get_systemuptime())
    resp["systemTime"] = ffi.string(fwmsysst.get_systemtime())
    resp["vmLicense"] = ffi.string(licinfo.vmLicense)
    resp["licenseLimit"] = ffi.string(licinfo.liclimit)

    table.insert(tab, resp)
    return tab
end

local function get_ManagerSystemResources()
    ngx.log(ngx.DEBUG, "start call get_ManagerSystemResources \n")
    local tab = {}
    local resp = {}

    resp.id = 1
    resp._id = "ManagerSystemResources"
    resp.cpu = fwmsysst.get_sys_cpu_usage_rate()
    resp.mem = fwmsysst.get_sys_memory_usage_rate()
    resp.diskUsage = fwmsysst.get_sys_logdisk_usage_rate()

    table.insert(tab, resp)
    return tab
end

local function get_ManagerStatusOperation()
    ngx.log(ngx.DEBUG, "start call  get_ManagerStatusOperation \n")
    local tab = {}
    local resp = {}

    resp.name = ffi.string(fwmsysst.get_sys_name())
    resp._id = "ManagerStatusOperation"
    resp.id = 1
    resp.network = {}

    local num = fwmsysst.get_network_num()

    for i = 0, num - 1 do
        local sub_resp = {}
        sub_resp.ip_netmask = ffi.string(fwmsysst.get_network_mask_by_num(ffi_cast(int_t, i)))
        sub_resp.link = ffi.string(fwmsysst.get_network_link_by_num(ffi_cast(int_t, i)))
        sub_resp.rx = fwmsysst.get_network_rx_by_num(ffi_cast(int_t, i))
        sub_resp.tx = fwmsysst.get_network_tx_by_num(ffi_cast(int_t, i))
        sub_resp.label = i + 1
        sub_resp.id = ffi.string(fwmsysst.get_network_id_by_num(ffi_cast(int_t, i)))
        sub_resp.speedDuplex = ffi.string(fwmsysst.get_network_speedDuplex_by_num(ffi_cast(int_t, i)))
        sub_resp.name = ffi.string(fwmsysst.get_network_name_by_num(ffi_cast(int_t, i)))
        sub_resp.alias = ffi.string(fwmsysst.get_network_alias_by_num(ffi_cast(int_t, i)))
        table.insert(resp.network, sub_resp)
    end

    table.insert(tab, resp)

    return tab
end

local function post_system_reboot(_id, doc)
    local tab = {}
    local resp = {}

    fwmsysst.system_reboot(ffi_cast(c_str_t, doc.reason))
    resp._id = _id
    resp.msg = "reboot success"

    table.insert(tab, resp)

    return tab
end

local function post_system_shutdown(_id, doc)
    local tab = {}
    local resp = {}

    fwmsysst.system_shutdown(ffi_cast(c_str_t, doc.reason))
    resp._id = _id
    resp.msg = "shutdown success"

    table.insert(tab, resp)

    --return {status=201, msg="shutdown success"}
    return tab
end

local function post_system_reset(_id)
    local tab = {}
    local resp = {}

    fwmsysst.system_reset()

    resp._id = _id
    resp.msg = "reset success"

    table.insert(tab, resp)

    --return {status=201, msg="shutdown success"}
    return tab
end

function Sysstatus:get(module, args, _id, subModule)
    local key, val, res
    if _id ~= "" and subModule == "" then
        exception:raise("core.badCall", {
            errMsg = "there should be subModule in your restfull API.",
        })
    end

    local col = refMap[module] or module
    local qry = _id == "" and {parentID = {["$exists"] = false}} or {parentID = _id}

    if args then
        for key, val in pairs(args) do
            if key ~= "module" and key ~= "subModule" and key ~= "id" and key ~= "subId" then
                qry[key] = val
            end
        end
    end

    if col == "ManagerStatus" then
        res = get_ManagerStatus()
    elseif col == "ManagerSystemResources" then
        res = get_ManagerSystemResources()
    elseif col == "ManagerStatusOperation" then
        res = get_ManagerStatusOperation()
    end

    return table.getn(res) == 0 and '[]' or res

end


function Sysstatus:post(module, args, jsonStr, _id, subModule)
    local res

    local doc = util:jsonDecode(jsonStr)

    if module == "ManagerStatusOperationReboot" then
        res = post_system_reboot(_id, doc)
    elseif module == "ManagerStatusOperationShutdown" then
        res = post_system_shutdown(_id, doc)
    elseif module == "ManagerStatusOperationReset" then
        res = post_system_reset(_id)
    end

    return table.getn(res) == 0 and '[]' or res
end


function Sysstatus:put(module, args, jsonStr, _id, subModule, subId)
    local tab = {}
    return tab
end

return serviceBase:inherit(Sysstatus):init()
