// server/api/proof.post.ts
import { Worker } from "worker_threads";
import path from "path";

export default defineEventHandler(async (event) => {
  const formData = await readBody(event);

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(process.cwd(), "./server/utils/proofWorker.js")
    );

    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });

    worker.postMessage(formData);
  });
});
