# Privachat

## Introduction

Simple chat application that build with privacy concern in mind.

## Run locally

Make sure you have `deno` installed and the MongoDB server is running. Copy
`src/.env.example` to `src/.env` and fill all values depend on your local
environment.

Now, running the server

```
cd src && deno run --allow-net --allow-read --allow-env main.ts
```

Run all test cases with

```
cd src && deno test --allow-net --allow-read --allow-env

```

Read the [documentation](./doc/README.md)

## License

The software is licensed under MIT (see [LICENSE](./LICENSE)) and uses third
party libraries that are distributed under their own terms (see
[LICENSE-3RD-PART](./LICENSE-3RD-PARTY)).

