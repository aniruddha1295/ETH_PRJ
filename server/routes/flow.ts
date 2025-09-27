import { Router } from "express";
import FlowService from "../services/flow";

const router = Router();
const flowService = new FlowService("testnet");

router.get("/flow/health", async (_req, res) => {
  const health = await flowService.healthCheck();
  res.json(health);
});

export default router;
