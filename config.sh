
mkdir -p nginxd
home=`pwd`

cd openresty-1.11.2.1/ &&  ./configure --prefix=$home/nginxd  --with-luajit  \
                                                              --without-http_redis2_module \
                                                              --with-http_iconv_module \
                                                              --with-pcre=$home/pcre-8.39/  \
                                                              --with-openssl=$home/openssl-1.0.0e/ \
                                                              --with-zlib=$home/zlib-1.2.8/

