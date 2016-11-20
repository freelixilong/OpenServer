#cd pcre2-10.22/ && ./configure && make && make install

./config.sh
cd openresty-1.11.2.1/ && make && make install

export PATH=`pwd`/nginxd:$PATH
cd ./lua-resty-mongol3-master/ && make install
