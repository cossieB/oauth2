# OAuth2.0 auth server

```
npm install
```

Generate private and public key pair.

```
openssl ecparam -name prime256v1 -genkey -noout -out private.pem
openssl ec -in private.pem -pubout -out public.pem
```

```
npm run dev
```