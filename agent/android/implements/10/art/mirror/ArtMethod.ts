
import { CodeItemInstructionAccessor } from "../dexfile/CodeItemInstructionAccessor"
import { IArtMethod } from "../../../../Interface/art/mirror/IArtMethod"
import { StandardDexFile_CodeItem } from "../dexfile/StandardDexFile"
import { CompactDexFile_CodeItem } from "../dexfile/CompactDexFile"
import { OatQuickMethodHeader } from "../OatQuickMethodHeader"
import { callSym, getSym } from "../../../../Utils/SymHelper"
import { ArtModifiers } from "../../../../../tools/modifiers"
import { KeyValueStore } from "../../../../../tools/common"
import { StdString } from "../../../../../tools/StdString"
import { DexItemStruct } from "../dexfile/DexFileStructs"
import { InvokeType } from "../../../../../tools/enum"
import { ArtInstruction } from "../Instruction"
import { JSHandle } from "../../../../JSHandle"
import { DexFile } from "../dexfile/DexFile"
import { PointerSize } from "../Globals"
import { JValue } from "../Type/JValue"
import { ArtClass } from "./ArtClass"
import { ArtThread } from "../Thread"
import { DexCache } from "./DexCache"
import { GcRoot } from "../GcRoot"

export class ArtMethod extends JSHandle implements IArtMethod, SizeOfClass {

    // GcRoot<mirror::Class> declaring_class_; 
    private declaring_class_: NativePointer = this.CurrentHandle // 0x4
    // std::atomic<std::uint32_t> access_flags_;
    private access_flags_: NativePointer = this.declaring_class_.add(GcRoot.Size)   // 0x4
    // uint32_t dex_code_item_offset_;
    private dex_code_item_offset_: NativePointer = this.access_flags_.add(0x4) // 0x4
    // uint32_t dex_method_index_;
    private dex_method_index_: NativePointer = this.dex_code_item_offset_.add(0x4) // 0x4
    // uint16_t method_index_;
    private method_index_: NativePointer = this.dex_method_index_.add(0x4) // 0x2

    //   union {
    //     // Non-abstract methods: The hotness we measure for this method. Not atomic,
    //     // as we allow missing increments: if the method is hot, we will see it eventually.
    //     uint16_t hotness_count_;
    //     // Abstract methods: IMT index (bitwise negated) or zero if it was not cached.
    //     // The negation is needed to distinguish zero index and missing cached entry.
    //     uint16_t imt_index_;
    //   };
    private hotness_count_: NativePointer = this.CurrentHandle.add(GcRoot.Size + 0x4 * 3 + 0x2 * 1)
    private imt_index_: NativePointer = this.CurrentHandle.add(GcRoot.Size + 0x4 * 3 + 0x2 * 1)

    // Must be the last fields in the method.
    //   struct PtrSizedFields {
    //     // Depending on the method type, the data is
    //     //   - native method: pointer to the JNI function registered to this method
    //     //                    or a function to resolve the JNI function,
    //     //   - conflict method: ImtConflictTable,
    //     //   - abstract/interface method: the single-implementation if any,
    //     //   - proxy method: the original interface method or constructor,
    //     //   - other methods: the profiling data.
    //     void* data_;

    //     // Method dispatch from quick compiled code invokes this pointer which may cause bridging into
    //     // the interpreter.
    //     void* entry_point_from_quick_compiled_code_;
    //   } ptr_sized_fields_;

    public ptr_sized_fields_: {
        data_: NativePointer
        entry_point_from_quick_compiled_code_: NativePointer
    }

    constructor(handle: NativePointer | number | string) {
        if (typeof handle == "string") handle = pathToArtMethod(handle).handle
        super(handle)
        try {
            this.ptr_sized_fields_ = {
                data_: this.handle.add(getArtMethodSpec().offset.jniCode),
                entry_point_from_quick_compiled_code_: this.handle.add(getArtMethodSpec().offset.quickCode)
            }
        } catch (error) {
            this.ptr_sized_fields_ = {
                data_: this.imt_index_.add(0x4),
                entry_point_from_quick_compiled_code_: this.imt_index_.add(0x4).add(PointerSize)
            }
        }
    }

    get SizeOfClass(): number {
        return getArtMethodSpec().size + super.SizeOfClass
    }

    get currentHandle(): NativePointer {
        return this.handle.add(super.SizeOfClass)
    }

    // GcRoot<mirror::Class> declaring_class_;
    get declaring_class(): GcRoot<ArtClass> {
        return new GcRoot((handle) => new ArtClass(handle), this.declaring_class_)
    }

