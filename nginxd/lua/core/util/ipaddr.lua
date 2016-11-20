local IpAddr = {}

function IpAddr:getIpMask(ipStr)
	ipStr = string.lower(ipStr)
	local _, _, ip, mask = string.find(ipStr, '([a-f0-9.:]+)/(%d+)')
	return ip, tonumber(mask, 10)
end

local function getIpV4StrNodes(ip)
	local _, _, d1, d2, d3, d4 = string.find(ip, '(%d+).(%d+).(%d+).(%d+)')
	local digits = {d1, d2, d3, d4}
	return digits
end

local function expandIpV4Str(ip4)
	local digits = getIpV4StrNodes(ip4)
	for k, v in ipairs(digits) do
		digits[k] = tonumber(v, 10)
	end
	return string.format("%03d.%03d.%03d.%03d", digits[1], digits[2], digits[3], digits[4])
end

local function expandIpV4StrHex(ip4)
	local digits = getIpV4StrNodes(ip4)
	for k, v in ipairs(digits) do
		digits[k] = tonumber(v, 10)
	end
	return string.format("%02x.%02x.%02x.%02x", digits[1], digits[2], digits[3], digits[4])
end

local function getIpV6StrNodes(ip6)
	ip6 = string.lower(ip6)
	local pos = string.find(ip6, '::')
	if pos then
		local cnt = 0
		local i=1
		while i < #ip6 do
			if string.sub(ip6, i, i) == ':' then cnt = cnt + 1 end
			i = i+1
		end
		cnt = cnt - 2
		ip6 = string.gsub(ip6, "::", string.rep(":0", 6-cnt) .. ":")
		if ':' == string.sub(ip6, 1, 1) then
			ip6 = '0' .. ip6
		end
	end
	local _, _, d1, d2, d3, d4, d5, d6, d7, d8 = string.find(ip6, string.rep("(%x+):", 7) .. "(%x+)")
	local digits = {d1, d2, d3, d4, d5, d6, d7, d8}
	return digits
end

local function expandIpV6Str(ip6)
	local digits = getIpV6StrNodes(ip6)
	for k, v in ipairs(digits) do
		digits[k] = tonumber(v, 16)
	end
	local fullIp = string.format(string.rep("%04x:", 7) .. "%04x", unpack(digits))
	return fullIp
end

local function oct2HexStr(octStr)
	return string.format("%x", tonumber(octStr, 10))
end

local function hexChar2BinStr(hexChr)
	local hex = tonumber(hexChr, 16)
	assert(0 <= hex and hex < 16)
	local binDigits={"0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111"}
	binDigits[0] = "0000"
	return binDigits[hex]
end

