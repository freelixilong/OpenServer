--@ author: zhouxuehao
--@ date: 2015-4-7
--@ mongodb config

return {
    --- 服务器 unix sock
    -- db.createUser({user: "admin", pwd:"pass", roles:[{ role: "readWrite", db: "config" }, "clusterAdmin"]})
    -- /usr/local/openresty/nginx/sbin/nginx -p /opt/fwbchroot-1.2.0/branch-template-5.3.4/manager/nginxd/ -c conf/nginx.conf&
    -- service  mongod --full-restart
    -- vi /etc/mongod.conf modify auth
    SOCK = nil, --"/tmp/mongodb-27017.sock",

    --- 服务器IP
    HOST = "127.0.0.1",

    --- 服务器端口
    PORT = 27019,

    --- 用户名
    USER = "admin",

    --- 密码
    PASSWORD = "pass",

    --- 数据库
    DATABASE = "test",

    --- 连接超时
    TIMEOUT = 10000,

    --- 连接池大小（高峰请求数/worker数量）
    POOL_SIZE = 100,
}
