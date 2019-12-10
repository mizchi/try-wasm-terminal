import "xterm/css/xterm.css";

import { h, Component, render } from "preact";

// @ts-ignore
import WasmTerminal, {
  // @ts-ignore
  fetchCommandFromWAPM
  // @ts-ignore
} from "@wasmer/wasm-terminal";

import { WASI } from "@wasmer/wasi";
// @ts-ignore
import BrowserWASIBindings from "@wasmer/wasi/lib/bindings/browser";
// @ts-ignore
import { lowerI64Imports } from "@wasmer/wasm-transformer";

// import welcomeMessage from "./welcome-message";
import { WasmFs } from "@wasmer/wasmfs";

WASI.defaultBindings = BrowserWASIBindings;

const commands = {
  callback: (options: any, wasmFs: any) => {
    let myArr = new Uint8Array(1024);
    let stdin = wasmFs.fs.readSync(0, myArr, 0, 1024, 0);
    return Promise.resolve(
      `Callback Command Working! Options: ${options}, stdin: ${myArr}`
    );
  }
};

let didInitWasmTransformer = false;
const fetchCommandHandler = async (
  commandName: string,
  commandArgs?: Array<string>,
  envEntries?: any[][]
) => {
  const customCommand = (commands as any)[commandName];
  let wasmBinary = undefined;

  if (customCommand) {
    if (typeof customCommand === "string") {
      const fetched = await fetch(customCommand);
      const buffer = await fetched.arrayBuffer();
      wasmBinary = new Uint8Array(buffer);
    } else {
      return customCommand;
    }
  } else {
    wasmBinary = await fetchCommandFromWAPM(
      commandName,
      commandArgs,
      envEntries
    );
  }

  if (!didInitWasmTransformer) {
    didInitWasmTransformer = true;
  }

  return await lowerI64Imports(wasmBinary);
};

/**
 * A simple preact wrapper around the Wasm Terminal
 */

// const processWorkerUrl = (document.getElementById("worker") as HTMLImageElement)
//   .src;

class WasmTerminalComponent extends Component {
  container: HTMLElement | null;
  wasmTerminal: WasmTerminal;
  wasmFs: WasmFs;

  constructor() {
    super();
    this.wasmFs = new WasmFs();
    this.wasmTerminal = new WasmTerminal({
      fetchCommand: fetchCommandHandler,
      processWorkerUrl: "/worker.js",
      wasmFs: this.wasmFs
    });

    const TINY_PNG =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    const deser = new Buffer(TINY_PNG, "base64");
    const contents = Uint8Array.from(deser);
    this.wasmFs.volume.writeFileSync("/tiny.png", contents);

    this.container = null;
  }

  componentDidMount() {
    if (!this.container) {
      return;
    }
    this.wasmTerminal.print("Hello Open ");

    this.wasmTerminal.open(this.container);
    this.wasmTerminal.fit();
    this.wasmTerminal.focus();
  }

  componentWillUnmount() {
    this.wasmTerminal.destroy();
  }

  printHello() {
    this.wasmTerminal.print("hello");
  }

  runCowsayHello() {
    this.wasmTerminal.runCommand("cowsay hello");
  }

  runViu() {
    this.wasmTerminal.runCommand("viu /tiny.png");
  }

  render() {
    return (
      <div id="terminal-component">
        <div>
          <button onClick={() => this.printHello()}>Print "hello"</button>
          <button onClick={() => this.runCowsayHello()}>
            Run Cowsay Hello
          </button>
          <button onClick={() => this.runViu()}>Run Viu</button>
          <br />
          <br />
        </div>
        <div id="terminal-container" ref={ref => (this.container = ref)} />
      </div>
    );
  }
}

function App() {
  // render() {
  // return <div>Hello</div>;
  return <WasmTerminalComponent />;
  // }
}

const rootElement = document.getElementById("root");
// if (rootElement) {
render(<App />, rootElement);
// }
