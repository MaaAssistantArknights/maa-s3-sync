import { ProxyAgent } from "undici";

const HttpProxyAgent = process.env.HTTP_PROXY ?
  new ProxyAgent(process.env.HTTP_PROXY) : undefined;

export { HttpProxyAgent };