    // std::atomic<std::uint32_t> access_flags_;
    get access_flags(): NativePointer {
        return ptr(this.access_flags_.readU32())
    }

    get access_flags_string(): string {
        return ArtModifiers.PrettyAccessFlags(this.access_flags)
    }

    // uint32_t dex_code_item_offset_;
    get dex_code_item_offset(): number {
        return this.dex_code_item_offset_.readU32()
    }

    // uint16_t method_index_;
    get dex_method_index(): number {
        return this.dex_method_index_.readU16()
    }

    // uint16_t method_index_;
    get method_index(): number {
        return this.method_index_.readU16()
    }

    // union {
    //     // Non-abstract methods: The hotness we measure for this method. Not atomic,
    //     // as we allow missing increments: if the method is hot, we will see it eventually.
    //     uint16_t hotness_count_;
    //     // Abstract methods: IMT index (bitwise negated) or zero if it was not cached.
    //     // The negation is needed to distinguish zero index and missing cached entry.
    //     uint16_t imt_index_;
    //   };
    get hotness_count(): number {
        return this.hotness_count_.readU16()
    }

    get imt_index(): number {
        return this.imt_index_.readU16()
    }

    // Must be the last fields in the method.
    //   struct PtrSizedFields {
    //     // Depending on the method type, the data is
    //     //   - native method: pointer to the JNI function registered to this method
    //     //                    or a function to resolve the JNI function,
    //     //   - conflict method: ImtConflictTable,
    //     //   - abstract/interface method: the single-implementation if any,
    //     //   - proxy method: the original interface method or constructor,
    //     //   - other methods: the profiling data.
    //     void* data_;

    //     // Method dispatch from quick compiled code invokes this pointer which may cause bridging into
    //     // the interpreter.
    //     void* entry_point_from_quick_compiled_code_;
    //   } ptr_sized_fields_;

    get data(): NativePointer {
        return this.ptr_sized_fields_.data_.readPointer()
    }

    get jniCode(): NativePointer {
        return this.data
    }

    get entry_point_from_quick_compiled_code(): NativePointer {
        return this.ptr_sized_fields_.entry_point_from_quick_compiled_code_.readPointer()
    }

    // _ZN3art9ArtMethod12PrettyMethodEb => art::ArtMethod::PrettyMethod(bool)
    // _ZN3art9ArtMethod12PrettyMethodEPS0_b => art::ArtMethod::PrettyMethod(art::ArtMethod*, bool)
    // _ZNK3art7DexFile12PrettyMethodEjb => art::DexFile::PrettyMethod(unsigned int, bool) const
    PrettyMethod(withSignature = true): string {
        if (this.handle.isNull()) return 'NULL'
        const result = new StdString();
        (Java as any).api['art::ArtMethod::PrettyMethod'](result, this.handle, withSignature ? 1 : 0)
        return result.disposeToString()
    }

    toString(): string {
        let disp: string = `ArtMethod< ${this.handle} >`
        disp += `\n\t ${this.methodName}`
        if (this.handle.isNull()) return disp
        disp += `\n\t declaring_class: ${this.declaring_class} -> ArtClass< ${this.declaring_class.root.handle} >`
        disp += `\n\t access_flags: ${this.access_flags} -> ${this.access_flags_string}`
        disp += `\n\t dex_code_item_offset: ${this.dex_code_item_offset} | ${ptr(this.dex_code_item_offset)} -> ${this.GetCodeItem()}`
        disp += `\n\t dex_method_index: ${this.dex_method_index_} | ${ptr(this.dex_method_index)}`
        disp += `\n\t method_index: ${this.method_index_} | ${ptr(this.method_index)}`
        disp += `\n\t hotness_count: ${this.hotness_count_} | ${ptr(this.hotness_count)}`
        disp += `\n\t imt_index: ${this.imt_index_} | ${ptr(this.imt_index)}`
        disp += `\n\t data: ${this.ptr_sized_fields_.data_} -> ${DebugSymbol.fromAddress(this.data).toString()}`
        disp += `\n\t jniCode: ${this.ptr_sized_fields_.entry_point_from_quick_compiled_code_}  -> ${DebugSymbol.fromAddress(this.entry_point_from_quick_compiled_code).toString()}`
        return disp
    }

    //   ALWAYS_INLINE CodeItemInstructionAccessor DexInstructions()
    DexInstructions(): CodeItemInstructionAccessor {
        return CodeItemInstructionAccessor.fromArtMethod(this)
    }

