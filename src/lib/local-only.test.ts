import { test } from "node:test";
import assert from "node:assert/strict";
import { isLocalRequest } from "./local-only.ts";

test("aceita só pedido feito na própria máquina", () => {
  assert.equal(isLocalRequest("localhost:3000", null), true); // curl do agente
  assert.equal(isLocalRequest("127.0.0.1:3000", "http://localhost:3000"), true); // o próprio app
  assert.equal(isLocalRequest("[::1]:3000", null), true);
  assert.equal(isLocalRequest("192.168.1.10:3000", null), false); // outro aparelho no Wi-Fi
  assert.equal(isLocalRequest("evil.example", null), false); // DNS rebinding
  assert.equal(isLocalRequest("localhost:3000", "https://evil.example"), false); // outro site (CSRF)
  assert.equal(isLocalRequest("localhost:3000", "null"), false); // iframe/arquivo sem origem
  assert.equal(isLocalRequest(null, null), false);
});
