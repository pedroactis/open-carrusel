const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

const hostname = (hostHeader: string) => hostHeader.replace(/:\d+$/, "").toLowerCase();

/**
 * O app é single-user e local, mas o servidor escuta na rede inteira e o /api/chat
 * dá Bash ao Claude. Só aceita pedido feito na própria máquina:
 * - Host local: barra outro aparelho no mesmo Wi-Fi e DNS rebinding.
 * - Origin, quando existe, também local: barra outro site aberto no navegador (CSRF).
 *   O curl do agente não manda Origin, então passa.
 */
export function isLocalRequest(host: string | null, origin: string | null): boolean {
  if (!host || !LOCAL_HOSTS.has(hostname(host))) return false;
  if (!origin) return true;
  try {
    return LOCAL_HOSTS.has(hostname(new URL(origin).host));
  } catch {
    return false;
  }
}