    // // jetbrains://clion/navigate/reference?project=libart&path=~/bin/aosp/art/libdexfile/dex/modifiers.h
    // // std::string PrettyJavaAccessFlags(uint32_t access_flags)
    // // __int64 __usercall art::PrettyJavaAccessFlags@<X0>(__int64 this@<X0>, _QWORD *a2@<X8>)
    PrettyJavaAccessFlags(): string {
        return StdString.fromPointers(callSym<NativePointer[]>(
            "_ZN3art21PrettyJavaAccessFlagsEj", "libdexfile.so",
            ['pointer', 'pointer', 'pointer'], ['pointer', 'uint32'],
            this, this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()))
    }

    // ObjPtr<mirror::DexCache> ArtMethod::GetObsoleteDexCache()
    // _ZN3art9ArtMethod19GetObsoleteDexCacheEv
    // __int64 __fastcall art::ArtMethod::GetObsoleteDexCache(art::ArtMethod *this, art::mirror::Object *a2)
    GetObsoleteDexCache(): DexCache {
        return new DexCache(callSym<NativePointer>(
            "_ZN3art9ArtMethod19GetObsoleteDexCacheEv", "libart.so",
            'pointer', ['pointer'],
            this.handle))
    }

    // GetCodeItem(): NativePointer {
    //     const dexCodeItemOffset = this.dex_code_item_offset
    //     if (dexCodeItemOffset == 0) return ptr(0)
    //     const dexFile = this.GetDexFile()
    //     return dexFile.data_begin.add(dexCodeItemOffset)
    // }

    // Android 12
    GetCodeItem(): NativePointer {
        return callSym<NativePointer>("NterpGetCodeItem", "libart.so",
            'pointer', ['pointer'],
            this.handle)
    }

    GetCodeItemPack(): { headerStart: NativePointer, headerSize: number, insnsStart: NativePointer, insnsSize: number } {
        const codeItem = this.GetCodeItem()
        const accesor: CodeItemInstructionAccessor = this.DexInstructions()
        const code_item: DexItemStruct = accesor.CodeItem
        if (codeItem.isNull()) return { headerStart: ptr(0), headerSize: 0, insnsStart: ptr(0), insnsSize: 0 }
        const headerSize = code_item.header_size
        const insnsSize = code_item.insns_size
        const headerStart = codeItem
        const insnsStart = codeItem.add(headerSize)
        return { headerStart, headerSize, insnsStart, insnsSize }
    }

    SetCodeItem(codeItem: NativePointer): void {
        this.dex_code_item_offset_.writeU32(codeItem.sub(this.GetDexFile().data_begin).toInt32())
    }

    GetDexCache(): DexCache {
        let access_flags = this.handle.add(0x4).readU32()
        // IsObsolete() => (GetAccessFlags() & kAccObsoleteMethod) != 0
        if ((access_flags & ArtModifiers.kAccObsoleteMethod) != 0) {
            // LOGD(`flag => ${access_flags}`)
            return this.GetObsoleteDexCache()
        } else {
            return new DexCache(this.declaring_class.root.dex_cache.root.handle)
        }
    }

    // inline ObjPtr<mirror::DexCache> ArtMethod::GetDexCache()
    // bool IsObsolete() => return (GetAccessFlags() & kAccObsoleteMethod) != 0;
    private static checkDexFile_onceFlag: boolean = true
    GetDexFile(): DexFile {
        return this.GetDexCache().dex_file

        function checkDexFile() {

            if (!ArtMethod.checkDexFile_onceFlag) return
            ArtMethod.checkDexFile_onceFlag = false

            const artBase: NativePointer = Module.findBaseAddress("libart.so")!

            const GetObsoleteDexCacheAddr = Module.findExportByName("libart.so", "_ZN3art9ArtMethod19GetObsoleteDexCacheEv")!
            Interceptor.attach(GetObsoleteDexCacheAddr, {
                onEnter(args) {
                    LOGW(`onEnter GetObsoleteDexCacheAddr -> ${args[0]} -> ${args[0].readPointer()}`)
                }, onLeave(retval) {
                    LOGW(`onLeave GetObsoleteDexCacheAddr -> ${retval} -> ${retval.readPointer()}`)
                }
            })

            const branchAddr = artBase.add(0x16C194)
            Interceptor.attach(branchAddr, {
                onEnter(this: InvocationContext, args: InvocationArguments) {
                    const ctx = this.context as Arm64CpuContext
                    const x0 = ctx.x0
                    LOGW(`onEnter branchAddr -> PID:${Process.getCurrentThreadId()}-> ${x0} -> ${ptr(x0.readU32())}`)
                }
            })
        }
    }

