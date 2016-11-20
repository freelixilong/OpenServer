local resty_string = require("resty.string")
local String = {}

-- @param string str
-- @return string
function String:trim(str)
    return (string.gsub(str, "^%s*(.-)%s*$", "%1"))
end

--- 使用SHA1加密字符串
--
-- @param string str
-- @return string
function String:sha1(str)
    return resty_string.to_hex(ngx.sha1_bin(str))
end

--- 返回首字母大写后的字符串
--
-- @param string str 原始字符串
-- @return string 首字母大写后的字符串
function String:capital(str)
    return (str:gsub("^%a", function(char)
        return char:upper()
    end))
end

function String:hex2string(hexStr)
    local str, n = hexStr:gsub("(%x%x)[ ]?", function (word)
        return string.char(tonumber(word, 16))
    end)
    return str
end

function String:encode(plainStr)
    plainStr, _ = string.gsub(plainStr, "%%", "%%%%")
    plainStr, _ = string.gsub(plainStr, "%+", "%%+")
    plainStr, _ = string.gsub(plainStr, "%-", "%%-")
    plainStr, _ = string.gsub(plainStr, "%*", "%%*")
    plainStr, _ = string.gsub(plainStr, "%?", "%%?")
    plainStr, _ = string.gsub(plainStr, "%^", "%%^")
    plainStr, _ = string.gsub(plainStr, "%$", "%%$")
    plainStr, _ = string.gsub(plainStr, "%.", "%%.")
    plainStr, _ = string.gsub(plainStr, "%(", "%%(")
    plainStr, _ = string.gsub(plainStr, "%)", "%%)")
    plainStr, _ = string.gsub(plainStr, "%[", "%%[")
    plainStr, _ = string.gsub(plainStr, "%]", "%%]")
    plainStr, _ = string.gsub(plainStr, "%|", "%%|")
    return plainStr
end

return String
