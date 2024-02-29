
var Module = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(moduleArg = {}) {

// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = moduleArg;

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
Module['ready'] = new Promise((resolve, reject) => {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});
["_addNums","_memory","___indirect_function_table","_fflush","onRuntimeInitialized"].forEach((prop) => {
  if (!Object.getOwnPropertyDescriptor(Module['ready'], prop)) {
    Object.defineProperty(Module['ready'], prop, {
      get: () => abort('You are getting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
      set: () => abort('You are setting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
    });
  }
});

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = true;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary;

if (ENVIRONMENT_IS_SHELL) {

  if ((typeof process == 'object' && typeof require === 'function') || typeof window == 'object' || typeof importScripts == 'function') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  if (typeof read != 'undefined') {
    read_ = read;
  }

  readBinary = (f) => {
    if (typeof readbuffer == 'function') {
      return new Uint8Array(readbuffer(f));
    }
    let data = read(f, 'binary');
    assert(typeof data == 'object');
    return data;
  };

  readAsync = (f, onload, onerror) => {
    setTimeout(() => onload(readBinary(f)));
  };

  if (typeof clearTimeout == 'undefined') {
    globalThis.clearTimeout = (id) => {};
  }

  if (typeof setTimeout == 'undefined') {
    // spidermonkey lacks setTimeout but we use it above in readAsync.
    globalThis.setTimeout = (f) => (typeof f == 'function') ? f() : abort();
  }

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit == 'function') {
    quit_ = (status, toThrow) => {
      // Unlike node which has process.exitCode, d8 has no such mechanism. So we
      // have no way to set the exit code and then let the program exit with
      // that code when it naturally stops running (say, when all setTimeouts
      // have completed). For that reason, we must call `quit` - the only way to
      // set the exit code - but quit also halts immediately.  To increase
      // consistency with node (and the web) we schedule the actual quit call
      // using a setTimeout to give the current stack and any exception handlers
      // a chance to run.  This enables features such as addOnPostRun (which
      // expected to be able to run code after main returns).
      setTimeout(() => {
        if (!(toThrow instanceof ExitStatus)) {
          let toLog = toThrow;
          if (toThrow && typeof toThrow == 'object' && toThrow.stack) {
            toLog = [toThrow, toThrow.stack];
          }
          err(`exiting due to exception: ${toLog}`);
        }
        quit(status);
      });
      throw toThrow;
    };
  }

  if (typeof print != 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console == 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr != 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE, this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  if (!(typeof window == 'object' || typeof importScripts == 'function')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {
// include: web_or_worker_shell_read.js
read_ = (url) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  }

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
      return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  }

// end include: web_or_worker_shell_read.js
  }
} else
{
  throw new Error('environment detection error');
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.error.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;
checkIncomingModuleAPI();

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];legacyModuleProp('arguments', 'arguments_');

if (Module['thisProgram']) thisProgram = Module['thisProgram'];legacyModuleProp('thisProgram', 'thisProgram');

if (Module['quit']) quit_ = Module['quit'];legacyModuleProp('quit', 'quit_');

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// Assertions on removed incoming Module JS APIs.
assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['read'] == 'undefined', 'Module.read option was removed (modify read_ in JS)');
assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)');
assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
legacyModuleProp('asm', 'wasmExports');
legacyModuleProp('read', 'read_');
legacyModuleProp('readAsync', 'readAsync');
legacyModuleProp('readBinary', 'readBinary');
legacyModuleProp('setWindowTitle', 'setWindowTitle');
var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var FETCHFS = 'FETCHFS is no longer included by default; build with -lfetchfs.js';
var ICASEFS = 'ICASEFS is no longer included by default; build with -licasefs.js';
var JSFILEFS = 'JSFILEFS is no longer included by default; build with -ljsfilefs.js';
var OPFS = 'OPFS is no longer included by default; build with -lopfs.js';

var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

assert(!ENVIRONMENT_IS_WORKER, "worker environment detected but not enabled at build time.  Add 'worker' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_NODE, "node environment detected but not enabled at build time.  Add 'node' to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");


// end include: shell.js
// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary; 
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];legacyModuleProp('wasmBinary', 'wasmBinary');

if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}

// include: base64Utils.js
// Converts a string of base64 into a byte array (Uint8Array).
function intArrayFromBase64(s) {

  var decoded = atob(s);
  var bytes = new Uint8Array(decoded.length);
  for (var i = 0 ; i < decoded.length ; ++i) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}
// end include: base64Utils.js
// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.
function _malloc() {
  abort("malloc() called but not included in the build - add '_malloc' to EXPORTED_FUNCTIONS");
}
function _free() {
  // Show a helpful error since we used to include free by default in the past.
  abort("free() called but not included in the build - add '_free' to EXPORTED_FUNCTIONS");
}

// Memory management

var HEAP,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
}

assert(!Module['STACK_SIZE'], 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time')

assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
       'JS engine does not provide full typed array support');

