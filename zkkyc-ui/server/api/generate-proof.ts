// import { fork } from "child_process";

// export default defineEventHandler(async (event) => {
//   const formData = await readBody(event);
//   const worker = fork("./server/utils/proofWorker.js");

//   return {
//     result: formData,
//   };

//   return new Promise((resolve, reject) => {
//     worker.send(formData);
//     worker.on("message", resolve);
//     worker.on("error", reject);
//   });
// });
