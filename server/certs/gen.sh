!/bin/bash
openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=US/ST=CA/L=San Francisco/O=hiddenstate.xyz/CN=otc.ountry" \
    -keyout test.key  -out test.cert