// If memory is defined in wasm, the user can't provide it, or set INITIAL_MEMORY
assert(!Module['wasmMemory'], 'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally');
assert(!Module['INITIAL_MEMORY'], 'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically');

// include: runtime_stack_check.js
// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // If the stack ends at address zero we write our cookies 4 bytes into the
  // stack.  This prevents interference with SAFE_HEAP and ASAN which also
  // monitor writes to address zero.
  if (max == 0) {
    max += 4;
  }
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[((max)>>2)] = 0x02135467;
  HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[((0)>>2)] = 1668509029;
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  // See writeStackCookie().
  if (max == 0) {
    max += 4;
  }
  var cookie1 = HEAPU32[((max)>>2)];
  var cookie2 = HEAPU32[(((max)+(4))>>2)];
  if (cookie1 != 0x02135467 || cookie2 != 0x89BACDFE) {
    abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[((0)>>2)] != 0x63736d65 /* 'emsc' */) {
    abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
  }
}
// end include: runtime_stack_check.js
// include: runtime_assertions.js
// Endianness check
(function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
})();

// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  checkStackCookie();

  
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  
  callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {
  checkStackCookie();

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
}

function addRunDependency(id) {
  runDependencies++;

  Module['monitorRunDependencies']?.(runDependencies);

  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(() => {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err(`dependency: ${dep}`);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;

  Module['monitorRunDependencies']?.(runDependencies);

  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  Module['onAbort']?.(what);

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // defintion for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// show errors on likely calls to FS when it was not included
var FS = {
  error() {
    abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM');
  },
  init() { FS.error() },
  createDataFile() { FS.error() },
  createPreloadedFile() { FS.error() },
  createLazyFile() { FS.error() },
  open() { FS.error() },
  mkdev() { FS.error() },
  registerDevice() { FS.error() },
  analyzePath() { FS.error() },

  ErrnoError() { FS.error() },
};
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */
var isDataURI = (filename) => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
var isFileURI = (filename) => filename.startsWith('file://');
// end include: URIUtils.js
function createExportWrapper(name) {
  return function() {
    assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
    var f = wasmExports[name];
    assert(f, `exported native function \`${name}\` not found`);
    return f.apply(null, arguments);
  };
}

// include: runtime_exceptions.js
// end include: runtime_exceptions.js
var wasmBinaryFile;
  wasmBinaryFile = 'data:application/octet-stream;base64,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ZW0vbGliL2NvbXBpbGVyLXJ0L3N0YWNrX29wcy5TAC9lbXNkay9lbXNjcmlwdGVuAGNsYW5nIHZlcnNpb24gMTguMC4wZ2l0IChodHRwczovL2dpdGh1Yi5jb20vbGx2bS9sbHZtLXByb2plY3QgZjI0NjRjYTMxN2JmZWVlZGRkYjdjYmRlYTNjMmM4ZWM0ODc4OTBiYikAAYACc3RhY2tTYXZlAAEAAAAPAAAAIQIAAAJzdGFja1Jlc3RvcmUAAQAAABQAAAAmAgAAAnN0YWNrQWxsb2MAAQAAABoAAAAtAgAAAmVtc2NyaXB0ZW5fc3RhY2tfZ2V0X2N1cnJlbnQAAQAAACoAAABCAgAAAAC5HgouZGVidWdfc3RyegBjYXBhY2l0eQBlbnRyeQBjYW5hcnkAcHRocmVhZF9tdXRleF9kZXN0cm95AHB0aHJlYWRfbXV0ZXhhdHRyX2Rlc3Ryb3kAcHRocmVhZF9yd2xvY2thdHRyX2Rlc3Ryb3kAcHRocmVhZF9jb25kYXR0cl9kZXN0cm95AHB0aHJlYWRfYmFycmllcl9kZXN0cm95AHB0aHJlYWRfc3Bpbl9kZXN0cm95AHNlbV9kZXN0cm95AHB0aHJlYWRfcndsb2NrX2Rlc3Ryb3kAcHRocmVhZF9jb25kX2Rlc3Ryb3kAZHVtbXkAa2V5AG1haWxib3gAbXV0ZXgAX194AGVtc2NyaXB0ZW5fZ2V0X25vdwBkdHYAcHJpdgB6b21iaWVfcHJldgBfX3UAem9tYmllX25leHQAX19uZXh0AGFic190aW1lb3V0AHNlbV9wb3N0AHJvYnVzdF9saXN0AHB0aHJlYWRfY29uZF9icm9hZGNhc3QAZW1zY3JpcHRlbl9oYXNfdGhyZWFkaW5nX3N1cHBvcnQAc3RhcnQAbG9ja2NvdW50AG1haWxib3hfcmVmY291bnQAdW5zaWduZWQgaW50AHB0aHJlYWRfbXV0ZXhfY29uc2lzdGVudABwYXJlbnQAc2hjbnQAcmVzdWx0AF9fcHRocmVhZF9leGl0AHB0aHJlYWRfbXV0ZXhfaW5pdABwdGhyZWFkX211dGV4YXR0cl9pbml0AHB0aHJlYWRfcndsb2NrYXR0cl9pbml0AHB0aHJlYWRfY29uZGF0dHJfaW5pdABwdGhyZWFkX2JhcnJpZXJfaW5pdABwdGhyZWFkX3NwaW5faW5pdABzZW1faW5pdABwdGhyZWFkX3J3bG9ja19pbml0AHB0aHJlYWRfY29uZF9pbml0AHNlbV90cnl3YWl0AF9fcHRocmVhZF9jb25kX3RpbWVkd2FpdABlbXNjcmlwdGVuX2Z1dGV4X3dhaXQAcHRocmVhZF9iYXJyaWVyX3dhaXQAc2VtX3dhaXQAcHRocmVhZF9jb25kX3dhaXQAX193YWl0AF9fbG9jYWxlX3N0cnVjdABjYXQAcHRocmVhZF9rZXlfdABwdGhyZWFkX211dGV4X3QAcHRocmVhZF9tdXRleGF0dHJfdABwdGhyZWFkX2JhcnJpZXJhdHRyX3QAcHRocmVhZF9yd2xvY2thdHRyX3QAcHRocmVhZF9jb25kYXR0cl90AHB0aHJlYWRfYXR0cl90AHVpbnRwdHJfdABwdGhyZWFkX2JhcnJpZXJfdABzZW1fdABwdGhyZWFkX3J3bG9ja190AHB0aHJlYWRfc3BpbmxvY2tfdABvZmZfdABzaXplX3QAdGltZV90AGxvY2FsZV90AHB0aHJlYWRfb25jZV90AHB0aHJlYWRfY29uZF90AGNsb2NraWRfdABwdGhyZWFkX3QAdWludDMyX3QAc3RhdHVzAHRpbWVTcGVudEluU3RhdHVzAHRocmVhZFN0YXR1cwB3YWl0ZXJzAHdwb3MAcnBvcwBhZGROdW1zAGVtc2NyaXB0ZW5fY3VycmVudF90aHJlYWRfcHJvY2Vzc19xdWV1ZWRfY2FsbHMAZW1zY3JpcHRlbl9tYWluX3RocmVhZF9wcm9jZXNzX3F1ZXVlZF9jYWxscwB0YXNrcwBzdGRpb19sb2NrcwBmbGFncwBfYV90cmFuc2ZlcnJlZGNhbnZhc2VzAGVtc2NyaXB0ZW5fbnVtX2xvZ2ljYWxfY29yZXMAZW1zY3JpcHRlbl9mb3JjZV9udW1fbG9naWNhbF9jb3JlcwB0bHNfZW50cmllcwBtYXhXYWl0TWlsbGlzZWNvbmRzAG1zZWNzAF9fcwBfX2F0dHIAX19zdGRpb19vZmxfbG9ja3B0cgBkZXN0cnVjdG9yAGFkZHIAdW5zaWduZWQgY2hhcgAvaG9tZS9yYXJtc3Ryby9naXQvcGFyY2VsLXJlYWN0LXdhc20vY3BwL3dhc20tZW50cnkuY3BwAC9ob21lL3Jhcm1zdHJvL2dpdC9wYXJjZWwtcmVhY3Qtd2FzbS9jcHAvc3JjL2FkZE51bXMuY3BwAHB0aHJlYWRfZ2V0YXR0cl9ucABlbXNjcmlwdGVuX3RocmVhZF9zbGVlcABfX2xvY2FsZV9tYXAAX19wAHN5c2luZm8AX19lcnJub19sb2NhdGlvbgBub3RpZmljYXRpb24AX19wdGhyZWFkX2pvaW4AbWFpbgAvZW1zZGsvZW1zY3JpcHRlbgBzaGxpbQBzZW0Ab25jZV9jb250cm9sAF9Cb29sAHB0aHJlYWRfbXV0ZXhhdHRyX3NldHByb3RvY29sAHRhaWwAcHRocmVhZF90ZXN0Y2FuY2VsAHB0aHJlYWRfY2FuY2VsAHJldHZhbABoX2Vycm5vX3ZhbABfX3ZhbABwdGhyZWFkX2VxdWFsAF9fcHJpdmF0ZV9jb25kX3NpZ25hbABwdGhyZWFkX2NvbmRfc2lnbmFsAHRhc2sAcHRocmVhZF9hdGZvcmsAY2xrAHNlZWsAX19wdGhyZWFkX211dGV4X3RyeWxvY2sAcHRocmVhZF9zcGluX3RyeWxvY2sAcndsb2NrAHB0aHJlYWRfcndsb2NrX3RyeXdybG9jawBwdGhyZWFkX3J3bG9ja190aW1lZHdybG9jawBwdGhyZWFkX3J3bG9ja193cmxvY2sAX19wdGhyZWFkX211dGV4X3VubG9jawBwdGhyZWFkX3NwaW5fdW5sb2NrAF9fb2ZsX3VubG9jawBwdGhyZWFkX3J3bG9ja191bmxvY2sAX19uZWVkX3VubG9jawBfX3VubG9jawBraWxsbG9jawBwdGhyZWFkX3J3bG9ja190cnlyZGxvY2sAcHRocmVhZF9yd2xvY2tfdGltZWRyZGxvY2sAcHRocmVhZF9yd2xvY2tfcmRsb2NrAF9fcHRocmVhZF9tdXRleF90aW1lZGxvY2sAcHRocmVhZF9jb25kYXR0cl9zZXRjbG9jawB0aHJlYWRfcHJvZmlsZXJfYmxvY2sAX19wdGhyZWFkX211dGV4X2xvY2sAcHRocmVhZF9zcGluX2xvY2sAX19vZmxfbG9jawBfX2xvY2sAcHJvZmlsZXJCbG9jawBzdGFjawBfX3ZpAF9faQBmZmx1c2gAX19wdGhyZWFkX2RldGFjaABhcmcAbG9uZyBsb25nAHVuc2lnbmVkIGxvbmcAcHJvY2Vzc2luZwBwZW5kaW5nAGRsZXJyb3JfZmxhZwBjYW5jZWxidWYAZGxlcnJvcl9idWYAZ2V0bG5fYnVmAHNlbGYAb2ZmAGxiZgBfX2YAbWFwX3NpemUAc3RhY2tfc2l6ZQBidWZfc2l6ZQBndWFyZF9zaXplAHZhbHVlAGVtX3Rhc2tfcXVldWUAd3JpdGUAX19wdGhyZWFkX2tleV9kZWxldGUAcHRocmVhZF9zZXRjYW5jZWxzdGF0ZQBvbGRzdGF0ZQBub3RpZmljYXRpb25fc3RhdGUAZGV0YWNoX3N0YXRlAF9fcHRocmVhZF9rZXlfY3JlYXRlAF9fcHRocmVhZF9jcmVhdGUAY2xvc2UAd2Jhc2UAdGxzX2Jhc2UAbWFwX2Jhc2UAcHJlcGFyZQBwdGhyZWFkX211dGV4YXR0cl9zZXR0eXBlAHB0aHJlYWRfc2V0Y2FuY2VsdHlwZQBvbGR0eXBlAHN0YXJ0X3JvdXRpbmUAaW5pdF9yb3V0aW5lAGN1cnJlbnRTdGF0dXNTdGFydFRpbWUAbmFtZQBfX3VubG9ja2ZpbGUAX19sb2NrZmlsZQBkb3VibGUAY2FuY2VsZGlzYWJsZQBsb2NhbGUAZW1zY3JpcHRlbl9mdXRleF93YWtlAGNvb2tpZQBfX2Vycm5vX3N0b3JhZ2UAbW9kZQBfX3B0aHJlYWRfb25jZQB0c2QAY29uZAB3ZW5kAHJlbmQAc2hlbmQAL2hvbWUvcmFybXN0cm8vZ2l0L3BhcmNlbC1yZWFjdC13YXNtL2J1aWxkAGNoaWxkAF9lbXNjcmlwdGVuX3lpZWxkAHRpZABwaXBlX3BpZAB0aW1lcl9pZABmZAB0bHNfa2V5X3VzZWQAX19zdGRvdXRfdXNlZABfX3N0ZGVycl91c2VkAHRzZF91c2VkAHB0aHJlYWRfbXV0ZXhhdHRyX3NldHBzaGFyZWQAcHRocmVhZF9yd2xvY2thdHRyX3NldHBzaGFyZWQAcHRocmVhZF9jb25kYXR0cl9zZXRwc2hhcmVkAHByZXZfbG9ja2VkAG5leHRfbG9ja2VkAF9fcHRocmVhZABlbXNjcmlwdGVuX2lzX21haW5fcnVudGltZV90aHJlYWQAb2ZsX2hlYWQAX19yZWxlYXNlX3B0YwBfX2FjcXVpcmVfcHRjAGNhbmNlbGFzeW5jAHdhaXRpbmdfYXN5bmMAZnVuYwBwdGhyZWFkX3NldHNwZWNpZmljAHB0aHJlYWRfZ2V0c3BlY2lmaWMAdHZfbnNlYwB0dl9zZWMAdGltZXNwZWMAc3lzdGVtL2xpYi9saWJjL211c2wvc3JjL2Vycm5vL19fZXJybm9fbG9jYXRpb24uYwBzeXN0ZW0vbGliL2xpYmMvbXVzbC9zcmMvc3RkaW8vb2ZsLmMAc3lzdGVtL2xpYi9saWJjL211c2wvc3JjL3N0ZGlvL2ZmbHVzaC5jAHN5c3RlbS9saWIvbGliYy9tdXNsL3NyYy9zdGRpby9fX2xvY2tmaWxlLmMAc3lzdGVtL2xpYi9wdGhyZWFkL2xpYnJhcnlfcHRocmVhZF9zdHViLmMAX19wdGNiAGEAX19BUlJBWV9TSVpFX1RZUEVfXwBOT1RJRklDQVRJT05fUEVORElORwBOT1RJRklDQVRJT05fTk9ORQBfSU9fRklMRQBOT1RJRklDQVRJT05fUkVDRUlWRUQAdDIAbXVzdGJlemVyb18yAHQxAG11c3RiZXplcm9fMQBjbGFuZyB2ZXJzaW9uIDE4LjAuMGdpdCAoaHR0cHM6Ly9naXRodWIuY29tL2xsdm0vbGx2bS1wcm9qZWN0IGYyNDY0Y2EzMTdiZmVlZWRkZGI3Y2JkZWEzYzJjOGVjNDg3ODkwYmIpAAC+FQsuZGVidWdfbGluZXYAAAAEAE8AAAABAQH7Dg0AAQEBAQAAAAEAAAEvaG9tZS9yYXJtc3Ryby9naXQvcGFyY2VsLXJlYWN0LXdhc20AAGNwcC93YXNtLWVudHJ5LmNwcAABAAAAAAUCBwAAAAMCAQAFAiwAAAADAQUDCgEABQI0AAAAAAEBlgAAAAQAUAAAAAEBAfsODQABAQEBAAAAAQAAAS9ob21lL3Jhcm1zdHJvL2dpdC9wYXJjZWwtcmVhY3Qtd2FzbQAAY3BwL3NyYy9hZGROdW1zLmNwcAABAAAAAAUCQQAAAAMOAQAFAmsAAAADAQULCgEABQJyAAAABQ8GAQAFAnkAAAAFDQEABQKAAAAABQMBAAUChAAAAAABAWYAAAAEAEkAAAABAQH7Dg0AAQEBAQAAAAEAAAFzeXN0ZW0vbGli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AAAAIAAAAP/////+////AAAAABIAAAD/////vQAAAAAAAAAPAAAAAAAAAAAAAAD+/////v////7////+////AAAAAAAAAAD+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7////+/////v////7///8AAAAAAQAAAAAAAAABAAAA/v////7////+/////v////7////+////AAAAAAAAAADDAAAAzwAAANAAAADYAAAAAAAAAAAAAADZAAAA3QAAAAAAAAABAAAAAAAAAAAAAAD/////gQIAAAAAAAAIAAAA/////4oCAAAAAAAACgAAAP////+VAgAAAAAAABoAAAD/////sAIAAAAAAAAIAAAAAAAAAAAAAAAAjgIKLmRlYnVnX2xvY/////9WAAAAAAAAAAIAAAAEAO0CAJ8BAAAAAQAAAAQA7QACnwAAAAAAAAAA/////wcAAAABAAAAAQAAAAQA7QIAnwEAAAABAAAABADtAAGfAAAAAAAAAAD/////BwAAAAEAAAABAAAABADtAgCfAQAAAAEAAAAEAO0AAZ8YAAAAGgAAAAQA7QIAnwEAAAABAAAABADtAAKfAAAAAAAAAAAAAAAARAAAAAQA7QAAn0sAAABNAAAABADtAgCfTQAAAI4AAAAEAO0AAJ+TAAAAlQAAAAQA7QIAn5UAAAA+AQAABADtAACfAAAAAAAAAAANAAAAKAAAAAMAEQCfAAAAAAAAAAA=';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  var binary = tryParseAsDataURI(file);
  if (binary) {
    return binary;
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw "both async and sync fetching of the wasm failed";
}

function getBinaryPromise(binaryFile) {

  // Otherwise, getBinarySync should be able to get it synchronously
  return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
  return getBinaryPromise(binaryFile).then((binary) => {
    return WebAssembly.instantiate(binary, imports);
  }).then((instance) => {
    return instance;
  }).then(receiver, (reason) => {
    err(`failed to asynchronously prepare wasm: ${reason}`);

    // Warn on some common problems.
    if (isFileURI(wasmBinaryFile)) {
      err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
    }
    abort(reason);
  });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
  return instantiateArrayBuffer(binaryFile, imports, callback);
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;

    

    wasmMemory = wasmExports['memory'];
    
    assert(wasmMemory, "memory not found in wasm exports");
    // This assertion doesn't hold when emscripten is run in --post-link
    // mode.
    // TODO(sbc): Read INITIAL_MEMORY out of the wasm file in post-link mode.
    //assert(wasmMemory.buffer.byteLength === 16777216);
    updateMemoryViews();

    addOnInit(wasmExports['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');
    return wasmExports;
  }
  // wait for the pthread pool (if any)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module['instantiateWasm']) {

    try {
      return Module['instantiateWasm'](info, receiveInstance);
    } catch(e) {
      err(`Module.instantiateWasm callback failed with error: ${e}`);
        // If instantiation fails, reject the module ready promise.
        readyPromiseReject(e);
    }
  }

  // If instantiation fails, reject the module ready promise.
  instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// include: runtime_debug.js
function legacyModuleProp(prop, newName, incomming=true) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      get() {
        let extra = incomming ? ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)' : '';
        abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);

      }
    });
  }
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
}

