/*
	author by qxyang
*/

;
(function(app) {
	//hrefURL: #navigate/DeviceManager/DevicesGroups/AllFortiWeb
	app.getOnlineHelpUrl = function(hrefURL) {
		var urlMap = {
			//DeviceManager ---> dm
			"DeviceManager" : "devicemanager",
			
			"DeviceManager/DevicesGroups/AllFortiWeb"        : "interface_list",
			"DeviceManager/DevicesGroups/Devices"            : "devices",
			"DeviceManager/Device/AddGroup"                  : "add_group",
			"DeviceManager/Device/EditGroup"                 : "edit_group",
			"DeviceManager/DeviceGroup/GroupUpgrade"         : "group_upgrade",
			"DeviceManager/Device/AddDevice"                 : "add_device",
			"DeviceManager/Device/EditDevice"                : "edit_device",
			"DeviceManager/Device/DeviceUpgrade"             : "device_upgrade",
			"DeviceManager/DevicesGroups/FirmwareManagement" : "fw_management",

			"DeviceManager/ProvisioningTemplates/SystemTemplates"                      : "sys_template",
			"DeviceManager/ProvisioningTemplatesDropdownMenu/CreateNewTemplate"        : "add_template",
			"DeviceManager/ProvisioningTemplatesDropdownMenu/CreateTemplateFromDevice" : "add_template_from",
			"DeviceManager/ProvisioningTemplatesDropdownMenu/EditTemplate"             : "edit_template",
			"DeviceManager/ProvisioningTemplatesDropdownMenu/AssignedDevices"          : "assign_template",

			//PolicyObjects ---> po
			"PolicyObjects" : "policyobjects",

			"PolicyObjects/PolicyPackageMenu"                              : "policy_packages",
			"PolicyObjects/Policy/CreateNewPolicyPackage"                  : "add_package",
			"PolicyObjects/Policy/Install"                                 : "install_package",
			"PolicyObjects/Policy/CreateNewPolicyForReverseProxy"          : "add_rp",
			"PolicyObjects/Policy/CreateNewPolicyForOfflineProtection"     : "add_off",
			"PolicyObjects/Policy/CreateNewPolicyForTrueTransparentProxy"  : "add_ttp",
			"PolicyObjects/Policy/CreateNewPolicyForTransparentInspection" : "add_tti",
			"PolicyObjects/Policy/CreateNewPolicyForWCCP"                  : "add_wccp",

			"PolicyObjects/Objects/System/Network/ObjectsInterface"         : "interface",
			"PolicyObjects/Objects/System/Network/Vzone"                    : "vzone",
			"PolicyObjects/Objects/System/Certificates/Local"               : "local",
			"PolicyObjects/Objects/System/Certificates/SNI"                 : "sni",
			"PolicyObjects/Objects/System/Certificates/CA"                  : "ca",
			"PolicyObjects/Objects/System/Certificates/CAGroup"             : "cagroup",
			"PolicyObjects/Objects/System/Certificates/IntermediateCA"      : "interca",
			"PolicyObjects/Objects/System/Certificates/IntermediateCAGroup" : "interca_grp",
			"PolicyObjects/Objects/System/Certificates/CRL"                 : "crl",
			"PolicyObjects/Objects/System/Certificates/CertificateVerify"   : "certverify",
			"PolicyObjects/Objects/System/Certificates/URLCertificate"      : "urlcert",

			"PolicyObjects/Objects/ServerOjbects/Server/VirtualServer"                  : "vserver",
			"PolicyObjects/Objects/ServerOjbects/Server/ServerPool"                     : "server_pool",
			"PolicyObjects/Objects/ServerOjbects/Server/ServerHealthCheck"              : "health_check",
			"PolicyObjects/Objects/ServerOjbects/Server/Persistence"                    : "persistence",
			"PolicyObjects/Objects/ServerOjbects/Server/HTTPContentRoutingPolicy"       : "http_content_policy",
			"PolicyObjects/Objects/ServerOjbects/ProtectedHostnames/ProtectedHostnames" : "protected_host",
			"PolicyObjects/Objects/ServerOjbects/Service/Predefined"                    : "predefined",
			"PolicyObjects/Objects/ServerOjbects/Service/Custom"                        : "custom",
			"PolicyObjects/Objects/ServerOjbects/XForwardedFor/XForwardedFor"           : "xforwardedfor",

			"PolicyObjects/Objects/User/UserGroup/UserGroup"       : "usergroup",
			"PolicyObjects/Objects/User/UserGroup/AdminGroup"      : "admingroup",
			"PolicyObjects/Objects/User/LocalUser/LocalUser"       : "localuser",
			"PolicyObjects/Objects/User/RemoteServer/LdapServer"   : "ldapserver",
			"PolicyObjects/Objects/User/RemoteServer/RadiusServer" : "radiusserver",
			"PolicyObjects/Objects/User/RemoteServer/NtlmServer"   : "ntlmserver",

			"PolicyObjects/Objects/WebProtectionProfile/InlineProtectionProfile"  : "inline_profile",
			"PolicyObjects/Objects/WebProtectionProfile/OfflineProtectionProfile" : "offline_profile",

			"PolicyObjects/Objects/ApplicationDelivery/URLRewritingPolicy/URLRewritingPolicy"     : "urlrew_policy",
			"PolicyObjects/Objects/ApplicationDelivery/URLRewritingPolicy/URLRewritingRule"       : "urlrew_rule",
			"PolicyObjects/Objects/ApplicationDelivery/AuthenticationPolicy/AuthenticationPolicy" : "auth_policy",
			"PolicyObjects/Objects/ApplicationDelivery/AuthenticationPolicy/AuthenticationRule"   : "auth_rule",
			"PolicyObjects/Objects/ApplicationDelivery/SitePublish/SitePublishPolicy"             : "site_policy",
			"PolicyObjects/Objects/ApplicationDelivery/SitePublish/SitePublishRule"               : "site_rule",
			"PolicyObjects/Objects/ApplicationDelivery/SitePublish/KeytabFile"                    : "keytab",
			"PolicyObjects/Objects/ApplicationDelivery/Compression/FileCompressPolicy"            : "comp_policy",
			"PolicyObjects/Objects/ApplicationDelivery/Compression/FileUncompressPolicy"          : "uncomp_policy",
			"PolicyObjects/Objects/ApplicationDelivery/Compression/ExclusionRule"                 : "exclusion_rule",
			"PolicyObjects/Objects/ApplicationDelivery/Caching/WebCachePolicy"                    : "cache_policy",
			"PolicyObjects/Objects/ApplicationDelivery/Caching/WebCacheException"                 : "cache_exception",
			
			"PolicyObjects/Objects/WebProtection/KnownAttacks/Signatures"                     : "signatures",
			"PolicyObjects/Objects/WebProtection/KnownAttacks/CustomSignatureGroup"           : "custom_siggrp",
			"PolicyObjects/Objects/WebProtection/KnownAttacks/CustomSignature"                : "custom_sig",
			"PolicyObjects/Objects/WebProtection/AdvancedProtection/CustomPolicy"             : "custom_policy",
			"PolicyObjects/Objects/WebProtection/AdvancedProtection/CustomRule"               : "custom_rule",
			"PolicyObjects/Objects/WebProtection/AdvancedProtection/PaddingOracleProtection"  : "pad_oracle",
			"PolicyObjects/Objects/WebProtection/InputValidation/ParameterValidationPolicy"   : "paramvalid_policy",
			"PolicyObjects/Objects/WebProtection/InputValidation/ParameterValidationRule"     : "paramvalid_rule",
			"PolicyObjects/Objects/WebProtection/InputValidation/HiddenFieldsPolicy"          : "hidden_policy",
			"PolicyObjects/Objects/WebProtection/InputValidation/HiddenFieldsRule"            : "hidden_rule",
			"PolicyObjects/Objects/WebProtection/InputValidation/FileUploadRestrictionPolicy" : "fileup_policy",
			"PolicyObjects/Objects/WebProtection/InputValidation/FileUploadRestrictionRule"   : "fileup_rule",
			"PolicyObjects/Objects/WebProtection/Protocol/HTTPProtocolConstraints"            : "constraints",
			"PolicyObjects/Objects/WebProtection/Protocol/HTTPConstraintsException"           : "constraints_expt",
			"PolicyObjects/Objects/WebProtection/Access/BruteForce"                           : "bruteforce",
			"PolicyObjects/Objects/WebProtection/Access/URLAccessPolicy"                      : "access_policy",
			"PolicyObjects/Objects/WebProtection/Access/URLAccessRule"                        : "access_rule",
			"PolicyObjects/Objects/WebProtection/Access/PageAccess"                           : "pageaccess",
			"PolicyObjects/Objects/WebProtection/Access/StartPages"                           : "startpages",
			"PolicyObjects/Objects/WebProtection/Access/AllowMethodPolicy"                    : "allow_policy",
			"PolicyObjects/Objects/WebProtection/Access/AllowMethodExceptions"                : "allow_expt",
			"PolicyObjects/Objects/WebProtection/Access/IPList"                               : "iplist",
			"PolicyObjects/Objects/WebProtection/Access/GeoIP"                                : "geoip",
			"PolicyObjects/Objects/WebProtection/Access/GeoIPExceptions"                      : "geoip_expt",

			"PolicyObjects/Objects/DosProtection/Application/HTTPAccessLimit"             : "httpaccess_limit",
			"PolicyObjects/Objects/DosProtection/Application/MaliciousIPs"                : "mal_ips",
			"PolicyObjects/Objects/DosProtection/Application/HTTPFloodPrevention"         : "httpflood_prev",
			"PolicyObjects/Objects/DosProtection/Network/TCPFloodPrevention"              : "tcpflood_prev",
			"PolicyObjects/Objects/DosProtection/DoSProtectionPolicy/DoSProtectionPolicy" : "dosprot_policy",

			"PolicyObjects/Objects/AutoLearn/AutoLearnProfile/AutoLearnProfile"      : "autolearn_profile",
			"PolicyObjects/Objects/AutoLearn/PredefinedPattern/DataTypeGroup"        : "datatype_grp",
			"PolicyObjects/Objects/AutoLearn/PredefinedPattern/PredefinedDataType"   : "pre_datatype",
			"PolicyObjects/Objects/AutoLearn/PredefinedPattern/URLPattern"           : "url_pattern",
			"PolicyObjects/Objects/AutoLearn/PredefinedPattern/SuspiciousURL"        : "susurl",
			"PolicyObjects/Objects/AutoLearn/CustomPattern/CustomDataType"           : "cus_datatype",
			"PolicyObjects/Objects/AutoLearn/CustomPattern/SuspiciousURLPolicy"      : "susurl_policy",
			"PolicyObjects/Objects/AutoLearn/CustomPattern/SuspiciousURLRule"        : "susurl_rule",
			"PolicyObjects/Objects/AutoLearn/ApplicationTemplates/ApplicationPolicy" : "app_policy",
			"PolicyObjects/Objects/AutoLearn/ApplicationTemplates/URLReplacer"       : "urlreplacer",

			"PolicyObjects/Objects/LogReport/LogPolicy/EmailPolicy"         : "email_policy",
			"PolicyObjects/Objects/LogReport/LogPolicy/SyslogPolicy"        : "syslog_policy",
			"PolicyObjects/Objects/LogReport/LogPolicy/FortiAnalyzerPolicy" : "fortiana_policy",
			"PolicyObjects/Objects/LogReport/LogPolicy/SIEMPolicy"          : "siem_policy",
			"PolicyObjects/Objects/LogReport/LogPolicy/TriggerPolicy"       : "trigger_policy",

			//SystemSettings ---> ss
			"SystemSettings" : "systemsettings",

			"SystemSettings/ManagerStatus"   : "status",
			"SystemSettings/CMInterface"     : "interface",
			"SystemSettings/CMStaticRoute"   : "static_route",
			"SystemSettings/CMDNS"           : "dns",
			"SystemSettings/Users"           : "admin",
			"SystemSettings/CMSettings"      : "settings",
			"SystemSettings/CMBackupRestore" : "backup_restore",
			"SystemSettings/CMFTPBackup"     : "ftpbackup",
			"SystemSettings/CMSystemTime"    : "time",

			"SystemSettings/CMAdminGroup"    : "admingroup",
			"SystemSettings/CMLDAPServer"    : "ldapserver",
			"SystemSettings/CMRADIUSServer"  : "radiusserver",

			"SystemSettings/LogEvent"        : "eventlog",
			"SystemSettings/GroupUpgradeLog" : "upgradelog",
			"SystemSettings/AssignLog"       : "assignlog",
			"SystemSettings/InstallLog"      : "installlog",

			//FortiGuard ---> fg
			"FortiGuard" : "fortiguard",   
			"FortiGuard/LicensingStatus" : "lic_status",
			"FortiGuard/GroupFirmware"   : "firmware",
			"FortiGuard/GroupGeo"        : "geo",
		}; 
		var prefixMap = {
			"DeviceManager"  : "dm_",
			"PolicyObjects"  : "po_",
			"SystemSettings" : "ss_",
			"FortiGuard"     : "fg_",
		};

		var hrefArray = hrefURL.split("/");
		// remove #navigate
		hrefArray.shift();

		var prefix = prefixMap[hrefArray[0]];
		var urlResult;

		while (hrefArray.length) {
			urlResult = urlMap[hrefArray.join("/")]
			if (urlResult)
				break;
			hrefArray.pop();
		}

		return "http://help.fortinet.com/fweb-mgr/560/index.htm#cshid=" + prefix + urlResult;
	};
})(Application);