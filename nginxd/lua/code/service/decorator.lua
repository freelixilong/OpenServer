--@ author: wwliu
--@ date: 2015-7-15
--
--
local moduleFilter = loadMod("config.gui2cliFilter")
local mongodb = loadMod("core.driver.mongodb")
local fileType2NameMap = {
    ["00001"] = "GIF",    
    ["00002"] = "JPG", 
    ["00010"] = "BMP", 
    ["00018"] = "PNG", 
    ["00019"] = "TIFF/TIF", 
    ["00023"] = "Windows Metafile Format(.wmf)", 
    ["00024"] = "Corel Draw Picture", 
    ["00028"] = "Windows Icon", 
    ["00030"] = "Microsoft Document Image(.mdi)", 
    ["00032"] = "Windows Enhanced Metafile(.emf)", 
    ["00038"] = "Photoshop Image File(.psd)", 
    ["00050"] = "JPEG-2000 Image File Format(.jp2)", 
    ["00054"] = "Multipage PCX Bitmap File(.dcx)", 
    ["00060"] = "Word(.docx)", 
    ["00061"] = "Word Macro-Enabled(.docm)", 
    ["00062"] = "Word Template(.dotx)", 
    ["00063"] = "Word Macro-Enabled Template(.dotm)", 
    ["00064"] = "Excel(.xlsx)",
    ["00065"] = "Excel Macro-Enabled(.xlsm)",
    ["00066"] = "Excel Template(.xltx)", 
    ["00067"] = "Excel Macro-Enabled Template(.xltm)", 
    ["00068"] = "Excel Add-In(.xlam)",
    ["00069"] = "PPT(.pptx)", 
    ["00070"] = "PPT Macro-Enabled(.pptm)", 
    ["00071"] = "PPT Template(.potx)",
    ["00072"] = "PPT Macro-Enabled Template(.potm)", 
    ["00073"] = "PPT Add-In(.ppam)", 
    ["00074"] = "PPT Show(.ppsx)",  
    ["00075"] = "PPT Macro-Enabled Show(.ppsm)",    
    ["00076"] = "Visio Drawing(.vsdx)", 
    ["00077"] = "Visio Macro-Enabled Drawing(.vsdm)", 
    ["00078"] = "Visio Stencil(.vssx)", 
    ["00079"] = "Visio Macro-Enabled Stencil(.vssm)", 
    ["00080"] = "Visio Template(.vstx)", 
    ["00081"] = "Visio Macro-Enabled Template(.vstm)", 
    ["00003"] = "PDF", 
    ["00004"] = "XML", 
    ["00021"] = "CHM", 
    ["00022"] = "EXE", 
    ["00026"] = "RTF", 
    ["00036"] = "Windows Help File(.hlp)", 
    ["00042"] = "Windows Mobile Note(.pwi)", 
    ["00043"] = "Windows Registry Text(.reg)", 
    ["00046"] = "SQL Server 2000 Database(.mdf)",
    ["00047"] = "Java Archive(.jar)", 
    ["00048"] = "Windows Printer Spool File(.shd)",
    ["00049"] = "Windows Shortcut File(.lnk)",
    ["00051"] = "Quark Express Document(.qxd)",
    ["00053"] = "Windows MS Info File(.mof)",
    ["00055"] = "Microsoft Access Database(.MDB)",
    ["00056"] = "SPSS Data(.SAV)",
    ["00083"] = "RedHat Package Manager file(.RPM)",
    ["00082"] = "VMware Virtual Disk File(.vmdk)",
    ["00084"] = "Lotus WordPro document(.LWP)",
    ["00085"] = "Adobe encapsulated PostScript file(.EPS)",
    ["00086"] = "Lotus 1-2-3 spreadsheet(.WK)",
    ["00087"] = "SkinCrafter skin file(.skf)",
    ["00088"] = "Nero CD Compilation(.NRI)",
    ["00005"] = "MP3",
    ["00006"] = "MIDI",
    ["00007"] = "WAVE",
    ["00016"] = "AVI",
    ["00031"] = "Apple CoreAudio(.caf)",
    ["00037"] = "Microsoft Advanced Streaming(.asf)",
    ["00039"] = "Real Audio File(.ra)",
    ["00044"] = "Apple Lossless Audio(.m4a)",
    ["00052"] = "Digital Speech Standard(.dss)",
    ["00011"] = "Real Media File(.rm)",
    ["00012"] ="MPEG v4",
    ["00013"] ="3GPP",
    ["00014"] = "WAVE",
    ["00015"] = "AVI",
    ["00020"] = "Macromedia Flash",
    ["00035"] = "Windows Animated Cursor",
    ["00045"] ="DVD Video Movie File(.vob)",
    ["00008"] = "RAR",
    ["00009"] = "ZIP",
    ["00017"] = "TAR",
    ["00025"] = "7-ZIP",
    ["00027"] = "Debian Package",
    ["00029"] = "Microsoft Cabinet File",
    ["00033"] = "Unix Archiver File(.ar)",
    ["00034"] = "Installshield Cabinet Archive Data",
    ["00040"] = "AIN Archive Data(.ain)",
    ["00041"] = "BZIP2 Archive(.bz2)",
    ["00057"] = "WinZIP ZIPX Archive(ZIPx)",
    ["00058"] = "Gzipped Tape Archive(TGZ)",
}
local getSignatureNameById = function (picker)
    local strName = ''
    local elem = ''
    if picker == nil then 
        return strName
    end
    for _, elem in ipairs(picker) do
        if elem == '0' then
            strName = strName ..' REQUEST_FILENAME'
        elseif elem == '1' then
            strName = strName ..' REQUEST_URI'
        elseif elem == '2' then
            strName = strName ..' REQUEST_HEADERS_NAMES'
        elseif elem == '3' then
            strName = strName ..' REQUEST_HEADER'
        elseif elem == '5' then
            strName = strName ..' REQUEST_COOKIES_NAMES'
        elseif elem == '6' then
            strName = strName ..' REQUEST_COOKIES'
        elseif elem == '7' then
            strName = strName ..' ARGS_NAMES'
        elseif elem == '8' then
            strName = strName ..' ARGS_VALUE'
        elseif elem == '9' then
            strName = strName ..' REQUEST_RAW_URI'
        elseif elem == '10' then
            strName = strName ..' REQUEST_BODY'
        elseif elem == '11' then
            strName = strName ..' HEADER_LENGTH'
        elseif elem == '12' then
            strName = strName ..' RESPONSE_BODY'
        elseif elem == '13' then
            strName = strName ..' RESPONSE_HEADER'
        elseif elem == '14' then
            strName = strName ..' CONTENT_LENGTH'
        elseif elem == '15' then
            strName = strName ..' BODY_LENGTH'
        elseif elem == '16' then
            strName = strName ..' RESPONSE_CODE'
        elseif elem == '17' then
            strName = strName ..' COOKIE_NUMBER'
        elseif elem == '18' then
            strName = strName ..' ARGS_NUMBER'
        end
    end
    return strName
