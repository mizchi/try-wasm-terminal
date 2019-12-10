import "xterm/css/xterm.css";

import WasmTerminal, {
  fetchCommandFromWAPM
} from "@wasmer/wasm-terminal/lib/optimized/wasm-terminal.esm";
import wasmInit, {
  lowerI64Imports
} from "@wasmer/wasm-transformer/lib/optimied/wasm-transformer.esm.js";

// URL for where the wasm-transformer wasm file is located. This is probably different depending on your bundler.
const wasmTransformerWasmUrl =
  "./node_modules/@wasmer/wasm-transformer/wasm-transformer.wasm";

// Let's write handler for the fetchCommand property of the WasmTerminal Config.
const fetchCommandHandler = async commandName => {
  // Let's return a "CallbackCommand" if our command matches a special name
  if (commandName === "callback-command") {
    const callbackCommand = async (options, wasmFs) => {
      return `Callback Command Working! Options: ${options}, fs: ${wasmFs}`;
    };
    return callbackCommand;
  }

  // Let's fetch a wasm Binary from WAPM for the command name.
  const wasmBinary = await fetchCommandFromWAPM(commandName);

  // Initialize the Wasm Transformer, and use it to lower
  // i64 imports from Wasi Modules, so that most Wasi modules
  // Can run in a Javascript context.
  await wasmInit(wasmTransformerWasmUrl);
  return lowerI64Imports(wasmBinary);
};

// Let's create our Wasm Terminal
const wasmTerminal = new WasmTerminal({
  // Function that is run whenever a command is fetched
  fetchCommand: fetchCommandHandler,
  // IMPORTANT: This is wherever your process.worker.js file URL is hosted
  processWorkerUrl: "./node_modules/wasm-terminal/workers/process.worker.js"
});

// Let's print out our initial message
wasmTerminal.print("Hello World!");

// Let's bind our Wasm terminal to it's container
const containerElement = document.querySelector("#root");
wasmTerminal.open(containerElement);
wasmTerminal.fit();
wasmTerminal.focus();

// import WasmTerminal, { fetchCommandFromWAPM } from "@wasmer/wasm-terminal";
// import { lowerI64Imports } from "@wasmer/wasm-transformer";

// // Let's write handler for the fetchCommand property of the WasmTerminal Config.
// const fetchCommandHandler = async commandName => {
//   // Let's return a "CallbackCommand" if our command matches a special name
//   if (commandName === "callback-command") {
//     const callbackCommand = async (options, wasmFs) => {
//       return `Callback Command Working! Options: ${options}, fs: ${wasmFs}`;
//     };
//     return callbackCommand;
//   }

//   // Let's fetch a wasm Binary from WAPM for the command name.
//   const wasmBinary = await fetchCommandFromWAPM(commandName);

//   // lower i64 imports from Wasi Modules, so that most Wasi modules
//   // Can run in a Javascript context.
//   return await lowerI64Imports(wasmBinary);
// };

// window.addEventListener("load", () => {
//   // Let's create our Wasm Terminal
//   const wasmTerminal = new WasmTerminal({
//     // Function that is run whenever a command is fetched
//     fetchCommand: fetchCommandHandler
//   });

//   // Let's print out our initial message
//   wasmTerminal.print("Hello World!");

//   // Let's bind our Wasm terminal to it's container
//   const containerElement = document.querySelector("#root");
//   wasmTerminal.open(containerElement);
//   wasmTerminal.fit();
//   wasmTerminal.focus();

//   // Later, when we are done with the terminal, let's destroy it
//   // wasmTerminal.destroy();
// });