    get methodName(): string {
        try {
            const PrettyJavaAccessFlagsStr: string = PrettyAccessFlags(ptr(this.handle.add(getArtMethodSpec().offset.accessFlags).readU32()))
            return `${PrettyJavaAccessFlagsStr}${this.PrettyMethod()}`
        } catch (error) {
            return 'ERROR'
        }
    }

    // bool ArtMethod::HasSameNameAndSignature(ArtMethod* other) 
    // _ZN3art9ArtMethod23HasSameNameAndSignatureEPS0_
    HasSameNameAndSignature(other: ArtMethod): boolean {
        return callSym<boolean>(
            "_ZN3art9ArtMethod23HasSameNameAndSignatureEPS0_", "libart.so",
            'bool', ['pointer', 'pointer'],
            this.handle, other.handle)
    }

    // Used by GetName and GetNameView to share common code.
    // const char* GetRuntimeMethodName()
    // _ZN3art9ArtMethod20GetRuntimeMethodNameEv
    GetRuntimeMethodName(): string {
        return callSym<NativePointer>(
            "_ZN3art9ArtMethod20GetRuntimeMethodNameEv", "libart.so",
            'pointer', ['pointer'],
            this.handle).readCString()
    }

    // void ArtMethod::SetNotIntrinsic()
    // _ZN3art9ArtMethod15SetNotIntrinsicEv
    SetNotIntrinsic() {
        return callSym<void>(
            "_ZN3art9ArtMethod15SetNotIntrinsicEv", "libart.so",
            'void', ['pointer'],
            this.handle)
    }

    // void ArtMethod::CopyFrom(ArtMethod* src, PointerSize image_pointer_size)
    // _ZN3art9ArtMethod8CopyFromEPS0_NS_11PointerSizeE
    CopyFrom(src: ArtMethod): void {
        return callSym<void>(
            "_ZN3art9ArtMethod8CopyFromEPS0_NS_11PointerSizeE", "libart.so",
            'void', ['pointer', 'pointer', 'int'],
            this.handle, src.handle, PointerSize)
    }

    // const OatQuickMethodHeader* GetOatQuickMethodHeader(uintptr_t pc)
    // _ZN3art9ArtMethod23GetOatQuickMethodHeaderEm
    GetOatQuickMethodHeader(pc: number = 0): OatQuickMethodHeader {
        return new OatQuickMethodHeader(callSym<NativePointer>(
            "_ZN3art9ArtMethod23GetOatQuickMethodHeaderEm", "libart.so",
            'pointer', ['pointer', 'pointer'],
            this.handle, pc))
    }

    // uint16_t FindObsoleteDexClassDefIndex()
    // _ZN3art9ArtMethod28FindObsoleteDexClassDefIndexEv
    FindObsoleteDexClassDefIndex(): number {
        return callSym<number>(
            "_ZN3art9ArtMethod28FindObsoleteDexClassDefIndexEv", "libart.so",
            'int', ['pointer'],
            this.handle)
    }

    // ArtMethod* GetSingleImplementation(PointerSize pointer_size);
    // _ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE
    // check impl if this methid is IsAbstract
    GetSingleImplementation(): ArtMethod {
        return new ArtMethod(callSym<NativePointer>(
            "_ZN3art9ArtMethod23GetSingleImplementationENS_11PointerSizeE", "libart.so",
            'pointer', ['pointer', 'int'],
            this.handle, Process.pointerSize))
        Java.perform(() => {
            var jstr = Java.use("java.lang.String")
            Java.use("com.bytedance.applog.util.i").a(jstr.$new("123"))
        })
    }

    // void ArtMethod::Invoke(Thread* self, uint32_t* args, uint32_t args_size, JValue* result, const char* shorty) 
    // art::ArtMethod::Invoke(art::Thread*, unsigned int*, unsigned int, art::JValue*, char const*)
    // _ZN3art9ArtMethod6InvokeEPNS_6ThreadEPjjPNS_6JValueEPKc
    Invoke(self: NativePointerValue, args: NativePointerValue[], result: JValue, shorty: string): void {
        return callSym<void>(
            "_ZN3art9ArtMethod6InvokeEPNS_6ThreadEPjjPNS_6JValueEPKc", "libart.so",
            'void', ['pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer'],
            this.handle, this.CurrentHandle, args, args.length, result.handle, Memory.allocUtf8String(shorty))
    }

