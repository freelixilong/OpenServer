
return {
    PROXY_BROWSER                     = "127.0.0.1",
    PROXY_PORT                        = "8088",

    DEBUG_MODE                        = false,
    SERVER_MARK                       = "cmgm",
    LOCKER_TIMEOUT                    = 6,
    COOKIE_ENABLE                     = true,
    DEFAULT_CHARSET                   = "UTF8",
    SESSION_EXPTIME                   = 900,
    SESSION_TOKEN_NAME                = "token",
    PASSWD_MIX_KEY                    = "cmgm is good",
    ADMIN                             = "admin",
    PASSWORD                          = "",
    IDSEP                             = "I",
    URISEP                            = "/",
    FILE_UPLOAD_DIR                   = "/var/log/nginxd/upload/",
    FIRMWARE_UPLOAD_DIR               = "/var/log/nginxd/groupDB/firmware/",
    GEO_UPLOAD_DIR                    = "/var/log/nginxd/groupDB/geo/", 
    FILEBLOCK                         = 4096,
    DEFAULT_GROUP                     = "All FortiWeb",
    CLI_DIRECT_VIEW_REST_API          = "/proxy/api/v1.0/cli-direct-view",
    BACKUPAPI                         = "/proxy/api/v1.0/System/Maintenance/BackupConfiguration",
    RESTOREAPI                        = "/proxy/api/v1.0/System/Maintenance/RestoreConfiguration",
    RESTORE_FILE_API                  = "/proxy/api/v1.0/System/Maintenance/ImportRestoreFile",
    RESTOREAPICHECKER                 = "/proxy/api/v1.0/System/Maintenance/RestoreConfigurationChecker",
    GROUP_UPLOAD_GEO                  = "/proxy/api/v1.0/System/Maintenance/BackupRestoreAnalytics",
    GROUP_UPGRADE_GEO                 = "/proxy/api/v1.0/System/Maintenance/DataAnalytics",
    GROUP_UPLOAD_FIRMWARE             = "/proxy/api/v1.0/System/Maintenance/UploadFirmware",
    GROUP_UPGRADE_FIRMWARE            = "/proxy/api/v1.0/System/Maintenance/FirmwareUpgradeDowngrade",
    POLICY_PACKAGE_DIR                = "PolicyObjects/PolicyPackageMenu/",
    GROUPS_MENU_DIR                   = "DeviceManager/DevicesGroups/AllFortiWeb/",
    DEVICES_MENU_DIR                  = "DeviceManager/DevicesGroups/Devices/",
    PROVISION_TEMPLATES_DIR           = "DeviceManager/ProvisioningTemplates/SystemTemplates/",
    DEFAULT_ENCRPT_FULL_CONFIG_PASSWD = "fortiweb_#h1l",
    LICENSE_PATH                      = "/data/config/cm/lic/cmgm.lic",
    LICENSE_CNT                       = 10,
    LIBC_MOD_PATH                     = "/fwbdev64/lib/",
    UPLOAD_IMAGE                      = "/tmp/upimage",
    SN_LEN                            = 16,
    COMPUTER_ID_LEN                   = 23,
    ACTIVATION_CODE_LEN               = 80,
    MONGO_NUM_EACH_QUERY              = 250,
    FASTMODULE = {
        Online = true,
        Status = true,
    },
    PROXYPRE = {
        NORMAL = "/proxy/api/v1.0/",
        FAST = "/fastproxy/api/v1.0/",
    },

    PORVISION_TEMPLATES_ITEM = {
        val               = "",
        icon              = "ygtvlabel l2_menu_application_templates",
        ul_type           = "template",
        can_delete        = "true",
        can_edit          = "true",
        can_assign        = "true",
        module            = ""
    },
    DEFAULT_DEVICES_GROUPS_MENU =  {
        val = "Devices & Groups",
        children = {{
            val = "All FortiWeb",
            childNumber = "0",
            ul_type = "group",
            can_delete = false,
            can_edit = false,
            can_upgrade = true,
            icon = "ygtvlabel l2_menu_sys_config",
            module = "DeviceManager/DevicesGroups/AllFortiWeb",
            children = {}
        }}
    },
    DEFAULT_PROVISIONING_TEMPLATES_MENU = {
        val = "Provisioning Templates",
        children = {{
            val = "System Templates",
            icon = "ygtvlabel l2_menu_sys_config",
            ul_type = "template",
            can_delete = false,
            can_edit = false,
            can_assign = false,
            children = {}
        }} 
    },
    DEFAULT_POLICY_PACKAGE_MENU = {{
        val = "Policy Package",
        children = {},
    }},
   
    LogLevel = {
        EMERGENCY = "emergency",
        CRITICAL = "critical",
        ERROR = "error",
        WARN = "warning",
        NOTICE = "notice",
        INFO = "information",
    },
    ProxyModule = {
        KeytabFile = {
            proxyURL           = "/cmgm/***",
            inMongodb          = true,
        },
    },
}