end
local fileContentType2NameMap = {
    ["5"]  = "text/html",    
    ["7"]  = "text/plain", 
    ["13"] = "text/javascript", 
    ["9"]  = "text/css", 
    ["3"]  = "application/xml(or)text/xml",    
    ["2"]  = "application/soap+xml", 
    ["12"] = "application/javascript", 
    ["10"] = "application/x-javascript", 
} 
local allowMethodExcepMap = {
    ["1"]   = "GET",
    ["2"]   = "POST",    
    ["4"]   = "HEAD", 
    ["8"]   = "OPTIONS", 
    ["16"]  = "TRACE", 
    ["32"]  = "CONNECT",    
    ["64"]  = "DELETE", 
    ["128"] = "PUT", 
    ["-2147483648"] = "OTHERS", 
} 
local getAllowMethodExcep = function(arrExcep)
    local  str = ''
    if arrExcep ~= nil then
        for _, item in ipairs(arrExcep) do
            str = str..' '..allowMethodExcepMap[item]
        end
    end
    return str
end
local getExceptionCount = function(module, _id)
        local qry = {parentID = _id}
        local res = mongodb:getMul(module, qry)
        if nil == res then
            return 0
        else
            return #res
        end
end
local getSignatureGlobalDisable = function ()
    local result = mongodb:getOne("BaseSignatureDisable", {_id = "BaseSignatureDisable"})
    local sigList = result["disable_list"] and result["disable_list"] or {}
    local ncount = table.getn(sigList) 
    return ncount
