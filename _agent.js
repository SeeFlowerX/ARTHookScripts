(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJavaMembersFromClass = void 0;
const ArtMethod_1 = require("../android/implements/10/art/mirror/ArtMethod");
const ArrayCurrentItems = [];
function getJavaMembersFromClass(className = "com.unity3d.player.UnityPlayer") {
    const ar_methods = [];
    const ar_fields = [];
    const ar_fields_name = [];
    Java.perform(() => {
        const clazz = Java.use(className);
        clazz.$ownMembers.forEach((name) => {
            try {
                if (Object.getOwnPropertyNames(clazz[name]).includes("_p")) {
                    const field = clazz[name];
                    ar_fields.push(field);
                    ar_fields_name.push(name);
                }
                else {
                    const method = clazz[name].overloads;
                    ar_methods.push(...method);
                }
            }
            catch (error) {
            }
        });
    });
    return { "methods": ar_methods, "fields": ar_fields, "fields_name": ar_fields_name };
}
exports.getJavaMembersFromClass = getJavaMembersFromClass;
globalThis.listJavaMethods = (className = "com.unity3d.player.UnityPlayer", showInfo = true) => {
    let countFields = 0;
    let countMethods = 0;
    if (typeof className === "number") {
        if (className >= ArrayCurrentItems.length) {
            throw new Error(`index out of range, current length is ${ArrayCurrentItems.length}`);
        }
        className = ArrayCurrentItems[className];
    }
    const members = getJavaMembersFromClass(className);
    LOGD(`\n\n${className}`);
    try {
        LOGD(`\nfields :`);
        members.fields.map((field, index) => {
            let result = "";
            let flag = "";
            let currentIndex = ++countFields;
            try {
                result = `\n\t[${currentIndex}] ${flag}${members.fields_name[index]} : ${JSON.stringify(field.value)} | ${field.fieldReturnType}`;
            }
            catch (error) {
                result = `\n\t[${currentIndex}] ${flag}${members.fields_name[index]} : ${JSON.stringify(field)}`;
            }
            return result;
        }).forEach(LOGD);
        newLine();
    }
    catch (e) {
        LOGE(e);
    }
    try {
        LOGD(`\nmethods :`);
        members.methods.forEach((method) => {
            const artMethod = new ArtMethod_1.ArtMethod(method.handle);
            LOGD(`\n\t[${++countMethods}] ${artMethod}`);
            if (showInfo)
                LOGZ(`\n\t\t${artMethod.getInfo()}`);
        });
        newLine();
    }
    catch (e) {
        LOGE(e);
    }
};
globalThis.enumClasses = () => {
    let countClasses = -1;
    newLine();
    ArrayCurrentItems.splice(0, ArrayCurrentItems.length);
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            ArrayCurrentItems.push(className);
            LOGD(`[${++countClasses}] ${className}`);
        },
        onComplete: function () {
            LOGZ(`\nTotal classes: ${countClasses + 1}\n`);
        }
    });
};
globalThis.findJavaClasses = (keyword, searchInstance = true) => {
    let countClasses = -1;
    newLine();
    ArrayCurrentItems.splice(0, ArrayCurrentItems.length);
    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            if (className.includes(keyword)) {
                ArrayCurrentItems.push(className);
                LOGD(`[${++countClasses}] ${className}`);
                if (searchInstance) {
                    const instances = ChooseClasses(countClasses, true);
                    let instanceCount = -1;
                    if (instances != undefined && instances.length > 0) {
                        LOGZ(`\t[${++instanceCount}] ${instances[0]}}]`);
                    }
                }
            }
        },
        onComplete: function () {
            LOGZ(`\nTotal classes: ${countClasses + 1}\n`);
        }
    });
};
globalThis.ChooseClasses = (className, retArray = false) => {
    let classNameLocal;
    if (typeof className === "number") {
        if (className >= ArrayCurrentItems.length)
            throw new Error(`index out of range, current length is ${ArrayCurrentItems.length}`);
        classNameLocal = ArrayCurrentItems[className];
    }
    else {
        classNameLocal = className;
    }
    let countClasses = -1;
    let ret = [];
    Java.perform(() => {
        try {
            Java.choose(classNameLocal, {
                onMatch: function (instance) {
                    if (retArray) {
                        ret.push(instance);
                    }
                    else {
                        LOGD(`[${++countClasses}] ${instance}`);
                    }
                },
                onComplete: function () {
                    if (!retArray)
                        LOGZ(`\nTotal instance: ${countClasses + 1}\n`);
                }
            });
        }
        catch (error) {
        }
    });
    if (retArray)
        return ret;
};
},{"../android/implements/10/art/mirror/ArtMethod":19}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./JavaUtil");
},{"./JavaUtil":1}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./mirror/include");
require("./SizeOfClass");
},{"./SizeOfClass":3,"./mirror/include":7}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeapReference = void 0;
const JSHandle_1 = require("../../../JSHandle");
class HeapReference extends JSHandle_1.JSHandle {
    _factory;
    constructor(factory, handle) {
        super(handle.readU32());
        this._factory = factory;
    }
    get root() {
        return this._factory(this.handle);
    }
    toString() {
        return `HeapReference<${this.handle}> [U32]`;
    }
}
exports.HeapReference = HeapReference;
},{"../../../JSHandle":9}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./HeapReference");
require("./IArtMethod");
},{"./HeapReference":5,"./IArtMethod":6}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
},{"./art/include":4}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSHandle = void 0;
class JSHandle {
    handle;
    constructor(handle) {
        this.handle = (typeof handle === "number") ? ptr(handle) : handle;
    }
    get SizeOfClass() {
        return 0;
    }
}
exports.JSHandle = JSHandle;
globalThis.Arch = Process.arch;
globalThis.PointerSize = Process.pointerSize;
},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtObject = void 0;
const HeapReference_1 = require("./Interface/art/mirror/HeapReference");
const JSHandle_1 = require("./JSHandle");
class ArtObject extends JSHandle_1.JSHandle {
    klass_;
    monitor_;
    constructor(handle) {
        super(handle);
        this.klass_ = this.handle;
        this.monitor_ = this.handle.add(PointerSize);
    }
    get SizeOfClass() {
        return PointerSize + 0x4;
    }
    get klass() {
        return new HeapReference_1.HeapReference((handle) => new ArtClass(handle), this.klass_.readPointer());
    }
    get monitor() {
        return this.handle.add(PointerSize).readU32();
    }
}
exports.ArtObject = ArtObject;
globalThis.ArtObject = ArtObject;
},{"./Interface/art/mirror/HeapReference":5,"./JSHandle":9}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArtMethodSpec = void 0;
const machine_code_1 = require("./machine-code");
const jsizeSize = 4;
const pointerSize = Process.pointerSize;
const kAccPublic = 0x0001;
const kAccStatic = 0x0008;
const kAccFinal = 0x0010;
const kAccNative = 0x0100;
const kAccFastNative = 0x00080000;
const kAccCriticalNative = 0x00200000;
const kAccFastInterpreterToInterpreterInvoke = 0x40000000;
const kAccSkipAccessChecks = 0x00080000;
const kAccSingleImplementation = 0x08000000;
const kAccNterpEntryPointFastPathFlag = 0x00100000;
const kAccNterpInvokeFastPathFlag = 0x00200000;
const kAccPublicApi = 0x10000000;
const kAccXposedHookedMethod = 0x10000000;
const kPointer = 0x0;
const STD_STRING_SIZE = 3 * pointerSize;
const STD_VECTOR_SIZE = 3 * pointerSize;
let systemPropertyGet = null;
const PROP_VALUE_MAX = 92;
const nativeFunctionOptions = {
    exceptions: 'propagate'
};
function getAndroidSystemProperty(name) {
    if (systemPropertyGet === null) {
        systemPropertyGet = new NativeFunction(Module.getExportByName('libc.so', '__system_property_get'), 'int', ['pointer', 'pointer'], nativeFunctionOptions);
    }
    const buf = Memory.alloc(PROP_VALUE_MAX);
    systemPropertyGet(Memory.allocUtf8String(name), buf);
    return buf.readUtf8String();
}
function getAndroidApiLevel() {
    return parseInt(getAndroidSystemProperty('ro.build.version.sdk'), 10);
}
function getAndroidCodename() {
    return getAndroidSystemProperty('ro.build.version.codename');
}
let cachedArtClassLinkerSpec = null;
function tryGetArtClassLinkerSpec(runtime, runtimeSpec) {
    if (cachedArtClassLinkerSpec !== null) {
        return cachedArtClassLinkerSpec;
    }
    const { classLinker: classLinkerOffset, internTable: internTableOffset } = runtimeSpec.offset;
    const classLinker = runtime.add(classLinkerOffset).readPointer();
    const internTable = runtime.add(internTableOffset).readPointer();
    const startOffset = (pointerSize === 4) ? 100 : 200;
    const endOffset = startOffset + (100 * pointerSize);
    const apiLevel = getAndroidApiLevel();
    let spec = null;
    for (let offset = startOffset; offset !== endOffset; offset += pointerSize) {
        const value = classLinker.add(offset).readPointer();
        if (value.equals(internTable)) {
            let delta;
            if (apiLevel >= 30 || getAndroidCodename() === 'R') {
                delta = 6;
            }
            else if (apiLevel >= 29) {
                delta = 4;
            }
            else if (apiLevel >= 23) {
                delta = 3;
            }
            else {
                delta = 5;
            }
            const quickGenericJniTrampolineOffset = offset + (delta * pointerSize);
            let quickResolutionTrampolineOffset;
            if (apiLevel >= 23) {
                quickResolutionTrampolineOffset = quickGenericJniTrampolineOffset - (2 * pointerSize);
            }
            else {
                quickResolutionTrampolineOffset = quickGenericJniTrampolineOffset - (3 * pointerSize);
            }
            spec = {
                offset: {
                    quickResolutionTrampoline: quickResolutionTrampolineOffset,
                    quickImtConflictTrampoline: quickGenericJniTrampolineOffset - pointerSize,
                    quickGenericJniTrampoline: quickGenericJniTrampolineOffset,
                    quickToInterpreterBridgeTrampoline: quickGenericJniTrampolineOffset + pointerSize
                }
            };
            break;
        }
    }
    if (spec !== null) {
        cachedArtClassLinkerSpec = spec;
    }
    return spec;
}
function parsex86InstrumentationOffset(insn) {
    if (insn.mnemonic !== 'lea') {
        return null;
    }
    const offset = insn.operands[1].value.disp;
    if (offset < 0x100 || offset > 0x400) {
        return null;
    }
    return offset;
}
function parseArmInstrumentationOffset(insn) {
    if (insn.mnemonic !== 'add.w') {
        return null;
    }
    const ops = insn.operands;
    if (ops.length !== 3) {
        return null;
    }
    const op2 = ops[2];
    if (op2.type !== 'imm') {
        return null;
    }
    return op2.value;
}
function parseArm64InstrumentationOffset(insn) {
    if (insn.mnemonic !== 'add') {
        return null;
    }
    const ops = insn.operands;
    if (ops.length !== 3) {
        return null;
    }
    if (ops[0].value === 'sp' || ops[1].value === 'sp') {
        return null;
    }
    const op2 = ops[2];
    if (op2.type !== 'imm') {
        return null;
    }
    const offset = op2.value.valueOf();
    if (offset < 0x100 || offset > 0x400) {
        return null;
    }
    return offset;
}
const instrumentationOffsetParsers = {
    ia32: parsex86InstrumentationOffset,
    x64: parsex86InstrumentationOffset,
    arm: parseArmInstrumentationOffset,
    arm64: parseArm64InstrumentationOffset
};
function tryDetectInstrumentationOffset(api) {
    const impl = api['art::Runtime::DeoptimizeBootImage'];
    if (impl === undefined) {
        return null;
    }
    return (0, machine_code_1.parseInstructionsAt)(impl, instrumentationOffsetParsers[Process.arch], { limit: 30 });
}
function getArtRuntimeSpec(api) {
    const vm = api.vm;
    const runtime = api.artRuntime;
    const startOffset = (pointerSize === 4) ? 200 : 384;
    const endOffset = startOffset + (100 * pointerSize);
    const apiLevel = getAndroidApiLevel();
    const codename = getAndroidCodename();
    let spec = null;
    for (let offset = startOffset; offset !== endOffset; offset += pointerSize) {
        const value = runtime.add(offset).readPointer();
        if (value.equals(vm)) {
            let classLinkerOffsets;
            let jniIdManagerOffset = null;
            if (apiLevel >= 33 || codename === 'Tiramisu') {
                classLinkerOffsets = [offset - (4 * pointerSize)];
                jniIdManagerOffset = offset - pointerSize;
            }
            else if (apiLevel >= 30 || codename === 'R') {
                classLinkerOffsets = [offset - (3 * pointerSize), offset - (4 * pointerSize)];
                jniIdManagerOffset = offset - pointerSize;
            }
            else if (apiLevel >= 29) {
                classLinkerOffsets = [offset - (2 * pointerSize)];
            }
            else if (apiLevel >= 27) {
                classLinkerOffsets = [offset - STD_STRING_SIZE - (3 * pointerSize)];
            }
            else {
                classLinkerOffsets = [offset - STD_STRING_SIZE - (2 * pointerSize)];
            }
            for (const classLinkerOffset of classLinkerOffsets) {
                const internTableOffset = classLinkerOffset - pointerSize;
                const threadListOffset = internTableOffset - pointerSize;
                let heapOffset;
                if (apiLevel >= 24) {
                    heapOffset = threadListOffset - (8 * pointerSize);
                }
                else if (apiLevel >= 23) {
                    heapOffset = threadListOffset - (7 * pointerSize);
                }
                else {
                    heapOffset = threadListOffset - (4 * pointerSize);
                }
                const candidate = {
                    offset: {
                        heap: heapOffset,
                        threadList: threadListOffset,
                        internTable: internTableOffset,
                        classLinker: classLinkerOffset,
                        jniIdManager: jniIdManagerOffset
                    }
                };
                if (tryGetArtClassLinkerSpec(runtime, candidate) !== null) {
                    spec = candidate;
                    break;
                }
            }
            break;
        }
    }
    if (spec === null) {
        throw new Error('Unable to determine Runtime field offsets');
    }
    spec.offset.instrumentation = tryDetectInstrumentationOffset(api);
    spec.offset.jniIdsIndirection = tryDetectJniIdsIndirectionOffset();
    return spec;
}
function parsex86JniIdsIndirectionOffset(insn) {
    if (insn.mnemonic === 'cmp') {
        return insn.operands[0].value.disp;
    }
    return null;
}
function parseArmJniIdsIndirectionOffset(insn) {
    if (insn.mnemonic === 'ldr.w') {
        return insn.operands[1].value.disp;
    }
    return null;
}
function parseArm64JniIdsIndirectionOffset(insn, prevInsn) {
    if (prevInsn === null) {
        return null;
    }
    const { mnemonic } = insn;
    const { mnemonic: prevMnemonic } = prevInsn;
    if ((mnemonic === 'cmp' && prevMnemonic === 'ldr') || (mnemonic === 'bl' && prevMnemonic === 'str')) {
        return prevInsn.operands[1].value.disp;
    }
    return null;
}
const jniIdsIndirectionOffsetParsers = {
    ia32: parsex86JniIdsIndirectionOffset,
    x64: parsex86JniIdsIndirectionOffset,
    arm: parseArmJniIdsIndirectionOffset,
    arm64: parseArm64JniIdsIndirectionOffset
};
function tryDetectJniIdsIndirectionOffset() {
    const impl = Module.findExportByName('libart.so', '_ZN3art7Runtime12SetJniIdTypeENS_9JniIdTypeE');
    if (impl === null) {
        return null;
    }
    const offset = (0, machine_code_1.parseInstructionsAt)(impl, jniIdsIndirectionOffsetParsers[Process.arch], { limit: 20 });
    if (offset === null) {
        throw new Error('Unable to determine Runtime.jni_ids_indirection_ offset');
    }
    return offset;
}
function unwrapMethodId(methodId) {
    const api = Java.api;
    const runtimeOffset = getArtRuntimeSpec(api).offset;
    const jniIdManagerOffset = runtimeOffset.jniIdManager;
    const jniIdsIndirectionOffset = runtimeOffset.jniIdsIndirection;
    if (jniIdManagerOffset !== null && jniIdsIndirectionOffset !== null) {
        const runtime = api.artRuntime;
        const jniIdsIndirection = runtime.add(jniIdsIndirectionOffset).readInt();
        if (jniIdsIndirection !== kPointer) {
            const jniIdManager = runtime.add(jniIdManagerOffset).readPointer();
            return api['art::jni::JniIdManager::DecodeMethodId'](jniIdManager, methodId);
        }
    }
    return methodId;
}
function getArtMethodSpec() {
    let spec;
    Java.perform(() => {
        const api = Java.api;
        const env = Java.vm.getEnv();
        const process = env.findClass('android/os/Process');
        const getElapsedCpuTime = unwrapMethodId(env.getStaticMethodId(process, 'getElapsedCpuTime', '()J'));
        env.deleteLocalRef(process);
        const runtimeModule = Process.getModuleByName('libandroid_runtime.so');
        const runtimeStart = runtimeModule.base;
        const runtimeEnd = runtimeStart.add(runtimeModule.size);
        const apiLevel = getAndroidApiLevel();
        const entrypointFieldSize = (apiLevel <= 21) ? 8 : Process.pointerSize;
        const expectedAccessFlags = kAccPublic | kAccStatic | kAccFinal | kAccNative;
        const relevantAccessFlagsMask = ~(kAccFastInterpreterToInterpreterInvoke | kAccPublicApi | kAccNterpInvokeFastPathFlag) >>> 0;
        let jniCodeOffset = null;
        let accessFlagsOffset = null;
        let remaining = 2;
        for (let offset = 0; offset !== 64 && remaining !== 0; offset += 4) {
            const field = getElapsedCpuTime.add(offset);
            if (jniCodeOffset === null) {
                const address = field.readPointer();
                if (address.compare(runtimeStart) >= 0 && address.compare(runtimeEnd) < 0) {
                    jniCodeOffset = offset;
                    remaining--;
                }
            }
            if (accessFlagsOffset === null) {
                const flags = field.readU32();
                if ((flags & relevantAccessFlagsMask) === expectedAccessFlags) {
                    accessFlagsOffset = offset;
                    remaining--;
                }
            }
        }
        if (remaining !== 0) {
            throw new Error('Unable to determine ArtMethod field offsets');
        }
        const quickCodeOffset = jniCodeOffset + entrypointFieldSize;
        const size = (apiLevel <= 21) ? (quickCodeOffset + 32) : (quickCodeOffset + Process.pointerSize);
        spec = {
            size,
            offset: {
                jniCode: jniCodeOffset,
                quickCode: quickCodeOffset,
                accessFlags: accessFlagsOffset
            }
        };
        if ('artInterpreterToCompiledCodeBridge' in api) {
            spec.offset.interpreterCode = jniCodeOffset - entrypointFieldSize;
        }
    });
    return spec;
}
exports.getArtMethodSpec = getArtMethodSpec;
globalThis.getArtFieldSpec = (handle) => {
    return {
        declaringClass: handle.add(0).readPointer(),
        accessFlags: handle.add(pointerSize).readU32(),
        fieldDexIdx: handle.add(pointerSize + 0x4).readU32(),
        offset: handle.add(pointerSize + 0x8).readU32(),
    };
};
globalThis.getArtMethodSpec = getArtMethodSpec;
globalThis.getAndroidSystemProperty = getAndroidSystemProperty;
globalThis.getAndroidApiLevel = getAndroidApiLevel;
globalThis.getAndroidCodename = getAndroidCodename;
},{"./machine-code":28}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexFile = void 0;
const StdString_1 = require("../../../../tools/StdString");
const JSHandle_1 = require("../../../JSHandle");
class DexFile extends JSHandle_1.JSHandle {
    static size_t_len = 32;
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `DexFile<${this.handle}> \n`;
        return disp;
    }
    PrettyMethod(method_idx, with_signature = true) {
        const PrettyMethodAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile12PrettyMethodEjb");
        const PrettyMethod = new NativeFunction(PrettyMethodAddr, "pointer", ["pointer", "pointer", "pointer"]);
        return new StdString_1.StdString(PrettyMethod(this.handle, ptr(method_idx), with_signature ? ptr(1) : NULL)).disposeToString();
    }
    CalculateChecksum() {
        const CalculateChecksumAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile17CalculateChecksumEv");
        const CalculateChecksum = new NativeFunction(CalculateChecksumAddr, "uint32", ["pointer"]);
        return CalculateChecksum(this.handle);
    }
    IsReadOnly() {
        const IsReadOnlyAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile10IsReadOnlyEv");
        const IsReadOnly = new NativeFunction(IsReadOnlyAddr, "bool", ["pointer"]);
        return IsReadOnly(this.handle);
    }
    DisableWrite() {
        const DisableWriteAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile12DisableWriteEv");
        const DisableWrite = new NativeFunction(DisableWriteAddr, "bool", ["pointer"]);
        return DisableWrite(this.handle);
    }
    EnableWrite() {
        const EnableWriteAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile11EnableWriteEv");
        const EnableWrite = new NativeFunction(EnableWriteAddr, "bool", ["pointer"]);
        return EnableWrite(this.handle);
    }
    PrettyType(type_idx) {
        const PrettyTypeAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile10PrettyTypeENS_3dex9TypeIndexE");
        const PrettyType = new NativeFunction(PrettyTypeAddr, "pointer", ["pointer", "pointer"]);
        return new StdString_1.StdString(PrettyType(this.handle, ptr(type_idx))).disposeToString();
    }
    get begin() {
        return this.handle.readPointer();
    }
    get size() {
        return this.handle.add(PointerSize * 1 + DexFile.size_t_len * 0).readU32();
    }
    get data_begin() {
        return this.handle.add(PointerSize * 1 + DexFile.size_t_len * 1).readPointer();
    }
    get data_size() {
        return this.handle.add(PointerSize * 2 + DexFile.size_t_len).readU32();
    }
    get location() {
        try {
            return new StdString_1.StdString(this.handle.add(PointerSize * 2 + DexFile.size_t_len * 2).readPointer()).disposeToString();
        }
        catch (error) {
            return "...";
        }
    }
    get location_checksum() {
        return this.handle.add(PointerSize * 3 + DexFile.size_t_len * 2).readU32();
    }
    get header() {
        return this.handle.add(PointerSize * 3 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get string_ids() {
        return this.handle.add(PointerSize * 4 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get type_ids() {
        return this.handle.add(PointerSize * 5 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get field_ids() {
        return this.handle.add(PointerSize * 6 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get method_ids() {
        return this.handle.add(PointerSize * 7 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get proto_ids() {
        return this.handle.add(PointerSize * 8 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get class_defs() {
        return this.handle.add(PointerSize * 9 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get method_handles() {
        return this.handle.add(PointerSize * 10 + DexFile.size_t_len * 2 + 32).readPointer();
    }
    get num_method_handles() {
        return this.handle.add(PointerSize * 11 + DexFile.size_t_len * 2 + 32).readU32();
    }
    get call_site_ids() {
        return this.handle.add(PointerSize * 11 + DexFile.size_t_len * 3 + 32).readPointer();
    }
    get num_call_site_ids() {
        return this.handle.add(PointerSize * 12 + DexFile.size_t_len * 3 + 32).readU32();
    }
    get hiddenapi_class_data() {
        return this.handle.add(PointerSize * 12 + DexFile.size_t_len * 4 + 32).readPointer();
    }
    get oat_dex_file() {
        return this.handle.add(PointerSize * 13 + DexFile.size_t_len * 4 + 32).readPointer();
    }
    get container() {
        return this.handle.add(PointerSize * 14 + DexFile.size_t_len * 4 + 32).readPointer();
    }
    get is_compact_dex() {
        return this.handle.add(PointerSize * 13 + DexFile.size_t_len * 4 + 32).readU8() == 1;
    }
    get hiddenapi_domain() {
        return this.handle.add(PointerSize * 13 + DexFile.size_t_len * 4 + 32 + 8).readPointer();
    }
}
exports.DexFile = DexFile;
globalThis.DexFile = DexFile;
},{"../../../../tools/StdString":31,"../../../JSHandle":9}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcRoot = void 0;
const JSHandle_1 = require("../../../JSHandle");
class GcRoot extends JSHandle_1.JSHandle {
    lsthandle;
    _factory;
    constructor(factory, handle) {
        super(handle.readU32());
        this.lsthandle = handle;
        this._factory = factory;
    }
    get root() {
        return this._factory(this.handle);
    }
    toString() {
        return `GcRoot<(read32)${this.lsthandle} -> ${this.handle}>`;
    }
}
exports.GcRoot = GcRoot;
},{"../../../JSHandle":9}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtInstruction = void 0;
const StdString_1 = require("../../../../tools/StdString");
const JSHandle_1 = require("../../../JSHandle");
class ArtInstruction extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    toString() {
        return this.constructor.name;
    }
    static get kInstructionNames() {
        const kInstructionNames_ptr = Module.findExportByName('libdexfile.so', '_ZN3art11Instruction17kInstructionNamesE');
        let arrary_ret = [];
        let loopAddaddress = kInstructionNames_ptr;
        while (!loopAddaddress.readPointer().isNull()) {
            arrary_ret.push(loopAddaddress.readPointer().readCString());
            loopAddaddress = loopAddaddress.add(Process.pointerSize);
        }
        return arrary_ret;
    }
    static get kInstructionDescriptors() {
        const kInstructionDescriptors_ptr = Module.findExportByName('libdexfile.so', '_ZN3art11Instruction23kInstructionDescriptorsE');
        let arrary_ret = [];
        let loopAddaddress = kInstructionDescriptors_ptr;
        while (!loopAddaddress.readPointer().isNull()) {
            arrary_ret.push(loopAddaddress.readPointer());
            loopAddaddress = loopAddaddress.add(Process.pointerSize);
        }
        return arrary_ret;
    }
    dumpString(dexFile) {
        const DumpString_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction10DumpStringEPKNS_7DexFileE");
        const DumpString_func = new NativeFunction(DumpString_ptr, ["pointer"], ["pointer", "pointer"]);
        const result = DumpString_func(this.handle, dexFile.handle);
        return new StdString_1.StdString(result).disposeToString();
    }
    dumpHex(code_units) {
        const DumpHex_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction7DumpHexEm");
        const DumpHex_func = new NativeFunction(DumpHex_ptr, ["pointer"], ["pointer", "int"]);
        const result = DumpHex_func(this.handle, code_units);
        return new StdString_1.StdString(result).disposeToString();
    }
    dumpHexLE(instr_code_units) {
        const DumpHexLE_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction9DumpHexLEEm");
        const DumpHexLE_func = new NativeFunction(DumpHexLE_ptr, ["pointer"], ["pointer", "int"]);
        const result = DumpHexLE_func(this.handle, instr_code_units);
        return new StdString_1.StdString(result).disposeToString();
    }
    sizeInCodeUnitsComplexOpcode() {
        const SizeInCodeUnitsComplexOpcode_ptr = Module.findExportByName("libdexfile.so", "_ZNK3art11Instruction28SizeInCodeUnitsComplexOpcodeEv");
        const SizeInCodeUnitsComplexOpcode_func = new NativeFunction(SizeInCodeUnitsComplexOpcode_ptr, ["pointer"], ["pointer"]);
        return SizeInCodeUnitsComplexOpcode_func(this.handle);
    }
}
exports.ArtInstruction = ArtInstruction;
globalThis.ArtInstruction = ArtInstruction;
},{"../../../../tools/StdString":31,"../../../JSHandle":9}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OatQuickMethodHeader = void 0;
const JSHandle_1 = require("../../../JSHandle");
class OatQuickMethodHeader extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    get vmap_table_offset() {
        return this.handle.add(0).readU32();
    }
    get code_size() {
        return this.handle.add(4).readU32();
    }
    get code() {
        return this.handle.add(8).readPointer();
    }
    toString() {
        return `${this.handle} -> vmap_table_offset: ${this.vmap_table_offset} code_size: ${this.code_size} code: ${this.code}`;
    }
}
exports.OatQuickMethodHeader = OatQuickMethodHeader;
},{"../../../JSHandle":9}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjPtr = void 0;
const JSHandle_1 = require("../../../JSHandle");
class ObjPtr extends JSHandle_1.JSHandle {
    constructor(handle) {
        super(handle);
    }
    get value() {
        return this.handle.readPointer();
    }
    toString() {
        return `${this.handle} -> ${this.value}`;
    }
}
exports.ObjPtr = ObjPtr;
},{"../../../JSHandle":9}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./DexFile");
require("./GcRoot");
require("./Instruction");
require("./OatQuickMethodHeader");
require("./ObjPtr");
require("./mirror/include");
},{"./DexFile":12,"./GcRoot":13,"./Instruction":14,"./OatQuickMethodHeader":15,"./ObjPtr":16,"./mirror/include":24}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtClass = void 0;
const HeapReference_1 = require("../../../../Interface/art/mirror/HeapReference");
const StdString_1 = require("../../../../../tools/StdString");
const Object_1 = require("../../../../Object");
const ClassLoader_1 = require("./ClassLoader");
const ClassExt_1 = require("./ClassExt");
const DexCache_1 = require("./DexCache");
const IfTable_1 = require("./IfTable");
const HeapReferenceSize = PointerSize;
class ArtClass extends Object_1.ArtObject {
    constructor(handle) {
        super(handle);
    }
    get SizeOfClass() {
        return super.SizeOfClass + HeapReferenceSize * 8 + 64 * 3 + 32 * 5;
    }
    toString() {
        return `ArtClass< ${this.handle} >`;
    }
    get class_loader() {
        return new HeapReference_1.HeapReference((handle) => new ClassLoader_1.ArtClassLoader(handle), this.handle.add(HeapReferenceSize * 0));
    }
    get component_type() {
        return new HeapReference_1.HeapReference((handle) => new ArtClass(handle), this.handle.add(HeapReferenceSize * 1));
    }
    get dex_cache() {
        return new HeapReference_1.HeapReference((handle) => new DexCache_1.DexCache(handle), this.handle.add(HeapReferenceSize * 2));
    }
    get ext_data() {
        return new HeapReference_1.HeapReference((handle) => new ClassExt_1.ClassExt(handle), this.handle.add(HeapReferenceSize * 3));
    }
    get iftable() {
        return new HeapReference_1.HeapReference((handle) => new IfTable_1.IfTable(handle), this.handle.add(HeapReferenceSize * 4));
    }
    get name() {
        return new HeapReference_1.HeapReference((handle) => new StdString_1.StdString(handle), this.handle.add(HeapReferenceSize * 5));
    }
    get super_class() {
        return new HeapReference_1.HeapReference((handle) => new ArtClass(handle), this.handle.add(HeapReferenceSize * 6));
    }
    get vtable() {
        return new HeapReference_1.HeapReference((handle) => new NativePointer(handle), this.handle.add(HeapReferenceSize * 7));
    }
    get ifields() {
        return this.handle.add(HeapReferenceSize * 8).readU64().toNumber();
    }
    get methods() {
        return this.handle.add(HeapReferenceSize * 8 + 64).readU64().toNumber();
    }
    get sfields() {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 2).readU64().toNumber();
    }
    get access_flags() {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 3).readU32();
    }
    get access_flags_string() {
        return PrettyAccessFlags(this.access_flags);
    }
    get class_flags() {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 3 + 32).readU32();
    }
    get class_size() {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 3 + 32 * 2).readU32();
    }
    get clinit_thread_id() {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 3 + 32 * 3).readS32();
    }
    get dex_class_def_idx() {
        return this.handle.add(HeapReferenceSize * 8 + 64 * 3 + 32 * 4).readS32();
    }
}
exports.ArtClass = ArtClass;
globalThis.ArtClass = ArtClass;
},{"../../../../../tools/StdString":31,"../../../../Interface/art/mirror/HeapReference":5,"../../../../Object":10,"./ClassExt":20,"./ClassLoader":21,"./DexCache":22,"./IfTable":23}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtMethod = void 0;
const OatQuickMethodHeader_1 = require("../OatQuickMethodHeader");
const StdString_1 = require("../../../../../tools/StdString");
const enum_1 = require("../../../../../tools/enum");
const JSHandle_1 = require("../../../../JSHandle");
const ArtClass_1 = require("./ArtClass");
const DexFile_1 = require("../DexFile");
const GcRoot_1 = require("../GcRoot");
const ObjPtr_1 = require("../ObjPtr");
class ArtMethod extends JSHandle_1.JSHandle {
    declaring_class_;
    access_flags_;
    dex_code_item_offset_;
    dex_method_index_;
    method_index_;
    hotness_count_;
    imt_index_;
    ptr_sized_fields_;
    constructor(handle) {
        super(handle);
        this.declaring_class_ = this.handle;
        this.access_flags_ = this.handle.add(getArtMethodSpec().offset.accessFlags);
        this.dex_code_item_offset_ = this.handle.add(0x4 + 0x4);
        this.dex_method_index_ = this.handle.add(0x4 + 0x4 + 0x4);
        this.method_index_ = this.handle.add(0x4 + 0x4 + 0x4 + 0x4);
        this.hotness_count_ = this.handle.add(0x4 + 0x4 + 0x4 + 0x4 + 0x2);
        this.imt_index_ = this.hotness_count_;
        this.ptr_sized_fields_ = {
            data_: this.handle.add(getArtMethodSpec().offset.jniCode),
            entry_point_from_quick_compiled_code_: this.handle.add(getArtMethodSpec().offset.quickCode)
        };
    }
    get SizeOfClass() {
        return getArtMethodSpec().size + super.SizeOfClass;
    }
    get declaring_class() {
        return new GcRoot_1.GcRoot((handle) => new ArtClass_1.ArtClass(handle), this.declaring_class_.readPointer());
    }
    get access_flags() {
        return ptr(this.access_flags_.readU32());
    }
    get access_flags_string() {
        return ArtModifiers.PrettyAccessFlags(this.access_flags);
    }
    get dex_code_item_offset() {
        return this.dex_code_item_offset_.readU32();
    }
    get dex_method_index() {
        return this.dex_method_index_.readU32();
    }
    get method_index() {
        return this.method_index_.readU16();
    }
    get hotness_count() {
        return this.hotness_count_.readU16();
    }
    get imt_index() {
        return this.imt_index_.readU16();
    }
    get data() {
        return this.ptr_sized_fields_.data_.readPointer();
    }
    get entry_point_from_quick_compiled_code() {
        return this.ptr_sized_fields_.entry_point_from_quick_compiled_code_.readPointer();
    }
    prettyMethod(withSignature = true) {
        const result = new StdString_1.StdString();
        Java.api['art::ArtMethod::PrettyMethod'](result, this.handle, withSignature ? 1 : 0);
        return result.toString();
    }
    toString() {
        const PrettyJavaAccessFlagsStr = PrettyAccessFlags(ptr(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()));
        return `${this.handle} -> ${PrettyJavaAccessFlagsStr}${this.prettyMethod()}`;
    }
    getInfo() {
        const quickCode = this.entry_point_from_quick_compiled_code;
        const jniCode = this.data;
        const debugInfo_jniCode = DebugSymbol.fromAddress(jniCode);
        let jniCodeStr = jniCode.isNull() ? "null" : `${jniCode} -> ${debugInfo_jniCode.name} @ ${debugInfo_jniCode.moduleName}`;
        const debugInfo_quickCode = DebugSymbol.fromAddress(quickCode);
        return `quickCode: ${quickCode} -> ${debugInfo_quickCode.name} @ ${debugInfo_quickCode.moduleName} | jniCode: ${jniCodeStr} | accessFlags: ${this.access_flags} | size: ${ptr(this.SizeOfClass)}\n`;
    }
    GetObsoleteDexCache() {
        const GetObsoleteDexCacheAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod19GetObsoleteDexCacheEv");
        const GetObsoleteDexCacheFunc = new NativeFunction(GetObsoleteDexCacheAddr, 'pointer', ['pointer']);
        const ret = GetObsoleteDexCacheFunc(this.handle);
        if (ret.isNull())
            return null;
        return new ObjPtr_1.ObjPtr(ret).handle;
    }
    GetDexFile() {
        let access_flags = this.handle.add(0x4).readU32();
        if ((access_flags & ArtModifiers.kAccObsoleteMethod) != 0) {
            return new DexFile_1.DexFile(this.GetObsoleteDexCache());
        }
        else {
            let declaring_class_ptr = ptr(this.handle.readU32());
            LOGD(`declaring_class_ptr: ${declaring_class_ptr}`);
            let dex_cache_ptr = ptr(declaring_class_ptr.add(0x10).readU32());
            LOGD(`dex_cache_ptr: ${dex_cache_ptr}`);
            let dex_file_ptr = dex_cache_ptr.add(0x10).readPointer();
            LOGD(`dex_file_ptr: ${dex_file_ptr}`);
            const obj = new ObjPtr_1.ObjPtr(dex_file_ptr);
            LOGD(`GetDexFile: ${obj.toString()}`);
            LOGD(this.declaring_class.root.dex_cache.root);
            LOGD(this.declaring_class.root.dex_cache.root.dex_file);
            LOGD(this.declaring_class.root.dex_cache.root.dex_file.handle);
            return this.declaring_class.root.dex_cache.root.dex_file;
        }
    }
    HasSameNameAndSignature(other) {
        const HasSameNameAndSignature = Module.findExportByName("libart.so", "_ZN3art9ArtMethod23HasSameNameAndSignatureEPS0_");
        const HasSameNameAndSignatureFunc = new NativeFunction(HasSameNameAndSignature, 'bool', ['pointer', 'pointer']);
        const ret = HasSameNameAndSignatureFunc(this.handle, other.handle);
        return ret;
    }
    GetRuntimeMethodName() {
        const GetRuntimeMethodName = Module.findExportByName("libart.so", "_ZN3art9ArtMethod20GetRuntimeMethodNameEv");
        const GetRuntimeMethodNameFunc = new NativeFunction(GetRuntimeMethodName, 'pointer', ['pointer']);
        const ret = GetRuntimeMethodNameFunc(this.handle);
        return ret.readCString();
    }
    SetNotIntrinsic() {
        const SetNotIntrinsic = Module.findExportByName("libart.so", "_ZN3art9ArtMethod15SetNotIntrinsicEv");
        const SetNotIntrinsicFunc = new NativeFunction(SetNotIntrinsic, 'void', ['pointer']);
        SetNotIntrinsicFunc(this.handle);
    }
    CopyFrom(src) {
        const CopyFrom = Module.findExportByName("libart.so", "_ZN3art9ArtMethod8CopyFromEPS0_NS_11PointerSizeE");
        const CopyFromFunc = new NativeFunction(CopyFrom, 'void', ['pointer', 'pointer', 'int']);
        CopyFromFunc(this.handle, src.handle, Process.pointerSize);
    }
    GetOatQuickMethodHeader(pc = 0) {
        const func_addr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod23GetOatQuickMethodHeaderEm");
        const func = new NativeFunction(func_addr, 'pointer', ['pointer', 'uint64']);
        const ret = func(this.handle, pc);
        if (ret.isNull())
            return null;
        return new OatQuickMethodHeader_1.OatQuickMethodHeader(ret);
    }
    FindObsoleteDexClassDefIndex() {
        const FindObsoleteDexClassDefIndex = Module.findExportByName("libart.so", "_ZN3art9ArtMethod28FindObsoleteDexClassDefIndexEv");
        const FindObsoleteDexClassDefIndexFunc = new NativeFunction(FindObsoleteDexClassDefIndex, 'uint64', ['pointer']);
        return FindObsoleteDexClassDefIndexFunc(this.handle);
    }
    GetSingleImplementation() {
        const GetSingleImplementation = Module.findExportByName("libart.so", "_ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE");
        const GetSingleImplementationFunc = new NativeFunction(GetSingleImplementation, 'pointer', ['pointer', 'int']);
        return GetSingleImplementationFunc(this.handle, Process.pointerSize);
    }
    FindOverriddenMethod() {
        const FindOverriddenMethod = Module.findExportByName("libart.so", "_ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE");
        const FindOverriddenMethodFunc = new NativeFunction(FindOverriddenMethod, 'pointer', ['pointer', 'int']);
        return FindOverriddenMethodFunc(this.handle, Process.pointerSize);
    }
    IsOverridableByDefaultMethod() {
        const IsOverridableByDefaultMethod = Module.findExportByName("libart.so", "_ZN3art9ArtMethod28IsOverridableByDefaultMethodEv");
        const IsOverridableByDefaultMethodFunc = new NativeFunction(IsOverridableByDefaultMethod, 'bool', ['pointer']);
        return IsOverridableByDefaultMethodFunc(this.handle);
    }
    GetQuickenedInfo(dex_pc = 0) {
        const GetQuickenedInfo = Module.findExportByName("libart.so", "_ZN3art9ArtMethod16GetQuickenedInfoEv");
        if (GetQuickenedInfo == null)
            return null;
        const GetQuickenedInfoFunc = new NativeFunction(GetQuickenedInfo, 'pointer', ['pointer', 'uint64']);
        return GetQuickenedInfoFunc(this.handle, dex_pc);
    }
    RegisterNative(native_method) {
        const RegisterNativeAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod14RegisterNativeEPKv");
        const RegisterNativeFunc = new NativeFunction(RegisterNativeAddr, 'pointer', ['pointer', 'pointer']);
        LOGD(`RegisterNative: ${this.handle} -> ${native_method}`);
        return RegisterNativeFunc(this.handle, native_method);
    }
    RegisterNativeJS(native_method) {
        return this.RegisterNative(new NativeCallback(native_method, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']));
    }
    UnregisterNative() {
        const UnregisterNativeAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod16UnregisterNativeEv");
        const UnregisterNativeFunc = new NativeFunction(UnregisterNativeAddr, 'void', ['pointer']);
        return UnregisterNativeFunc(this.handle);
    }
    static NumArgRegisters(shorty) {
        const NumArgRegistersAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod15NumArgRegistersEPKc");
        const NumArgRegistersFunc = new NativeFunction(NumArgRegistersAddr, 'size_t', ['pointer', 'pointer']);
        return NumArgRegistersFunc(Memory.allocUtf8String(shorty));
    }
    GetInvokeType() {
        const GetInvokeTypeAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod13GetInvokeTypeEv");
        const GetInvokeTypeFunc = new NativeFunction(GetInvokeTypeAddr, 'int', ['pointer']);
        return enum_1.InvokeType.toString(GetInvokeTypeFunc(this.handle));
    }
}
exports.ArtMethod = ArtMethod;
globalThis.ArtMethod = ArtMethod;
},{"../../../../../tools/StdString":31,"../../../../../tools/enum":33,"../../../../JSHandle":9,"../DexFile":12,"../GcRoot":13,"../OatQuickMethodHeader":15,"../ObjPtr":16,"./ArtClass":18}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassExt = void 0;
const Object_1 = require("../../../../Object");
class ClassExt extends Object_1.ArtObject {
    constructor(handle) {
        super(handle);
    }
    toString() {
        return `ClassExt<${this.handle}>`;
    }
}
exports.ClassExt = ClassExt;
},{"../../../../Object":10}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtClassLoader = void 0;
const Object_1 = require("../../../../Object");
class ArtClassLoader extends Object_1.ArtObject {
    constructor(handle) {
        super(handle);
    }
    toString() {
        return `ClassLoader<${this.handle}>`;
    }
}
exports.ArtClassLoader = ArtClassLoader;
globalThis.ArtClassLoader = ArtClassLoader;
},{"../../../../Object":10}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexCache = void 0;
const HeapReference_1 = require("../../../../Interface/art/mirror/HeapReference");
const StdString_1 = require("../../../../../tools/StdString");
const Object_1 = require("../../../../Object");
const DexFile_1 = require("../DexFile");
class DexCache extends Object_1.ArtObject {
    constructor(handle) {
        super(handle);
    }
    toString() {
        let disp = `DexCache<${this.handle}>`;
        return disp;
    }
    get location() {
        return new HeapReference_1.HeapReference((handle) => new StdString_1.StdString(handle), this.handle.add(PointerSize * 0).readPointer());
    }
    get num_preresolved_strings() {
        return this.handle.add(PointerSize * 0 + 0x4).readU32();
    }
    get dex_file() {
        return new DexFile_1.DexFile(this.handle.add(PointerSize * 1 + 0x4).readPointer());
    }
    get preresolved_strings() {
        return this.handle.add(PointerSize * 2 + 0x4).readPointer();
    }
    get resolved_call_sites() {
        return this.handle.add(PointerSize * 3 + 0x4).readPointer();
    }
    get resolved_fields() {
        return this.handle.add(PointerSize * 4 + 0x4).readPointer();
    }
    get resolved_methods() {
        return this.handle.add(PointerSize * 5 + 0x4).readPointer();
    }
    get resolved_types() {
        return this.handle.add(PointerSize * 6 + 0x4).readPointer();
    }
    get strings() {
        return this.handle.add(PointerSize * 7 + 0x4).readPointer();
    }
    get num_resolved_call_sites() {
        return this.handle.add(PointerSize * 8 + 0x4).readPointer().toInt32();
    }
    get num_resolved_fields() {
        return this.handle.add(PointerSize * 8 + 0x4 * 2).readPointer().toInt32();
    }
    get num_resolved_method_types() {
        return this.handle.add(PointerSize * 8 + 0x4 * 3).readPointer().toInt32();
    }
    get num_resolved_methods() {
        return this.handle.add(PointerSize * 8 + 0x4 * 4).readPointer().toInt32();
    }
    get num_resolved_types() {
        return this.handle.add(PointerSize * 8 + 0x4 * 5).readPointer().toInt32();
    }
    get num_strings() {
        return this.handle.add(PointerSize * 8 + 0x4 * 6).readPointer().toInt32();
    }
}
exports.DexCache = DexCache;
globalThis.DexCache = DexCache;
},{"../../../../../tools/StdString":31,"../../../../Interface/art/mirror/HeapReference":5,"../../../../Object":10,"../DexFile":12}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfTable = void 0;
const Object_1 = require("../../../../Object");
class IfTable extends Object_1.ArtObject {
    constructor(handle) {
        super(handle);
    }
    toString() {
        return `IfTable<${this.handle}>`;
    }
}
exports.IfTable = IfTable;
},{"../../../../Object":10}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ArtClass");
require("./ArtMethod");
require("./ClassExt");
require("./ClassLoader");
require("./IfTable");
},{"./ArtClass":18,"./ArtMethod":19,"./ClassExt":20,"./ClassLoader":21,"./IfTable":23}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./art/include");
},{"./art/include":17}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./10/include");
},{"./10/include":25}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./Object");
require("./JSHandle");
require("./android");
require("./machine-code");
require("./implements/include");
require("./Interface/include");
},{"./Interface/include":8,"./JSHandle":9,"./Object":10,"./android":11,"./implements/include":26,"./machine-code":28}],28:[function(require,module,exports){
function parseInstructionsAt(address, tryParse, { limit }) {
    let cursor = address;
    let prevInsn = null;
    for (let i = 0; i !== limit; i++) {
        const insn = Instruction.parse(cursor);
        const value = tryParse(insn, prevInsn);
        if (value !== null) {
            return value;
        }
        cursor = insn.next;
        prevInsn = insn;
    }
    return null;
}
module.exports = {
    parseInstructionsAt
};
},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./android/include");
require("./Java/include");
require("./tools/include");
},{"./Java/include":2,"./android/include":27,"./tools/include":34}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArtMethod_1 = require("./android/implements/10/art/mirror/ArtMethod");
require("./include");
var onceFlag = true;
globalThis.testArtMethod = () => {
    Java.perform(() => {
        let artMethod_0 = Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage.handle;
        let artMethod_1 = Java.use("com.unity3d.player.UnityPlayer").IsWindowTranslucent.handle;
        var JavaString = Java.use("java.lang.String");
        Java.use("com.unity3d.player.UnityPlayer").UnitySendMessage(JavaString.$new("1"), JavaString.$new("2"), JavaString.$new("3"));
        let art_0 = new ArtMethod_1.ArtMethod(artMethod_0);
        let art_1 = new ArtMethod_1.ArtMethod(artMethod_1);
        LOGD(art_0.toString());
        LOGD(art_0.getInfo());
        function checkDexFile() {
            if (!onceFlag)
                return;
            onceFlag = false;
            const artBase = Module.findBaseAddress("libart.so");
            const GetObsoleteDexCacheAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod19GetObsoleteDexCacheEv");
            Interceptor.attach(GetObsoleteDexCacheAddr, {
                onEnter(args) {
                    LOGW(`onEnter GetObsoleteDexCacheAddr -> ${args[0]} -> ${args[0].readPointer()}`);
                }, onLeave(retval) {
                    LOGW(`onLeave GetObsoleteDexCacheAddr -> ${retval} -> ${retval.readPointer()}`);
                }
            });
            const branchAddr = artBase.add(0x16C194);
            Interceptor.attach(branchAddr, {
                onEnter(args) {
                    const ctx = this.context;
                    const x0 = ctx.x0;
                    LOGW(`onEnter branchAddr -> PID:${Process.getCurrentThreadId()}-> ${x0} -> ${ptr(x0.readU32())}`);
                }
            });
        }
        checkDexFile();
        LOGD(`GetInvokeType -> ${art_0.GetInvokeType()}`);
        LOGD(`GetRuntimeMethodName -> ${art_0.GetRuntimeMethodName()}`);
        LOGD(`dex_code_item_offset_ -> ${art_0.dex_code_item_offset} -> ${ptr(art_0.dex_code_item_offset)}`);
        LOGD(`dex_method_index -> ${ptr(art_0.dex_method_index)}`);
        LOGD(`GetRuntimeMethodName -> ${art_1.GetRuntimeMethodName()}`);
        LOGD(`HasSameNameAndSignature -> ${art_0.HasSameNameAndSignature(art_1)}`);
        LOGD(`access_flags_string -> ${art_0.access_flags_string}`);
        LOGD(`GetQuickenedInfo -> ${art_0.GetQuickenedInfo()}`);
        LOGD(`entry_point_from_quick_compiled_code -> ${art_0.entry_point_from_quick_compiled_code}`);
        newLine();
        LOGD(`GetDexFile -> ${art_0.GetDexFile()}`);
        LOGD(`GetDexFile -> ${art_0.GetDexFile().begin.add(art_0.dex_code_item_offset)}`);
    });
};
},{"./android/implements/10/art/mirror/ArtMethod":19,"./include":29}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StdString = void 0;
class StdString {
    static STD_STRING_SIZE = 3 * Process.pointerSize;
    handle;
    constructor(mPtr = Memory.alloc(StdString.STD_STRING_SIZE)) {
        this.handle = mPtr;
    }
    dispose() {
        const [data, isTiny] = this._getData();
        if (!isTiny)
            Java.api.$delete(data);
    }
    disposeToString() {
        const result = this.toString();
        this.dispose();
        return result;
    }
    toString() {
        const data = this._getData()[0];
        return data.readUtf8String();
    }
    _getData() {
        const str = this.handle;
        const isTiny = (str.readU8() & 1) === 0;
        const data = isTiny ? str.add(1) : str.add(2 * Process.pointerSize).readPointer();
        return [data, isTiny];
    }
}
exports.StdString = StdString;
globalThis.StdString = StdString;
},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
globalThis.clear = () => console.log('\x1Bc');
globalThis.cls = () => clear();
globalThis.seeHexA = (addr, length = 0x40, header = true, color) => {
    let localAddr = NULL;
    if (typeof addr == "number") {
        localAddr = ptr(addr);
    }
    else {
        localAddr = addr;
    }
    LOG(hexdump(localAddr, {
        length: length,
        header: header,
    }), color == undefined ? LogColor.WHITE : color);
};
},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvokeType = void 0;
class InvokeType {
    static kStatic = 0;
    static kDirect = 1;
    static kVirtual = 2;
    static kSuper = 3;
    static kInterface = 4;
    static kPolymorphic = 5;
    static kCustom = 6;
    static kMaxInvokeType = 6;
    static toString(type) {
        switch (type) {
            case InvokeType.kStatic:
                return "kStatic";
            case InvokeType.kDirect:
                return "kDirect";
            case InvokeType.kVirtual:
                return "kVirtual";
            case InvokeType.kSuper:
                return "kSuper";
            case InvokeType.kInterface:
                return "kInterface";
            case InvokeType.kPolymorphic:
                return "kPolymorphic";
            case InvokeType.kCustom:
                return "kCustom";
            case InvokeType.kMaxInvokeType:
                return "kMaxInvokeType";
            default:
                return "unknown";
        }
    }
}
exports.InvokeType = InvokeType;
},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./StdString");
require("./common");
require("./enum");
require("./logger");
require("./modifiers");
},{"./StdString":31,"./common":32,"./enum":33,"./logger":35,"./modifiers":36}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogColor = void 0;
var LogColor;
(function (LogColor) {
    LogColor[LogColor["WHITE"] = 0] = "WHITE";
    LogColor[LogColor["RED"] = 1] = "RED";
    LogColor[LogColor["YELLOW"] = 3] = "YELLOW";
    LogColor[LogColor["C31"] = 31] = "C31";
    LogColor[LogColor["C32"] = 32] = "C32";
    LogColor[LogColor["C33"] = 33] = "C33";
    LogColor[LogColor["C34"] = 34] = "C34";
    LogColor[LogColor["C35"] = 35] = "C35";
    LogColor[LogColor["C36"] = 36] = "C36";
    LogColor[LogColor["C41"] = 41] = "C41";
    LogColor[LogColor["C42"] = 42] = "C42";
    LogColor[LogColor["C43"] = 43] = "C43";
    LogColor[LogColor["C44"] = 44] = "C44";
    LogColor[LogColor["C45"] = 45] = "C45";
    LogColor[LogColor["C46"] = 46] = "C46";
    LogColor[LogColor["C90"] = 90] = "C90";
    LogColor[LogColor["C91"] = 91] = "C91";
    LogColor[LogColor["C92"] = 92] = "C92";
    LogColor[LogColor["C93"] = 93] = "C93";
    LogColor[LogColor["C94"] = 94] = "C94";
    LogColor[LogColor["C95"] = 95] = "C95";
    LogColor[LogColor["C96"] = 96] = "C96";
    LogColor[LogColor["C97"] = 97] = "C97";
    LogColor[LogColor["C100"] = 100] = "C100";
    LogColor[LogColor["C101"] = 101] = "C101";
    LogColor[LogColor["C102"] = 102] = "C102";
    LogColor[LogColor["C103"] = 103] = "C103";
    LogColor[LogColor["C104"] = 104] = "C104";
    LogColor[LogColor["C105"] = 105] = "C105";
    LogColor[LogColor["C106"] = 106] = "C106";
    LogColor[LogColor["C107"] = 107] = "C107";
})(LogColor = exports.LogColor || (exports.LogColor = {}));
class Logger {
    static linesMap = new Map();
    static colorEndDes = "\x1b[0m";
    static colorStartDes = (color) => `\x1b[${color}m`;
    static logL = console.log;
    static LOGW = (msg) => LOG(msg, LogColor.YELLOW);
    static LOGE = (msg) => LOG(msg, LogColor.RED);
    static LOGG = (msg) => LOG(msg, LogColor.C32);
    static LOGD = (msg) => LOG(msg, LogColor.C36);
    static LOGN = (msg) => LOG(msg, LogColor.C35);
    static LOGO = (msg) => LOG(msg, LogColor.C33);
    static LOGP = (msg) => LOG(msg, LogColor.C34);
    static LOGM = (msg) => LOG(msg, LogColor.C92);
    static LOGH = (msg) => LOG(msg, LogColor.C96);
    static LOGZ = (msg) => LOG(msg, LogColor.C90);
    static LOGJSON = (obj, type = LogColor.C36, space = 1) => LOG(JSON.stringify(obj, null, space), type);
    static LOG = (str, type = LogColor.WHITE) => {
        switch (type) {
            case LogColor.WHITE:
                Logger.logL(str);
                break;
            case LogColor.RED:
                console.error(str);
                break;
            case LogColor.YELLOW:
                console.warn(str);
                break;
            default:
                Logger.logL("\x1b[" + type + "m" + str + "\x1b[0m");
                break;
        }
    };
    static printLogColors = () => {
        let str = "123456789";
        Logger.logL(`\n${getLine(16)}  listLogColors  ${getLine(16)}`);
        for (let i = 30; i <= 37; i++) {
            Logger.logL(`\t\t${Logger.colorStartDes(i)} C${i}\t${str} ${Logger.colorEndDes}`);
        }
        Logger.logL(getLine(50));
        for (let i = 40; i <= 47; i++) {
            Logger.logL(`\t\t${Logger.colorStartDes(i)} C${i}\t${str} ${Logger.colorEndDes}`);
        }
        Logger.logL(getLine(50));
        for (let i = 90; i <= 97; i++) {
            Logger.logL(`\t\t${Logger.colorStartDes(i)} C${i}\t${str} ${Logger.colorEndDes}`);
        }
        Logger.logL(getLine(50));
        for (let i = 100; i <= 107; i++) {
            Logger.logL(`\t\t${Logger.colorStartDes(i)} C${i}\t${str} ${Logger.colorEndDes}`);
        }
        Logger.logL(getLine(50));
    };
    static getLine = (length, fillStr = "-") => {
        if (length == 0)
            return "";
        let key = length + "|" + fillStr;
        if (Logger.linesMap.get(key) != null)
            return Logger.linesMap.get(key);
        for (var index = 0, tmpRet = ""; index < length; index++)
            tmpRet += fillStr;
        Logger.linesMap.set(key, tmpRet);
        return tmpRet;
    };
    static getTextFormart = (text, color = LogColor.WHITE, fillStr = " ", length = -1, center = false) => {
        if (text == undefined)
            text = "";
        if (length == -1)
            length = text.length;
        let ret = Logger.colorStartDes(color);
        let fillLength = length - text.length;
        if (fillLength > 0) {
            let left = Math.floor(fillLength / 2);
            let right = fillLength - left;
            if (center) {
                left = right;
            }
            ret += getLine(left, fillStr) + text + getLine(right, fillStr);
        }
        else {
            ret += text;
        }
        ret += Logger.colorEndDes;
        return ret;
    };
}
exports.Logger = Logger;
var android_LogPriority;
(function (android_LogPriority) {
    android_LogPriority[android_LogPriority["ANDROID_LOG_UNKNOWN"] = 0] = "ANDROID_LOG_UNKNOWN";
    android_LogPriority[android_LogPriority["ANDROID_LOG_DEFAULT"] = 1] = "ANDROID_LOG_DEFAULT";
    android_LogPriority[android_LogPriority["ANDROID_LOG_VERBOSE"] = 2] = "ANDROID_LOG_VERBOSE";
    android_LogPriority[android_LogPriority["ANDROID_LOG_DEBUG"] = 3] = "ANDROID_LOG_DEBUG";
    android_LogPriority[android_LogPriority["ANDROID_LOG_INFO"] = 4] = "ANDROID_LOG_INFO";
    android_LogPriority[android_LogPriority["ANDROID_LOG_WARN"] = 5] = "ANDROID_LOG_WARN";
    android_LogPriority[android_LogPriority["ANDROID_LOG_ERROR"] = 6] = "ANDROID_LOG_ERROR";
    android_LogPriority[android_LogPriority["ANDROID_LOG_FATAL"] = 7] = "ANDROID_LOG_FATAL";
    android_LogPriority[android_LogPriority["ANDROID_LOG_SILENT"] = 8] = "ANDROID_LOG_SILENT";
})(android_LogPriority || (android_LogPriority = {}));
const LOG_TAG = "ZZZ";
const useCModule = false;
globalThis.logcat = (fmt, msg, tag = LOG_TAG, priority = android_LogPriority.ANDROID_LOG_INFO) => {
    if (!useCModule) {
        let logcat = new NativeFunction(Module.findExportByName("liblog.so", "__android_log_print"), 'void', ['int', 'pointer', 'pointer', 'pointer']);
        logcat(4, Memory.allocUtf8String(tag), Memory.allocUtf8String(fmt), Memory.allocUtf8String(msg));
    }
    else {
        var cmd = new CModule(`
        #include <stdio.h>
    
        extern int __android_log_print(int, const char*, const char*, ...);
        void logcat(const char* fmt, const char* msg){
            __android_log_print(${priority}, "${tag}", fmt, msg);
        }
        `, { __android_log_print: Module.findExportByName("liblog.so", "__android_log_print") });
        new NativeFunction(cmd["logcat"], 'void', ['pointer'])(Memory.allocUtf8String(msg));
    }
};
globalThis.LOG = Logger.LOG;
globalThis.LOGW = Logger.LOGW;
globalThis.LOGE = Logger.LOGE;
globalThis.LOGG = Logger.LOGG;
globalThis.LOGD = Logger.LOGD;
globalThis.LOGN = Logger.LOGN;
globalThis.LOGO = Logger.LOGO;
globalThis.LOGP = Logger.LOGP;
globalThis.LOGH = Logger.LOGH;
globalThis.LOGM = Logger.LOGM;
globalThis.LOGZ = Logger.LOGZ;
globalThis.LOGJSON = Logger.LOGJSON;
globalThis.getLine = Logger.getLine;
globalThis.printLogColors = Logger.printLogColors;
globalThis.newLine = (lines = 1) => Logger.LOG(getLine(lines, "\n"));
globalThis.LogColor = LogColor;
},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtModifiers = void 0;
class ArtModifiers {
    static kAccPublic = 0x0001;
    static kAccPrivate = 0x0002;
    static kAccProtected = 0x0004;
    static kAccStatic = 0x0008;
    static kAccFinal = 0x0010;
    static kAccSynchronized = 0x0020;
    static kAccSuper = 0x0020;
    static kAccVolatile = 0x0040;
    static kAccBridge = 0x0040;
    static kAccTransient = 0x0080;
    static kAccVarargs = 0x0080;
    static kAccNative = 0x0100;
    static kAccInterface = 0x0200;
    static kAccAbstract = 0x0400;
    static kAccStrict = 0x0800;
    static kAccSynthetic = 0x1000;
    static kAccAnnotation = 0x2000;
    static kAccEnum = 0x4000;
    static kAccJavaFlagsMask = 0xffff;
    static kAccConstructor = 0x00010000;
    static kAccDeclaredSynchronized = 0x00020000;
    static kAccClassIsProxy = 0x00040000;
    static kAccObsoleteMethod = 0x00040000;
    static kAccSkipAccessChecks = 0x00080000;
    static kAccVerificationAttempted = 0x00080000;
    static kAccSkipHiddenapiChecks = 0x00100000;
    static kAccCopied = 0x00100000;
    static PrettyAccessFlags = (access_flags) => {
        let access_flags_local = NULL;
        if (typeof access_flags === "number") {
            access_flags_local = ptr(access_flags);
        }
        else {
            access_flags_local = access_flags;
        }
        if (access_flags_local.isNull())
            throw new Error("access_flags is null");
        let result = "";
        if (!(access_flags_local.and(ArtModifiers.kAccPublic)).isNull()) {
            result += "public ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccProtected)).isNull()) {
            result += "protected ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccPrivate)).isNull()) {
            result += "private ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccFinal)).isNull()) {
            result += "final ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccStatic)).isNull()) {
            result += "static ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccAbstract)).isNull()) {
            result += "abstract ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccInterface)).isNull()) {
            result += "interface ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccTransient)).isNull()) {
            result += "transient ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccVolatile)).isNull()) {
            result += "volatile ";
        }
        if (!(access_flags_local.and(ArtModifiers.kAccSynchronized)).isNull()) {
            result += "synchronized ";
        }
        return result;
    };
}
exports.ArtModifiers = ArtModifiers;
globalThis.ArtModifiers = ArtModifiers;
globalThis.PrettyAccessFlags = (access_flags) => ArtModifiers.PrettyAccessFlags(access_flags);
},{}]},{},[30])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9KYXZhL0phdmFVdGlsLnRzIiwiYWdlbnQvSmF2YS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9JbnRlcmZhY2UvYXJ0L2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvbWlycm9yL0hlYXBSZWZlcmVuY2UudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9hcnQvbWlycm9yL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL0ludGVyZmFjZS9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9KU0hhbmRsZS50cyIsImFnZW50L2FuZHJvaWQvT2JqZWN0LnRzIiwiYWdlbnQvYW5kcm9pZC9hbmRyb2lkLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9EZXhGaWxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9HY1Jvb3QudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L0luc3RydWN0aW9uLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9PYXRRdWlja01ldGhvZEhlYWRlci50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvT2JqUHRyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvQXJ0Q2xhc3MudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9BcnRNZXRob2QudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9DbGFzc0V4dC50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9hcnQvbWlycm9yL0NsYXNzTG9hZGVyLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvRGV4Q2FjaGUudHMiLCJhZ2VudC9hbmRyb2lkL2ltcGxlbWVudHMvMTAvYXJ0L21pcnJvci9JZlRhYmxlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzLzEwL2FydC9taXJyb3IvaW5jbHVkZS50cyIsImFnZW50L2FuZHJvaWQvaW1wbGVtZW50cy8xMC9pbmNsdWRlLnRzIiwiYWdlbnQvYW5kcm9pZC9pbXBsZW1lbnRzL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL2luY2x1ZGUudHMiLCJhZ2VudC9hbmRyb2lkL21hY2hpbmUtY29kZS5qcyIsImFnZW50L2luY2x1ZGUudHMiLCJhZ2VudC9tYWluLnRzIiwiYWdlbnQvdG9vbHMvU3RkU3RyaW5nLnRzIiwiYWdlbnQvdG9vbHMvY29tbW9uLnRzIiwiYWdlbnQvdG9vbHMvZW51bS50cyIsImFnZW50L3Rvb2xzL2luY2x1ZGUudHMiLCJhZ2VudC90b29scy9sb2dnZXIudHMiLCJhZ2VudC90b29scy9tb2RpZmllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNBQSw2RUFBeUU7QUFJekUsTUFBTSxpQkFBaUIsR0FBYSxFQUFFLENBQUE7QUFRdEMsU0FBZ0IsdUJBQXVCLENBQUMsWUFBb0IsZ0NBQWdDO0lBRXhGLE1BQU0sVUFBVSxHQUFrQixFQUFFLENBQUE7SUFDcEMsTUFBTSxTQUFTLEdBQWlCLEVBQUUsQ0FBQTtJQUNsQyxNQUFNLGNBQWMsR0FBYSxFQUFFLENBQUE7SUFFbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFDZCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2pDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDdkMsSUFBSTtnQkFFQSxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxD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QUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVEsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLEdBQVEsRUFBRSxPQUFpQixRQUFRLENBQUMsR0FBRyxFQUFFLFFBQWdCLENBQUMsRUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUVsSSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMs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QUE7U0FDdkI7UUFDRCxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDNUQsTUFBTSxJQUFJLFFBQVEsQ0FBQTtTQUNyQjtRQUNELElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUM3RCxNQUFNLElBQUksU0FBUyxDQUFBO1NBQ3RCO1FBQ0QsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQy9ELE1BQU0sSUFBSSxXQUFXLENBQUE7U0FDeEI7UUFDRCxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDaEUsTUFBTSxJQUFJLFlBQVksQ0FBQTtTQUN6QjtRQUNELElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNoRSxNQUFNLElBQUksWUFBWSxDQUFBO1NBQ3pCO1FBQ0QsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQy9ELE1BQU0sSUFBSSxXQUFXLENBQUE7U0FDeEI7UUFDRCxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNuRSxNQUFNLElBQUksZUFBZSxDQUFBO1NBQzVCO1FBQ0QsT0FBTyxNQUFNLENBQUE7SUFDakIsQ0FBQyxDQUFBOztBQW5GTCxvQ0FvRkM7QUFPRCxVQUFVLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTtBQUN0QyxVQUFVLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxZQUFvQyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiJ9