    // ArtMethod* FindOverriddenMethod(PointerSize pointer_size)
    // _ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE
    FindOverriddenMethod() {
        return callSym<NativePointer>(
            "_ZN3art9ArtMethod20FindOverriddenMethodENS_11PointerSizeE", "libart.so",
            'pointer', ['pointer', 'int'],
            this.handle, Process.pointerSize)
    }

    // Returns true if this method could be overridden by a default method.
    // bool IsOverridableByDefaultMethod() 
    // _ZN3art9ArtMethod28IsOverridableByDefaultMethodEv
    IsOverridableByDefaultMethod(): boolean {
        return callSym<boolean>(
            "_ZN3art9ArtMethod28IsOverridableByDefaultMethodEv", "libart.so",
            'bool', ['pointer'],
            this.handle)
    }

    // uint16_t ArtMethod::GetIndexFromQuickening(uint32_t dex_pc) 
    // _ZN3art9ArtMethod16GetQuickenedInfoEv
    GetQuickenedInfo(dex_pc: number = 0): number {
        return callSym<number>("_ZN3art9ArtMethod16GetQuickenedInfoEv", "libart.so",
            'int',
            ['pointer', 'int'],
            this.handle, dex_pc)
    }

    // std::string JniShortName()
    // _ZN3art9ArtMethod12JniShortNameEv
    JniShortName(): string {
        return StdString.fromPointers(callSym<NativePointer[]>(
            "_ZN3art9ArtMethod12JniShortNameEv", "libart.so",
            ['pointer', 'pointer', 'pointer'], ['pointer'],
            this.handle))
    }

    // std::string JniLongName()
    // _ZN3art9ArtMethod11JniLongNameEv
    JniLongName() {
        return StdString.fromPointers(callSym<NativePointer[]>(
            "_ZN3art9ArtMethod11JniLongNameEv", "libart.so",
            ['pointer', 'pointer', 'pointer'], ['pointer'],
            this.handle))
    }

    // const void* RegisterNative(const void* native_method)
    // _ZN3art9ArtMethod14RegisterNativeEPKv
    RegisterNative(native_method: NativePointerValue): NativePointer {
        return callSym<NativePointer>("_ZN3art9ArtMethod14RegisterNativeEPKv", "libart.so",
            'pointer', ['pointer', 'pointer'],
            this.handle, native_method)
    }

