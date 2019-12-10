import "xterm/css/xterm.css";

import { h, render } from "preact";
import { useEffect, useState, useRef, useCallback } from "preact/hooks";

import WasmTerminal, {
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

// container: HTMLElement | null;
// wasmTerminal: WasmTerminal;
// wasmFs: WasmFs;

function WasmTerminalComponent() {
  const ref = useRef<HTMLElement>(null);
  const [terminal, setTerminal] = useState(null);
  // container: HTMLElement | null;

  useEffect(() => {
    const wasmFs = new WasmFs();
    const wasmTerminal = new WasmTerminal({
      fetchCommand: fetchCommandHandler,
      processWorkerUrl: "/worker.js",
      wasmFs: this.wasmFs
    });

    const TINY_PNG =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    const deser = new Buffer(TINY_PNG, "base64");
    const contents = Uint8Array.from(deser);
    wasmFs.volume.writeFileSync("/tiny.png", contents);

    wasmTerminal.print("Hello Open");

    if (ref.current) {
      wasmTerminal.open(ref.current);
      wasmTerminal.fit();
      wasmTerminal.focus();
    }
    setTerminal(wasmTerminal);
    return () => {
      wasmTerminal.destroy();
    };
  }, []);

  const printHello = useCallback(() => {
    terminal.print("hello");
  }, [terminal]);

  const runCowsayHello = useCallback(() => {
    terminal.runCommand("cowsay hello");
  }, [terminal]);

  const runViw = useCallback(() => {
    terminal.runCommand("viu /tiny.png");
  }, [terminal]);

  return (
    <div>
      <div>
        <button onClick={printHello}>Print "hello"</button>
        <button onClick={runCowsayHello}>Run Cowsay Hello</button>
        <button onClick={runViw}>Run Viu</button>
        <br />
      </div>
      <div ref={ref} />
    </div>
  );
}

function App() {
  return <WasmTerminalComponent />;
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