end

return {
    HTTPContentRoutingPolicy = function(res)
        for _, sub in ipairs(res) do
            if moduleFilter:keyFilter("HTTPContentRoutingPolicySub", sub, "matchExpression") == false then
                sub['matchExpression'] = ''
            end
            if moduleFilter:keyFilter("HTTPContentRoutingPolicySub", sub, "nameMatch") == false then
                sub['nameMatch'] = ''
            end
            if moduleFilter:keyFilter("HTTPContentRoutingPolicySub", sub, "valueMatch") == false then
                sub['valueMatch'] = ''
            end

            if sub['matchObject'] ~= '7' or sub['ipCondition'] == '6' then
                sub['sourceIP'] = ''
            end
            if sub["matchObject"] == '7' and sub["ipCondition"] ~= '6'then --when get frome web, this segment need construct
                if sub["startIP"]~= nil and sub["startIP"]~= '' and sub["startIP"] ~= sub["endIP"] then
                    sub['sourceIP'] = sub['startIP'] .. '-'.. sub['endIP']
                elseif sub["startIP"]~= nil and sub["startIP"]~= '' and sub["startIP"] == sub["endIP"] then
                    sub['sourceIP'] = sub['startIP']
                end
            end
        end
        return res
    end,
    AuthenticationRule = function(res)
        for _, sub in ipairs(res) do
            if sub["parentID"] ~='' then
                if moduleFilter:keyFilter("AuthenticationRuleSub", sub, "userGroupBasic") then
                   sub['userGroup'] = sub["userGroupBasic"]
                elseif moduleFilter:keyFilter("AuthenticationRuleSub", sub, "userGroupDigest") then
                   sub['userGroup'] = sub["userGroupDigest"]
                elseif moduleFilter:keyFilter("AuthenticationRuleSub", sub, "userGroupNtlm") then
                   sub['userGroup'] = sub["userGroupNtlm"]
                end
                if moduleFilter:keyFilter("AuthenticationRuleSub", sub, "userRealm") ==false then
                    sub['userRealm'] =''
                end
            end
        end

        return res
    end,
    UserGroup = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub['userType'] == '1' then
                sub['dispName'] = sub['localName']
            elseif sub['userType'] == '2' then
                sub['dispName'] = sub['ldapName']
            elseif sub['userType'] == '3' then
                sub['dispName'] = sub['radiusName']
            elseif sub['userType'] == '4' then
                sub['dispName'] = sub['ntlmName']
            end
        end
        return res
    end,
    ServerPool = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if not sub.parentID then
                sub['dissingleServerOrServerBalance'] = sub['singleServerOrServerBalance']
                sub['disLoadBalancingAlgorithm'] = sub['loadBalancingAlgorithm']
                if sub['type'] ~= '1' then
                    sub['dissingleServerOrServerBalance'] = ''
                    sub['serverHealthCheck'] = ''
                    sub['disLoadBalancingAlgorithm'] = ''
                    sub['persistence'] = ''
                elseif sub['singleServerOrServerBalance'] ~= '2' then
                    sub['serverHealthCheck'] = ''
                    sub['disLoadBalancingAlgorithm'] = ''
                    sub['persistence'] = ''
                end
            else
                if sub['supertype'] == '1' then
                    if  sub['serverType1'] == '1' then
                        sub['domain'] = ''
                    elseif sub['serverType1'] == '2' then
                        sub['ip'] = ''
                    end
                    sub['status'] = sub['status1']
                else
                    sub['status'] = sub['status2']
                end
            end
        end
        return res
    end,
    Persistence = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub['type'] ~= '6' and sub['type'] ~= '9' and sub['type'] ~= '2' and sub['type'] ~= '10' then
                sub['cookieName'] = ''
            end
            if sub['type'] == '9' or sub['type'] == '10' then
                sub['timeout'] = ''
            end
        end
        return res
    end,
    CustomRule = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                if sub['type'] == '1' then
                    sub['visvalue'] = sub['sourceIPv4IPv6']
                elseif sub['type'] == '2' then
                    sub['visvalue'] = sub['regularExpression']
                elseif sub['type'] == '3' then
                    if sub['predefinedHeadername'] == '1' then
                        if sub['headerName'] == '0' then
                            sub['visvalue'] = 'Host'
                        elseif sub['headerName'] == '1' then
                            sub['visvalue'] = 'Connection'
                        elseif sub['headerName'] == '2' then
                            sub['visvalue'] = 'Authorization'
                        elseif sub['headerName'] == '3' then
                            sub['visvalue'] = 'X-Pad'
                        elseif sub['headerName'] == '4' then
                            sub['visvalue'] = 'Cookie'
                        elseif sub['headerName'] == '5' then
                            sub['visvalue'] = 'Referer'
                        elseif sub['headerName'] == '6' then
                            sub['visvalue'] = 'User-Agent'
                        elseif sub['headerName'] == '7' then
                            sub['visvalue'] = 'X-Forwarded-For'
                        elseif sub['headerName'] == '8' then
                            sub['visvalue'] = 'Accept'
                        end
                    else
                        sub['visvalue'] = sub['headerNameC']
                    end
                elseif sub['type'] == '4' then
                    sub['visvalue'] = sub['hTTPRequestLimitsec']
                elseif sub['type'] == '6' then
                    sub['visvalue'] = sub['transactionTimeout']
                elseif sub['type'] == '7' then
                    sub['visvalue'] = sub['httpResponseCode']
                elseif sub['type'] == '8' then
                    sub['visvalue'] = sub['packetIntervalTimeout']
                elseif sub['type'] == '11' then
                    sub['visvalue'] = sub['parameterName']
                elseif sub['type'] == '9' then
                    if sub['tracedBy'] == '1' then
                        sub['visvalue'] = 'Within ' .. sub['within'] .. ' seconds, ' .. sub['occurrence'] ..' occurrence, Traced by Source IP'
                    else
                        sub['visvalue'] = 'Within ' .. sub['within'] .. ' seconds, ' .. sub['occurrence'] ..' occurrence, Traced by User'
                    end
                elseif sub['type'] == '12' then
                	sub['visvalue'] = sub["userName"]
                end
            end
        end
        return res
    end,
    ServerHealthCheck = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub['protocolType'] == 'icmp' or sub['protocolType'] == 'tcp' then
                sub['uRLPath'] = ''
            elseif sub['protocolType'] == 'http' or sub['protocolType'] == 'https' then
                if sub['method'] == 'head' then
                    sub['disMatchType'] = sub['headType']
                else 
                    sub['disMatchType'] = sub['getPostType']
                end

                if sub['disMatchType'] == 'reponse-code' then
                    sub['disMatchType'] = 'Response Code'
                elseif sub['disMatchType'] == 'match-content' then
                    sub['disMatchType'] = 'Matched Content'
                else
                    sub['disMatchType'] = 'All'
                end
            end
        end
        return res
    end,
    ParameterValidationRule = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub['useTypeCheck'] == true and sub['argumentType'] == '1' then
                sub['disdataType'] = sub['dataType']
            else
                sub['disdataType'] = nil
            end
        end
        return res
    end,
    Custom = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            sub['detail'] = 'TCP/' .. sub['port']
        end
        return res
    end,
    AdminGroup = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub['userType'] == '2' then
                sub['dispName'] = sub['ldapName']
            elseif sub['userType'] == '3' then
                sub['dispName'] = sub['radiusName']
            end
        end
        return res
    end,
    Signatures = function (res, exceptionCount)
        local tab = nil
        for _, tab in ipairs(res) do
            local k = nil
            local v = nil
            tab["mainClassEnabledCount"] = 0
            tab["subClassDisabledCount"] = 0
            for k,v in pairs(tab) do
                if tab[k] ~= nil and type(tab[k]) == "table" and tab[k]["status"] == true then
                    tab["mainClassEnabledCount"] = tab["mainClassEnabledCount"] + 1
                end
                if tab[k] ~= nil and type(tab[k]) == "table" and tab[k].subClass ~= nil then
                    local len = table.getn(tab[k].subClass)
                    tab["subClassDisabledCount"] = tab["subClassDisabledCount"] +len
                end
            end
            tab["alertOnlyCount"] = 0
            if tab["alert_only_list"] ~= nil then
                tab["alertOnlyCount"] = #tab["alert_only_list"]
            end
            tab["signatureDisabledCount"] = 0
            if tab["signature_disable_list"] ~= nil then
                tab["signatureDisabledCount"] = #tab["signature_disable_list"]
            end
            tab["signatureDisabledCount"] = tab["signatureDisabledCount"] + getSignatureGlobalDisable()
            tab["exceptionCount"] = getExceptionCount("Signatures", tab["_id"])           
        end
        return res
    end,
    AttacksSignaturesAdvanced = function (res)
        if res~= nil then 
            local tab = nil
            if type(res) == "table" then
                for _, tab in ipairs(res) do
                    if tab.parentID ~= nil then
                        if tab["elementType"] == "3" or tab["elementType"] == "4" or tab["elementType"] == "5" then
                            if tab["operation"] == "5" then
                                tab["value"] = tab["valueTxt"]
                            else
                                tab["value"] = tab["valueReg"]
                            end
                        elseif tab["elementType"] == "6" or  tab["elementType"] == "7" then
                            if tab["checkValue"] == true then
                                if tab["operation"] == "5" then
                                    tab["value"] = tab["valueTxt"]
                                else
                                    tab["value"] = tab["valueReg"]
                                end
                            else
                                tab["value"] = ""
                            end
                        elseif tab["elementType"] == "2" then
                            tab["value"] = tab["clientIp"]
                        else
                            tab["value"] = ""
                        end
                    end
                end
            end
        end
        return res
    end,
    CustomSignature = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                sub.value = getSignatureNameById(sub.picker)             
            end
        end
        return res
    end,
    HTTPProtocolConstraints = function(res)
        local tab = nil
        for _, tab in ipairs(res) do
            tab.headerLengthText = tab.headerLength.value
            tab.contentLengthText = tab.contentLength.value
            tab.bodyLengthText = tab.bodyLength.value
        end
        return res
    end,
    URLAccessPolicy = function (res)
        local sub = nil
        local id =1
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                sub.iD = id
                id = id + 1
            end
        end
        return res
    end,
    URLAccessRule = function (res)
        local sub = nil
        local id =1
        for _, sub in ipairs(res) do
            if sub.parentID == nil then
                sub.disaction = sub.action
                id = id + 1
            else 
                sub.disurlType = sub.urlType
                sub.dismatch = (sub.sourceAddress and sub.meetthisconditionif2) or sub.meetthisconditionif
            end
        end
        return res
    end,
    StartPages = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                sub.dishostStatus = sub.hostStatus
                sub.distype = sub.type
                sub.disdefault = sub.default 
            end
        end
        return res
    end,
    PageAccess = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                sub.iD = sub.id
            end
        end
        return res
    end,
    IPList = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                sub.iD = sub.id
            end
        end
        return res
    end,
    GeoIP = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                sub.value = sub.realId 
            end
        end
        return res
    end,
    GeoIPExceptions = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                sub.iD = sub.id 
            end
        end
        return res
    end,
    FileUploadRestrictionRule = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                sub.value = fileType2NameMap[sub.realId] 
            end
        end
        return res
    end,
    URLCertificate = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                if sub.match == true then
                    sub.dispType = 'Require'  
                else 
                    sub.dispType = ''  
                end 
            end
        end
        return res
    end,
    URLRewritingRule = function(res)
        return res
    end,
    FileCompressPolicy = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                sub.contentType = fileContentType2NameMap[sub.realId]     
            end
        end
        return res
    end,
    FileUncompressPolicy = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                sub.contentType = fileContentType2NameMap[sub.realId]     
            end
        end
        return res
    end,
    AllowMethodExceptions = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub.parentID ~= nil and sub.parentID ~= '' then
                if sub.hostStatus ~=  true then
                    sub.host = ''
                end
                sub.disallowMethodException = getAllowMethodExcep(sub["allowMethodException"])     
            end
        end
        return res
    end,
    Vzone = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            sub.interfaceName = table.concat(sub.interface, ' ')
        end
        return res
    end,
    EmailPolicy = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            sub.smtp_passwd = "******"
        end
    end,
    SNI = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            sub.can_del = sub.can_delete
        end
        return res
    end,
    
    VirtualServer = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            sub.enable = sub.status
        end
    end,
    Predefined = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            sub['detail'] = 'TCP/' .. sub['port']
        end
        return res
    end,
    SensitiveDataLogging = function(res)
        local index, sub
        for index, sub in ipairs(res) do
            sub['_id'] = sub['id']
            sub['name'] = sub['id']
            sub['id'] = index
        end
        return res
    end,
    OtherLogSettings = function(res)
        local packetLogMap = {
            ["parameter-rule-failed"] = "pararuleviolation",
            ["hidden-fields-failed"] = "hidfieldsviolation",
            ["http-protocol-constraints"] = "httpprotocol",
            ["signature-detection"] = "signaturedetection",
            ["custom-protection-rule"] = "customsignaturedetection",
            ["anti-virus-detection"] = "antivirusdetection",
            ["custom-access"] = "customaccessviolation",
            ["illegal-xml-format"] = "illegalxmlformat",
            ["ip-intelligence"] = "ipreputationviolation",
            ["illegal-file-type"] = "illegalfiletype",
            ["cookie-poison"] = "cookiepoison",
            ["padding-oracle"] = "paddingoracle",
            ["fsa-detection"] = "fortiSandboxDetection",
        }
        if res.packetLog then
            for cliKey, guiKey in pairs(packetLogMap) do
                if string.find(res.packetLog, cliKey, 1, true) then
                    res[guiKey] = true
                else
                    res[guiKey] = false
                end
            end
            res.packetLog = nil
        end
        return res
    end,
    DevicesGroups = function(res)
        local devices = mongodb:getMul("Devices", {parentID = {["$exists"] = false}})
        if type(next(res)) == "number" then
            for _, group in ipairs(res) do
                group["devices"] = {}
                for _, device in ipairs(devices) do
                    if device["addToGroups"] == "specific" and device["groups"] == group["name"] then
                        table.insert(group["devices"], device["name"])
                    end
                end
            end
        elseif type(next(res)) == "string" then
            res["devices"] = {}
            for _, device in ipairs(devices) do
                if device["addToGroups"] == "specific" and device["groups"] == res["name"] then
                    table.insert(res["devices"], device["name"])
                end
            end
        end
    end,
    AuthenticationServerPool = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub['server-type'] == 'ldap' then
                sub['radius-server'] = ''
                sub['rsa-securid'] = nil
            elseif sub['server-type'] == 'radius' then
                sub['ldap-server'] = ''
            end
        end
        return res
    end,
    FireWallAddress = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub['type'] == 'ip-netmask' then
                sub['ip-address-value'] = nil
            elseif sub['type'] == 'ip-range' then
                sub['ip-netmask'] = nil
            end
        end
        return res
    end,
    FireWallService = function(res)
        local sub = nil
        for _, sub in ipairs(res) do
            if sub['protocol'] == 'ICMP' then
                sub['source-port-min'] = nil
                sub['source-port-max'] = nil
                sub['destination-port-min'] = nil
                sub['destination-port-max'] = nil
            end
        end
        return res
    end
}