local function ipV4ToBinStr(ip)
	local ipStrHex = expandIpV4StrHex(ip)
	ipStrHex = string.gsub(ipStrHex, "[.]", "")
	local binStr = {}
	local i = 0
	while i < #ipStrHex do
		i = i+1
		binStr[#binStr + 1] = hexChar2BinStr(string.sub(ipStrHex, i, i))
	end
	local ret = table.concat(binStr, "")
	return ret
end


local function ipV6ToBinStr(ip)
	local ipStrHex = expandIpV6Str(ip)
	ipStrHex = string.gsub(ipStrHex, ":", "")
	local binStr = {}
	local i = 0
	while i < #ipStrHex do
		i = i+1
		local chr = string.sub(ipStrHex, i, i)
		binStr[i] = hexChar2BinStr(chr)
	end
	local ret = table.concat(binStr, "")
	return ret
end

function IpAddr:getSubNet6(ip, mask)
	local binStr = ipV6ToBinStr(ip)
	local maskStr = {}
	binStr = string.sub(binStr, 1, mask) .. string.rep('0', 128-mask)
	local v = 0
	local i = 1
	while i < #binStr do
		v = tonumber(string.sub(binStr, i, i+16-1), 2)
		maskStr[#maskStr +1] = string.format("%04x", v)
		i = i+16
	end
	local subnet = table.concat(maskStr, ":")
	return subnet
end

function IpAddr:getSubNet4(ip, mask)
	local binStr = ipV4ToBinStr(ip)
	local maskStr = {}
	binStr = string.sub(binStr, 1, mask) .. string.rep('0', 32-mask)
	local v = 0
	local i = 1
	while i < #binStr do
		v = tonumber(string.sub(binStr, i, i+8-1), 2)
		maskStr[#maskStr +1] = string.format("%03d", tostring(v, 10))
		i = i+8
	end
	local subnet = table.concat(maskStr, ".")
	return subnet
end

function IpAddr:isSameSubnet4(ipmask1, ipmask2)
	local ip1, mask1 = self:getIpMask(ipmask1)
	local ip2, mask2 = self:getIpMask(ipmask2)
	local subnet1 = self:getSubNet4(ip1, mask1)
	local subnet2 = self:getSubNet4(ip2, mask2)
	return subnet1 == subnet2
end

function IpAddr:isSameSubnet6(ipmask1, ipmask2)
	local ip1, mask1 = self:getIpMask(ipmask1)
	local ip2, mask2 = self:getIpMask(ipmask2)
	local subnet1 = self:getSubNet6(ip1, mask1)
	local subnet2 = self:getSubNet6(ip2, mask2)
	return subnet1 == subnet2
end

function IpAddr:isSameIpV4(ipmask1, ipmask2)
	local ip1, _ = self:getIpMask(ipmask1)
	local ip2, _ = self:getIpMask(ipmask2)
	ip1 = expandIpV4Str(ip1)
	ip2 = expandIpV4Str(ip2)
	return ip1 == ip2
end

function IpAddr:isSameIpV6(ipmask1, ipmask2)
	local ip1, _ = self:getIpMask(ipmask1)
	local ip2, _ = self:getIpMask(ipmask2)
	ip1 = expandIpV6Str(ip1)
	ip2 = expandIpV6Str(ip2)
	return ip1 == ip2
end

function IpAddr:isIpV4(ip)
	local ret = string.match(ip, "%d+%.%d+%.%d+%.%d+")
	if nil == ret then
		return false
	else
		return true
	end
end

-- return fixed ip string and ipaddr, mask value 
--		eg. 1.2.3.4/0.0.0.1 ==>> 1.2.3.4/255.255.255.255, 1.2.3.4, 32
function IpAddr:fixMaskOfIpV4Addr(str)
	local i, j
	local ret = string.match(str, "%d+%.%d+%.%d+%.%d+/%d+%.%d+%.%d+%.%d+")
	local ip, _ = self:getIpMask(str)
	if nil ~= ret then -- str formated like 1.2.3.4/5.5.5.5
		local _, _, ip, mask = string.find(str, '([0-9.]+)/([0-9.]+)')
		local binstr = ipV4ToBinStr(mask)
		i, j = string.find(binstr, "[01]+1")
		if nil ~= i then
			binstr = string.rep("1", j) .. string.rep("0", 32-j)
			local v = 0
			local i = 1
			local maskstr = {} 
			while i < #binstr do
				v = tonumber(string.sub(binstr, i, i+8-1), 2)
				maskstr[#maskstr +1] = string.format("%d", tostring(v, 10))
				i = i+8
			end
			mask = table.concat(maskstr, ".")
			str = ip .. "/" .. mask
		else
			str = ip .. "/0"
		end
	end
	return str, ip, j
end

function IpAddr:getHostAddrV4(ipmask)
	local ip, mask = self:getIpMask(ipmask)
	local binstr = ipV4ToBinStr(ip)
	binstr = string.rep("0", mask) .. string.sub(binstr, mask+1)
	local v = 0
	local i = 1
	local maskstr = {} 
	while i < #binstr do
		v = tonumber(string.sub(binstr, i, i+8-1), 2)
		maskstr[#maskstr +1] = string.format("%d", tostring(v, 10))
		i = i+8
	end
	return table.concat(maskstr, ".")
end

function IpAddr:hostAddrIsBrdcast(ipmask)
	local ip, mask = self:getIpMask(ipmask)
	local binstr = ipV4ToBinStr(ip)
	binstr = string.sub(binstr, mask+1)
	local i = 1
	while i <= #binstr do
		if "1" ~= string.sub(binstr, i, i) then
			return false
		end
		i = i+1
	end
	return true
end

function IpAddr:hostAddrIsZero(ipmask)
	local ip, mask = self:getIpMask(ipmask)
	local binstr = ipV4ToBinStr(ip)
	binstr = string.sub(binstr, mask+1)
	local i = 1
	while i <= #binstr do
		if "0" ~= string.sub(binstr, i, i) then
			return false
		end
		i = i+1
	end
	return true
end

return IpAddr
