#cd pcre2-10.22/ && ./configure && make && make install

./config.sh
cd openresty-1.11.2.1/ && make && make install

cd ./lua-resty-mongol-master/
make install
