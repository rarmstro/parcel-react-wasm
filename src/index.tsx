import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import Module from "./application";

// declare global {
//   var module : any;
//   var addNums : any;
// }

Module().then((module: any) => {
  globalThis.module = module;
  globalThis._addNums = module._addNums;
  globalThis.addNums = module.cwrap("addNums", "number", [
    "number",
    "number",
  ]);

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});