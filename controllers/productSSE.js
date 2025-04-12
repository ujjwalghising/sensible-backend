// src/controllers/productSSE.js
import EventEmitter from 'events';

const stockUpdateEmitter = new EventEmitter();

// SSE endpoint for broadcasting stock updates to all clients
const setupStockUpdateStream = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();  // Ensure headers are sent immediately

  res.write("data: Connected to stock updates\n\n");

  const stockUpdateHandler = (product) => {
    res.write(`data: ${JSON.stringify(product)}\n\n`);
  };

  stockUpdateEmitter.on("stockUpdated", stockUpdateHandler);

  req.on("close", () => {
    stockUpdateEmitter.off("stockUpdated", stockUpdateHandler);
  });
};

export { stockUpdateEmitter, setupStockUpdateStream };
