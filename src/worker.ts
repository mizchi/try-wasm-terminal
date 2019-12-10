// @ts-ignore
import processWorker from "@wasmer/wasm-terminal/lib/workers/process.worker";
import { WASI } from "@wasmer/wasi";
// @ts-ignore
import BrowserWASIBindings from "@wasmer/wasi/lib/bindings/browser";

WASI.defaultBindings = BrowserWASIBindings;

export default processWorker;
