import { createORPCClient, type InferClientContext } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import type { AppContract } from "@/orpc/contract";
import { resolveApiUrl } from "@/utils/url";

type ApiClient = ContractRouterClient<AppContract>;
type ApiClientContext = InferClientContext<ApiClient>;

const rpcLink = new RPCLink<ApiClientContext>({
  fetch: (request, init, _options, _path, _input) =>
    fetch(request, {
      ...init,
      credentials: "include",
    }),
  url: () => resolveApiUrl("/rpc"),
});

export const client: ApiClient = createORPCClient<ApiClient>(rpcLink);