function missingGlobal(sym, msg) {
  if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get() {
        warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
        return undefined;
      }
    });
  }
}

missingGlobal('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');
missingGlobal('asm', 'Please use wasmExports instead');

function missingLibrarySymbol(sym) {
  if (typeof globalThis !== 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
    Object.defineProperty(globalThis, sym, {
      configurable: true,
      get() {
        // Can't `abort()` here because it would break code that does runtime
        // checks.  e.g. `if (typeof SDL === 'undefined')`.
        var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
        // DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
        // library.js, which means $name for a JS name with no prefix, or name
        // for a JS name like _name.
        var librarySymbol = sym;
        if (!librarySymbol.startsWith('_')) {
          librarySymbol = '$' + sym;
        }
        msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        warnOnce(msg);
        return undefined;
      }
    });
  }
  // Any symbol that is not included from the JS libary is also (by definition)
  // not exported on the Module object.
  unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get() {
        var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      }
    });
  }
}

// Used by XXXXX_DEBUG settings to output debug messages.
function dbg(text) {
  // TODO(sbc): Make this configurable somehow.  Its not always convenient for
  // logging to show up as warnings.
  console.warn.apply(console, arguments);
}
// end include: runtime_debug.js
// === Body ===

// end include: preamble.js

  /** @constructor */
  function ExitStatus(status) {
      this.name = 'ExitStatus';
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }

  var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    };

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': abort('to do getValue(i64) use WASM_BIGINT');
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      case '*': return HEAPU32[((ptr)>>2)];
      default: abort(`invalid type for getValue: ${type}`);
    }
  }

  var noExitRuntime = Module['noExitRuntime'] || true;

  var ptrToString = (ptr) => {
      assert(typeof ptr === 'number');
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      ptr >>>= 0;
      return '0x' + ptr.toString(16).padStart(8, '0');
    };

  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': abort('to do setValue(i64) use WASM_BIGINT');
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      case '*': HEAPU32[((ptr)>>2)] = value; break;
      default: abort(`invalid type for setValue: ${type}`);
    }
  }

  var warnOnce = (text) => {
      warnOnce.shown ||= {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    };

  
  var runtimeKeepaliveCounter = 0;
  var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
  
  var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
  
    /**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */
  var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.  Also, use the length info to avoid running tiny
      // strings through TextDecoder, since .subarray() allocates garbage.
      // (As a tiny code save trick, compare endPtr against endIdx using a negation,
      // so that undefined means Infinity)
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      // If building with TextDecoder, we have already computed the string length
      // above, so test loop end condition against that
      while (idx < endPtr) {
        // For UTF8 byte structure, see:
        // http://en.wikipedia.org/wiki/UTF-8#Description
        // https://www.ietf.org/rfc/rfc2279.txt
        // https://tools.ietf.org/html/rfc3629
        var u0 = heapOrArray[idx++];
        if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
  
        if (u0 < 0x10000) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
      }
      return str;
    };
  
    /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */
  var UTF8ToString = (ptr, maxBytesToRead) => {
      assert(typeof ptr == 'number', `UTF8ToString expects a number (got ${typeof ptr})`);
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    };
  var SYSCALLS = {
  varargs:undefined,
  get() {
        assert(SYSCALLS.varargs != undefined);
        // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
        var ret = HEAP32[((+SYSCALLS.varargs)>>2)];
        SYSCALLS.varargs += 4;
        return ret;
      },
  getp() { return SYSCALLS.get() },
  getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
  };
  var _proc_exit = (code) => {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        Module['onExit']?.(code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    };
  
  /** @param {boolean|number=} implicit */
  var exitJS = (status, implicit) => {
      EXITSTATUS = status;
  
      checkUnflushedContent();
  
      // if exit() was called explicitly, warn the user if the runtime isn't actually being shut down
      if (keepRuntimeAlive() && !implicit) {
        var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
        readyPromiseReject(msg);
        err(msg);
      }
  
      _proc_exit(status);
    };

  var handleException = (e) => {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      checkStackCookie();
      if (e instanceof WebAssembly.RuntimeError) {
        if (_emscripten_stack_get_current() <= 0) {
          err('Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)');
        }
      }
      quit_(1, e);
    };

  var getCFunc = (ident) => {
      var func = Module['_' + ident]; // closure exported function
      assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
      return func;
    };
  
  var writeArrayToMemory = (array, buffer) => {
      assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
      HEAP8.set(array, buffer);
    };
  
  var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i); // possibly a lead surrogate
        if (c <= 0x7F) {
          len++;
        } else if (c <= 0x7FF) {
          len += 2;
        } else if (c >= 0xD800 && c <= 0xDFFF) {
          len += 4; ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
  
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      assert(typeof str === 'string', `stringToUTF8Array expects a string (got ${typeof str})`);
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0))
        return 0;
  
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
        var u = str.charCodeAt(i); // possibly a lead surrogate
        if (u >= 0xD800 && u <= 0xDFFF) {
          var u1 = str.charCodeAt(++i);
          u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
        }
        if (u <= 0x7F) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 0x7FF) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 0xC0 | (u >> 6);
          heap[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 0xE0 | (u >> 12);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          if (u > 0x10FFFF) warnOnce('Invalid Unicode code point ' + ptrToString(u) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
          heap[outIdx++] = 0xF0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };
  var stringToUTF8OnStack = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    };
  
  
    /**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */
  var ccall = (ident, returnType, argTypes, args, opts) => {
      // For fast lookup of conversion functions
      var toC = {
        'string': (str) => {
          var ret = 0;
          if (str !== null && str !== undefined && str !== 0) { // null string
            // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
            ret = stringToUTF8OnStack(str);
          }
          return ret;
        },
        'array': (arr) => {
          var ret = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret);
          return ret;
        }
      };
  
      function convertReturnValue(ret) {
        if (returnType === 'string') {
          
          return UTF8ToString(ret);
        }
        if (returnType === 'boolean') return Boolean(ret);
        return ret;
      }
  
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      assert(returnType !== 'array', 'Return type should not be "array".');
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var ret = func.apply(null, cArgs);
      function onDone(ret) {
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret);
      }
  
      ret = onDone(ret);
      return ret;
    };

  
  
    /**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
  var cwrap = (ident, returnType, argTypes, opts) => {
      return function() {
        return ccall(ident, returnType, argTypes, arguments, opts);
      }
    };
function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
}
var wasmImports = {
  
};
var wasmExports = createWasm();
var ___wasm_call_ctors = createExportWrapper('__wasm_call_ctors');
var _main = createExportWrapper('main');
var _addNums = Module['_addNums'] = createExportWrapper('addNums');
var ___errno_location = createExportWrapper('__errno_location');
var _fflush = Module['_fflush'] = createExportWrapper('fflush');
var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports['emscripten_stack_init'])();
var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports['emscripten_stack_get_free'])();
var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports['emscripten_stack_get_base'])();
var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports['emscripten_stack_get_end'])();
var stackSave = createExportWrapper('stackSave');
var stackRestore = createExportWrapper('stackRestore');
var stackAlloc = createExportWrapper('stackAlloc');
var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports['emscripten_stack_get_current'])();


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

Module['ccall'] = ccall;
Module['cwrap'] = cwrap;
var missingLibrarySymbols = [
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertI32PairToI53Checked',
  'convertU32PairToI53',
  'zeroMemory',
  'getHeapMax',
  'abortOnCannotGrowMemory',
  'growMemory',
  'isLeapYear',
  'ydayFromDate',
  'arraySum',
  'addDays',
  'setErrNo',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'getHostByName',
  'initRandomFill',
  'randomFill',
  'getCallstack',
  'emscriptenLog',
  'convertPCtoSourceLocation',
  'readEmAsmArgs',
  'jstoi_q',
  'jstoi_s',
  'getExecutableName',
  'listenOnce',
  'autoResumeAudioContext',
  'dynCallLegacy',
  'getDynCaller',
  'dynCall',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'asmjsMangle',
  'asyncLoad',
  'alignMemory',
  'mmapAlloc',
  'handleAllocatorInit',
  'HandleAllocator',
  'getNativeTypeSize',
  'STACK_SIZE',
  'STACK_ALIGN',
  'POINTER_SIZE',
  'ASSERTIONS',
  'uleb128Encode',
  'sigToWasmTypes',
  'generateFuncType',
  'convertJsFunctionToWasm',
  'getEmptyTableSlot',
  'updateTableMap',
  'getFunctionAddress',
  'addFunction',
  'removeFunction',
  'reallyNegative',
  'unSign',
  'strLen',
  'reSign',
  'formatString',
  'intArrayFromString',
  'intArrayToString',
  'AsciiToString',
  'stringToAscii',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'stringToNewUTF8',
  'registerKeyEventCallback',
  'maybeCStringToJsString',
  'findEventTarget',
  'findCanvasEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'disableGamepadApiIfItThrows',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'battery',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'demangle',
  'demangleAll',
  'jsStackTrace',
  'stackTrace',
  'getEnvStrings',
  'checkWasiClock',
  'flush_NO_FILESYSTEM',
  'wasiRightsToMuslOFlags',
  'wasiOFlagsToMuslOFlags',
  'createDyncallWrapper',
  'safeSetTimeout',
  'setImmediateWrapped',
  'clearImmediateWrapped',
  'polyfillSetImmediate',
  'getPromise',
  'makePromise',
  'idsToPromises',
  'makePromiseCallback',
  'ExceptionInfo',
  'findMatchingCatch',
  'Browser_asyncPrepareDataCounter',
  'setMainLoop',
  'getSocketFromFD',
  'getSocketAddress',
  'FS_createPreloadedFile',
  'FS_modeStringToFlags',
  'FS_getMode',
  'FS_stdin_getChar',
  'FS_createDataFile',
  'FS_unlink',
  'FS_mkdirTree',
  '_setNetworkCallback',
  'heapObjectForWebGLType',
  'heapAccessShiftForWebGLHeap',
  'webgl_enable_ANGLE_instanced_arrays',
  'webgl_enable_OES_vertex_array_object',
  'webgl_enable_WEBGL_draw_buffers',
  'webgl_enable_WEBGL_multi_draw',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'colorChannelsInGlTextureFormat',
  'emscriptenWebGLGetTexPixelData',
  '__glGenObject',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  '__glGetActiveAttribOrUniform',
  'writeGLArray',
  'registerWebGlEventCallback',
  'runAndAbortIfError',
  'SDL_unicode',
  'SDL_ttfContext',
  'SDL_audio',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
  'writeStringToMemory',
  'writeAsciiToMemory',
];
missingLibrarySymbols.forEach(missingLibrarySymbol)

var unexportedSymbols = [
  'run',
  'addOnPreRun',
  'addOnInit',
  'addOnPreMain',
  'addOnExit',
  'addOnPostRun',
  'addRunDependency',
  'removeRunDependency',
  'FS_createFolder',
  'FS_createPath',
  'FS_createLazyFile',
  'FS_createLink',
  'FS_createDevice',
  'FS_readFile',
  'out',
  'err',
  'callMain',
  'abort',
  'wasmMemory',
  'wasmExports',
  'stackAlloc',
  'stackSave',
  'stackRestore',
  'getTempRet0',
  'setTempRet0',
  'writeStackCookie',
  'checkStackCookie',
  'intArrayFromBase64',
  'tryParseAsDataURI',
  'ptrToString',
  'exitJS',
  'ENV',
  'MONTH_DAYS_REGULAR',
  'MONTH_DAYS_LEAP',
  'MONTH_DAYS_REGULAR_CUMULATIVE',
  'MONTH_DAYS_LEAP_CUMULATIVE',
  'ERRNO_CODES',
  'ERRNO_MESSAGES',
  'DNS',
  'Protocols',
  'Sockets',
  'timers',
  'warnOnce',
  'UNWIND_CACHE',
  'readEmAsmArgsArray',
  'handleException',
  'keepRuntimeAlive',
  'wasmTable',
  'noExitRuntime',
  'getCFunc',
  'freeTableIndexes',
  'functionsInTableMap',
  'setValue',
  'getValue',
  'PATH',
  'PATH_FS',
  'UTF8Decoder',
  'UTF8ArrayToString',
  'UTF8ToString',
  'stringToUTF8Array',
  'stringToUTF8',
  'lengthBytesUTF8',
  'UTF16Decoder',
  'stringToUTF8OnStack',
  'writeArrayToMemory',
  'JSEvents',
  'specialHTMLTargets',
  'currentFullscreenStrategy',
  'restoreOldWindowedStyle',
  'ExitStatus',
  'promiseMap',
  'uncaughtExceptionCount',
  'exceptionLast',
  'exceptionCaught',
  'Browser',
  'wget',
  'SYSCALLS',
  'preloadPlugins',
  'FS_stdin_getChar_buffer',
  'FS',
  'MEMFS',
  'TTY',
  'PIPEFS',
  'SOCKFS',
  'tempFixedLengthArray',
  'miniTempWebGLFloatBuffers',
  'miniTempWebGLIntBuffers',
  'GL',
  'emscripten_webgl_power_preferences',
  'AL',
  'GLUT',
  'EGL',
  'GLEW',
  'IDBStore',
  'SDL',
  'SDL_gfx',
  'allocateUTF8',
  'allocateUTF8OnStack',
];
unexportedSymbols.forEach(unexportedRuntimeSymbol);



var calledRun;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function callMain() {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  var entryFunction = _main;

  var argc = 0;
  var argv = 0;

  try {

    var ret = entryFunction(argc, argv);

    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  }
  catch (e) {
    return handleException(e);
  }
}

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

function run() {

  if (runDependencies > 0) {
    return;
  }

    stackCheckInit();

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    readyPromiseResolve(Module);
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (shouldRunNow) callMain();

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = (x) => {
    has = true;
  }
  try { // it doesn't matter if it fails
    _fflush(0);
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.');
    warnOnce('(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)');
  }
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;

if (Module['noInitialRun']) shouldRunNow = false;

run();


// end include: postamble.js


  return moduleArg.ready
}
);
})();
;
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], () => Module);
