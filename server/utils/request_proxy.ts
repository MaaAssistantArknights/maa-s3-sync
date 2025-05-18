import { ProxyAgent } from "undici";

const RequestProxyAgent = process.env.PROXY ?
  new ProxyAgent(process.env.PROXY) : undefined;

export { RequestProxyAgent as HttpProxyAgent };
