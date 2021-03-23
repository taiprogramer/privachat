# Privachat

## Introduction

Simple chat application that build with privacy concern in mind.

## Run locally

Make sure you have `deno` installed and the MongoDB server is running. Copy
`src/.env.example` to `src/.env` and fill all values depend on your local
environment.

Now, running the server

```
cd src && deno run --allow-net --allow-read --allow-env --unstable main.ts
```

Read the [documentation](./doc/README.md)
