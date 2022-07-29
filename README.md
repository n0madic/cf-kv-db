# Cloudflare key-value database worker

Simple K/V serverless database with Cloudflare workers.

### Features

* Globally Available
* Lowest Latency
* Serverless
* Rest API
* Token Based Authentication

## Deploy

1. Create worker and save code from `worker.js`
2. Add KV namespace and bind to worker as `KVDB`
3. Add to worker environment variable `ACCESS_TOKENS` with JSON list of tokens

## Usage

### Add/update record

Value must be JSON:

```
$ curl -H 'Token: random-string' -X PUT -d '["data"]' https://kv-db.username.workers.dev/random/path/as/key
{"status":true,"msg":"updated","ttl":null}
```

The key is stored as `TOKEN/random/path/as/key`, so the same paths can be used with different tokens.

You can also specify the optional `ttl` parameter in seconds for how long record will live (minimum 60 seconds):

```
$ curl -H 'Token: random-string' -X POST -d '["data"]' https://kv-db.username.workers.dev/random/path/as/key?ttl=60
{"status":true,"msg":"updated","ttl":"60"}
```

### Get record

```
$ curl -H 'Token: random-string' https://kv-db.username.workers.dev/random/path/as/key
["test"]
```

If record not found:

```
$ curl -H 'Token: random-string' https://kv-db.username.workers.dev/non/existent/path
{"status":false,"error":"not found"}
```

### Delete record

```
$ curl -H 'Token: random-string' -X DELETE https://kv-db.username.workers.dev/random/path/as/key
{"status":true,"msg":"deleted"}
```
