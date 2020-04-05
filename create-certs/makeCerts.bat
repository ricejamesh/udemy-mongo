openssl req -x509 -new -newkey rsa:4096 -keyout .\certs\mongodb-cert.key -out .\certs\mongodb-cert.crt -days 365 -nodes -config .\localhost_dev.cnf

type .\certs\mongodb-cert.key .\certs\mongodb-cert.crt > .\certs\mongodb.pem