    // pack RegisterNative using NativeCallback (default 4 args)
    RegisterNativeJS(native_method: (args: any[]) => {}) {
        return this.RegisterNative(new NativeCallback(native_method, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']))
    }

    //  void UnregisterNative()
    // _ZN3art9ArtMethod16UnregisterNativeEv
    UnregisterNative(): void {
        return callSym<void>("_ZN3art9ArtMethod16UnregisterNativeEv", "libart.so", 'void', ['pointer'], this.handle)
    }

    // Number of 32bit registers that would be required to hold all the arguments
    // static size_t NumArgRegisters(const char* shorty);
    // _ZN3art9ArtMethod15NumArgRegistersEPKc
    static NumArgRegisters(shorty: string): number {
        return callSym<number>(
            "_ZN3art9ArtMethod15NumArgRegistersEPKc", "libart.so",
            'int', ['pointer'],
            Memory.allocUtf8String(shorty))
    }

    // InvokeType ArtMethod::GetInvokeType()
    // _ZN3art9ArtMethod13GetInvokeTypeEv
    GetInvokeType(): string {
        return InvokeType.toString(callSym<number>(
            "_ZN3art9ArtMethod13GetInvokeTypeEv", "libart.so",
            'int', ['pointer'], this.handle))
    }

    test() {
        LOGD(`GetInvokeType -> ${this.GetInvokeType()}`)
        LOGD(`GetRuntimeMethodName -> ${this.GetRuntimeMethodName()}`)
        LOGD(`dex_code_item_offset_ -> ${this.dex_code_item_offset} -> ${ptr(this.dex_code_item_offset)}`)
        LOGD(`dex_method_index -> ${ptr(this.dex_method_index)}`)
        // LOGD(`HasSameNameAndSignature -> ${this.HasSameNameAndSignature(art_1)}`)
        LOGD(`access_flags_string -> ${this.access_flags_string}`)
        LOGD(`JniShortName -> ${this.JniShortName()}`)
        LOGD(`JniLongName -> ${this.JniLongName()}`)
        LOGD(`GetQuickenedInfo -> ${this.GetQuickenedInfo()}`)
        LOGD(`entry_point_from_quick_compiled_code -> ${this.entry_point_from_quick_compiled_code}`)

        newLine()
        LOGD(this.GetDexFile())
        LOGD(this.GetDexFile().oat_dex_file)
        LOGD(this.GetDexFile().oat_dex_file.oat_file)
    }

    showCode = (num?: number) => {
        const debugInfo: DebugSymbol = DebugSymbol.fromAddress(this.entry_point_from_quick_compiled_code)
        debugInfo.moduleName == "base.odex" ? this.showOatAsm(num) : this.showSmali(num)
    }

    showSmali(num: number = -1, info: boolean = false, /** Forced withdrawal */ forceRet: number = 100): void {
        const accessor: CodeItemInstructionAccessor = this.DexInstructions()
        const dex_file: DexFile = this.GetDexFile()
        const code_item: NativePointer = this.GetCodeItem()
        // if (!this.jniCode.isNull()) {
        //     LOGD(`👉 ${this}`)
        //     LOGE(`jniCode is not null -> ${this.jniCode}`)
        //     return
        // }
        if (info) {
            LOGD(`↓dex_file↓\n${dex_file}\n`)
            LOGD(`👉 ${this}\n`)
            LOGD(`↓accessor↓\n${accessor}\n`)
        }

        newLine()
        LOGD(`${this.methodName} @ ${this.handle}`)
        let disp_insns_info: string = `insns_size_in_code_units: ${accessor.insns_size_in_code_units} - ${ptr(accessor.insns_size_in_code_units)}`
        disp_insns_info += ` | method start: ${accessor.insns} | insns start ${code_item} | DEX: ${dex_file.handle}`
        LOGD(`\n[ ${disp_insns_info} ]\n`)

        const start_off: number = accessor.insns.sub(code_item).toUInt32()
        const bf: ArrayBuffer = code_item.readByteArray(start_off)
        const bf_str: string = Array.from(new Uint8Array(bf)).map((item: number) => item.toString(16).padStart(2, '0')).join(' ')
        if (this.GetDexFile().is_compact_dex) {
            const item: CompactDexFile_CodeItem = (accessor.CodeItem) as CompactDexFile_CodeItem
            LOGZ(`[ ${start_off} | ${bf_str} ] -> [ fields : ${item.fields} | registers_size: ${item.registers_size} | ins_size: ${item.ins_size} | outs_size: ${item.outs_size} | tries_size: ${item.tries_size} | insns_count_and_flags: ${item.insns_count_and_flags} | insns_size_in_code_units: ${item.insns_size_in_code_units} ]\n`)
        } else {
            const item: StandardDexFile_CodeItem = (CodeItemInstructionAccessor.CodeItem(dex_file, this.GetCodeItem()) as StandardDexFile_CodeItem)
            LOGZ(`[ ${start_off} | ${bf_str} ] \n[ registers_size: ${item.registers_size} | ins_size: ${item.ins_size} | outs_size: ${item.outs_size} | tries_size: ${item.tries_size} | debug_info_off: ${item.debug_info_off} | insns_size_in_code_units: ${item.insns_size_in_code_units} | insns: ${item.insns} ]\n`)
        }

        let offset: number = 0
        let index: number = 0
        this.forEachSmali((insns: ArtInstruction, _codeitem: DexItemStruct) => {
            const offStr: string = `[${(++index).toString().padStart(3, ' ')}|${ptr(offset).toString().padEnd(5, ' ')}]`
            LOGD(`${offStr} ${insns.handle} - ${insns.dumpHexLE()} |  ${insns.dumpString(dex_file)}`)
            offset += insns.SizeInCodeUnits
            if (forceRet-- <= 0) {
                LOGW(`\nforce return counter -> ${forceRet}\nThere may be a loop error, check the code ...`)
                return
            }
        })
        newLine()
    }

    showOatAsm(num: number = 20, info: boolean = false) {
        newLine()
        if (info) LOGD(`👉 ${this}\n`)
        LOGD(this.methodName)
        newLine()

        // 暂时无法去确定asm的结束位置
        let insns: Instruction = Instruction.parse(this.entry_point_from_quick_compiled_code)
        let num_local: number = 0
        let code_offset: number = 0
        let errorFlag: boolean = false
        while (++num_local < num) {
            let indexStr: string = `[${num_local.toString().padStart(4, ' ')}|${ptr(code_offset).toString().padEnd(5, ' ')}]`
            !errorFlag ? LOGD(`${indexStr} ${insns.address}\t${insns.toString()}`) : function () {
                const bt: ArrayBuffer = insns.address.readByteArray(4)
                const btStr: string = Array.from(new Uint8Array(bt)).map((item: number) => item.toString(16).padStart(2, '0')).join(' ')
                LOGE(`${indexStr} ${insns.address}\t${btStr} <--- ERROR`)
            }()
            code_offset += insns.size
            try {
                insns = Instruction.parse(insns.next)
                errorFlag = false
            } catch (error) {
                insns = Instruction.parse(insns.address.add(PointerSize))
                errorFlag = true
            }
            // todo 这里的num后续可以省略，使用栈寄存器判断平栈的位置作为函数结束的位置
            // 还需要去了解一下oat文件格式，配合一些其他的信息来添加上更多的一些符号信息以便于提高可读性
            // 解析出更多信息后是不是可以考虑在进入这个函数的时候判断当前函数是否已经被oat然后决定实现javahook的方式直接去hook已经编译好的oat文件
        }
        newLine()
    }

    public forEachSmali = (callback: (instruction: ArtInstruction, codeitem: DexItemStruct) => void): void => forEachSmali_static.bind(this)(this, callback)

    public HookArtMethodInvoke = () => ArtMethod_Inl.HookArtMethodInvoke()
}

Reflect.set(globalThis, 'ArtMethod', ArtMethod)


class ArtMethod_Inl extends ArtMethod {

    private static filterTimes_ptr: NativePointer = Memory.alloc(Process.pointerSize).writeInt(5)
    private static filterThreadId_ptr: NativePointer = Memory.alloc(Process.pointerSize).writeInt(-1)
    private static filterMethodName_ptr: NativePointer = Memory.alloc(Process.pointerSize * 10).writeUtf8String('')

    static HookArtMethodInvoke() {

        Interceptor.attach(getSym("_ZN3art9ArtMethod6InvokeEPNS_6ThreadEPjjPNS_6JValueEPKc", "libart.so"), new CModule(`

            #include <stdio.h>
            #include <glib.h>
            #include <gum/gumprocess.h>
            #include <gum/guminterceptor.h>

            extern void _frida_log(const gchar * message);

            static void frida_log(const char * format, ...) {
                gchar * message;
                va_list args;
                va_start (args, format);
                message = g_strdup_vprintf (format, args);
                va_end (args);
                _frida_log (message);
                g_free (message);
            }

            typedef struct _ArtMethod ArtMethod;

            extern void CalledArtMethod(ArtMethod* artMethod);

            typedef guint8 jboolean;
            typedef union _StdString StdString;
            typedef struct _StdStringShort StdStringShort;
            typedef struct _StdStringLong StdStringLong;

            struct _StdStringShort {
                guint8 size;
                gchar data[(3 * sizeof (gpointer)) - sizeof (guint8)];
            };

            struct _StdStringLong {
                gsize capacity;
                gsize size;
                gchar * data;
            };

            union _StdString {
                StdStringShort s;
                StdStringLong l;
            };
            
            // std::string PrettyMethod(bool with_signature = true)
            extern void ArtPrettyMethodFunc(StdString * result, ArtMethod * method, jboolean with_signature);

            void(*it)(void* dexFile);

            extern int filterTimes;
            extern int filterThreadId;
            extern const char* filterMethodName;

            extern GHashTable *ptrHash;

            gboolean filterMethodCount(void* ptr) {
                if (ptrHash == NULL) {
                    ptrHash = g_hash_table_new_full(g_direct_hash, g_direct_equal, NULL, NULL);
                }

                guint count = GPOINTER_TO_UINT(g_hash_table_lookup(ptrHash, ptr));

                if (count >= filterTimes) {
                    // frida_log("Filter PASS (Count >= %d ) -> %p", filterTimes, ptr);
                    return FALSE;
                } else {
                    g_hash_table_insert(ptrHash, ptr, GUINT_TO_POINTER(count + 1));
                    return TRUE;
                }
            }

            gboolean filterThreadIdCount(GumInvocationContext *ctx) {
                if (-1 == filterThreadId) return TRUE;
                guint threadid = gum_invocation_context_get_thread_id(ctx);
                return threadid == filterThreadId;
            }

            gboolean filterMethodNameCount(ArtMethod* artMethod) {
                StdString result;
                ArtPrettyMethodFunc(&result, artMethod, TRUE);
                const char* methodName = result.l.data;
                frida_log("methodName -> %s", methodName);
                if (g_str_has_prefix(methodName, filterMethodName)) {
                    return TRUE;
                }
                return FALSE;
            }

            void onEnter(GumInvocationContext *ctx) {
                ArtMethod* artMethod = gum_invocation_context_get_nth_argument(ctx, 0);
                if (filterMethodCount(artMethod) && filterThreadIdCount(ctx) 
                    // && filterMethodNameCount(artMethod)
                ) {
                    CalledArtMethod(artMethod);
                }
            }

        `, {
            filterTimes: ArtMethod_Inl.filterTimes_ptr,
            filterThreadId: ArtMethod_Inl.filterThreadId_ptr,
            filterMethodName: ArtMethod_Inl.filterMethodName_ptr,
            ptrHash: Memory.alloc(Process.pointerSize),
            ArtPrettyMethodFunc: getSym("_ZN3art9ArtMethod12PrettyMethodEb"),
            _frida_log: new NativeCallback((message: NativePointer) => {
                LOGZ(message.readCString())
            }, 'void', ['pointer']),
            CalledArtMethod: new NativeCallback((artMethod: NativePointer) => {
                const method: ArtMethod = new ArtMethod(artMethod)
                // include in ArtMethod_Inl.includePackage
                if (!ArtMethod_Inl.includePackage.some((pkg: string) => method.methodName.includes(pkg))) {
                    // SuspendAll()
                    return
                }
                const msg: string = `Called [${Process.id}|${Process.getCurrentThreadId()}] -> ${method.methodName}`
                method.methodName == "ERROR" ? LOGE(msg) : LOGD(msg)
            }, 'void', ['pointer'])

        }) as NativeInvocationListenerCallbacks)

        return

        // void ArtMethod::Invoke(Thread* self, uint32_t* args, uint32_t args_size, JValue* result, const char* shorty)
        Interceptor.attach(getSym("_ZN3art9ArtMethod6InvokeEPNS_6ThreadEPjjPNS_6JValueEPKc", "libart.so"), {
            onEnter: function (args) {
                const artMethod: ArtMethod = new ArtMethod(args[0])
                const thread: ArtThread = new ArtThread(args[1])
                // const args_: NativePointer = args[2]
                // const args_size: number = args[3].readU32()
                // const result: JValue = new JValue(args[4])
                // const shorty: string = args[5].readCString()
                LOGD(`ArtMethod::Invoke -> ${artMethod.methodName}`)
            }
        })
    }

    static includePackage: string[] = [
        "com.igaworks",
        "com.hippogames",
        "com.unity3d",
        "com.google",
    ]

    static onValueChanged(key: string, value: number | string): void {
        if (key != "filterTimes" && key != "filterThreadId" && key != "filterMethodName") return
        LOGZ(`ArtMethodInvoke Got New Value -> ${key} -> ${value}`)
        if (key == "filterTimes") ArtMethod_Inl.filterTimes_ptr.writeInt(value as number)
        if (key == "filterThreadId") ArtMethod_Inl.filterThreadId_ptr.writeInt(value as number)
        if (key == "filterMethodName") ArtMethod_Inl.filterMethodName_ptr.writeUtf8String(value as string)
    }

}

function forEachSmali_static(artMethod: ArtMethod, callback: (instruction: ArtInstruction, codeitem: DexItemStruct) => void): void {
    const accessor: CodeItemInstructionAccessor = artMethod.DexInstructions()
    const code_item = accessor.CodeItem
    let insns: ArtInstruction = accessor.InstructionAt()
    let offset: number = 0
    let last_offset: number = 0
    const count_insns: number = accessor.insns_size_in_code_units * 2
    while (true) {
        callback(insns, code_item)
        offset += insns.SizeInCodeUnits
        if (last_offset == offset) break // Prevent infinite loop
        if (offset >= count_insns) break // end of code_item
        insns = insns.Next()
        last_offset = offset
    }
}

setImmediate(() => {
    KeyValueStore.getInstance<string, number>().subscribe(ArtMethod_Inl)
})

declare global {
    var HookArtMethodInvoke: () => void
    var forEachSmali: (artMethod: ArtMethod, callback: (instruction: ArtInstruction, codeitem: DexItemStruct) => void) => void
}

globalThis.HookArtMethodInvoke = ArtMethod_Inl.HookArtMethodInvoke
globalThis.forEachSmali = forEachSmali_static