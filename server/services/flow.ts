import * as fcl from "@onflow/fcl";
// You need to import the JS config this way when using TypeScript with a .js config!
import flowConfig from "../../flow.config";


class FlowService {
  constructor(network: "testnet" | "mainnet" = "testnet") {
    const cfg = flowConfig[network];
    fcl.config()
      .put("accessNode.api", cfg.accessNode)
      .put("discovery.wallet", cfg.walletDiscovery)
      .put("env", cfg.network);
  }

  async healthCheck() {
    try {
      const block = await fcl.send([fcl.getBlock(true)]).then(fcl.decode);
      return { status: "healthy", height: block.height };
    } catch {
      return { status: "down" };
    }
  }
}

export default FlowService;
