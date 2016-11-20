--@ author: zhouxuehao
--@ date: 2015-4-7
--@ error code

return {
    --- core errors
    core = {
        unknowErr = "unknown error",
        debug = "debug interupt",
        systemErr = "system error",
        systemCal = "system call error",
        systemCallFailed  = "system call failed",
        forbidden = "forbidden",
        badConfig = "bad config",
        badCall = "bad call",
        badAction = "bad action",
        badParams = "bad parameters",
        uploadFailed = "upload file failed",
        downloadFailed = "download file failed",
        cantOpenFile = "can not open file",
        cantReadFile = "can not read file",
        cantWriteFile = "can not write file",
        readDataFailed = "file upload read form data failed",
        dbFileInsertFailed = "failed insert file into db",
        proxyFailed = "proxy failed",
        serverClose = "server Maintenance, please wait...",
        connectFailed = "connect server failed",
        queryFailed = "query failed",
        parseFailed = "parse failed",
        needLogin = "can not find session info, please login again",
        tarFailed = "tar2 certificats execute failed",
        compressFailed = "compress certificats execute failed",
        cypherFailed = "cypher certificats execute failed",
    },

    --- user errors
    user = {
    },
}
