import { StdString } from "../../../../tools/StdString"
import { JSHandle } from "../../../JSHandle"
import { ArtClass } from "./mirror/ArtClass"

// class DexFile;
export class DexFile extends JSHandle {

    private static size_t_len: number = 32

    constructor(handle: NativePointer) {
        super(handle)
    }

    toString(): String {
        let disp: String = `DexFile<${this.handle}> \n`
        // disp += `location: ${this.location} location_checksum: ${this.location_checksum} ( ${ptr(this.location_checksum)} ) is_compact_dex: ${this.is_compact_dex} \n`
        disp += `begin: ${this.begin} size: ${this.size} ( ${ptr(this.size)} ) | data_begin: ${this.data_begin} data_size: ${this.data_size} ( ${ptr(this.data_size)} ) `
        return disp
    }

    // ALWAYS_INLINE std::string PrettyMethod(uint32_t method_idx, bool with_signature = true) const {
    //     std::string result;
    //     AppendPrettyMethod(method_idx, with_signature, &result);
    //     return result;
    //   }
    // _ZNK3art7DexFile12PrettyMethodEjb
    PrettyMethod(method_idx: number, with_signature: boolean = true): string {
        const PrettyMethodAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile12PrettyMethodEjb")!
        const PrettyMethod = new NativeFunction(PrettyMethodAddr, "pointer", ["pointer", "pointer", "pointer"])
        return new StdString(PrettyMethod(this.handle, ptr(method_idx), with_signature ? ptr(1) : NULL) as NativePointer).disposeToString()
    }

    // _ZNK3art7DexFile17CalculateChecksumEv
    // virtual uint32_t CalculateChecksum() const;
    CalculateChecksum(): number {
        const CalculateChecksumAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile17CalculateChecksumEv")!
        const CalculateChecksum = new NativeFunction(CalculateChecksumAddr, "uint32", ["pointer"])
        return CalculateChecksum(this.handle) as number
    }

    // _ZNK3art7DexFile10IsReadOnlyEv
    // bool IsReadOnly() const;
    IsReadOnly(): boolean {
        const IsReadOnlyAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile10IsReadOnlyEv")!
        const IsReadOnly = new NativeFunction(IsReadOnlyAddr, "bool", ["pointer"])
        return IsReadOnly(this.handle) as boolean
    }

    // _ZNK3art7DexFile12DisableWriteEv
    // bool DisableWrite() const;
    DisableWrite(): boolean {
        const DisableWriteAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile12DisableWriteEv")!
        const DisableWrite = new NativeFunction(DisableWriteAddr, "bool", ["pointer"])
        return DisableWrite(this.handle) as boolean
    }

    // _ZNK3art7DexFile11EnableWriteEv
    // bool EnableWrite() const;
    EnableWrite(): boolean {
        const EnableWriteAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile11EnableWriteEv")!
        const EnableWrite = new NativeFunction(EnableWriteAddr, "bool", ["pointer"])
        return EnableWrite(this.handle) as boolean
    }

    // _ZNK3art7DexFile10PrettyTypeENS_3dex9TypeIndexE
    // std::string PrettyType(dex::TypeIndex type_idx) const;
    PrettyType(type_idx: number): string {
        const PrettyTypeAddr = Module.findExportByName("libdexfile.so", "_ZNK3art7DexFile10PrettyTypeENS_3dex9TypeIndexE")!
        const PrettyType = new NativeFunction(PrettyTypeAddr, "pointer", ["pointer", "pointer"])
        return new StdString(PrettyType(this.handle, ptr(type_idx)) as NativePointer).disposeToString()
    }

    // The base address of the memory mapping.
    //   const uint8_t* const begin_;
    get begin(): NativePointer {
        return this.handle.readPointer()
    }

    // The size of the underlying memory allocation in bytes.
    //   const size_t size_;
    get size(): number {
        return this.handle.add(ArtClass.PointerSize * 1 + DexFile.size_t_len * 0).readU32()
    }

    // The base address of the data section (same as Begin() for standard dex).
    //   const uint8_t* const data_begin_;
    get data_begin(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 1 + DexFile.size_t_len * 1).readPointer()
    }

    // The size of the data section.
    //   const size_t data_size_;
    get data_size(): number {
        return this.handle.add(ArtClass.PointerSize * 2 + DexFile.size_t_len).readU32()
    }

    // Typically the dex file name when available, alternatively some identifying string.
    //
    // The ClassLinker will use this to match DexFiles the boot class
    // path to DexCache::GetLocation when loading from an image.
    //   const std::string location_;
    get location(): string {
        try {
            return new StdString(this.handle.add(ArtClass.PointerSize * 2 + DexFile.size_t_len * 2).readPointer()).disposeToString()
        } catch (error) {
            return "..."
        }
    }

    //  const uint32_t location_checksum_;
    get location_checksum(): number {
        return this.handle.add(ArtClass.PointerSize * 3 + DexFile.size_t_len * 2).readU32()
    }

    // const Header* const header_;
    get header(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 3 + DexFile.size_t_len * 2 + 32).readPointer()
    }

    // Points to the base of the string identifier list.
    //   const dex::StringId* const string_ids_;
    get string_ids(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 4 + DexFile.size_t_len * 2 + 32).readPointer()
    }

    // Points to the base of the type identifier list.
    //   const dex::TypeId* const type_ids_;
    get type_ids(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 5 + DexFile.size_t_len * 2 + 32).readPointer()
    }

    // Points to the base of the field identifier list.
    //   const dex::FieldId* const field_ids_;
    get field_ids(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 6 + DexFile.size_t_len * 2 + 32).readPointer()
    }

    // Points to the base of the method identifier list.
    //   const dex::MethodId* const method_ids_;
    get method_ids(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 7 + DexFile.size_t_len * 2 + 32).readPointer()
    }

    // Points to the base of the prototype identifier list.
    //   const dex::ProtoId* const proto_ids_;
    get proto_ids(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 8 + DexFile.size_t_len * 2 + 32).readPointer()
    }

    // Points to the base of the class definition list.
    //   const dex::ClassDef* const class_defs_;
    get class_defs(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 9 + DexFile.size_t_len * 2 + 32).readPointer()
    }

    // Points to the base of the method handles list.
    //   const dex::MethodHandleItem* method_handles_;
    get method_handles(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 10 + DexFile.size_t_len * 2 + 32).readPointer()
    }

    //   // Number of elements in the method handles list.
    //   size_t num_method_handles_;
    get num_method_handles(): number {
        return this.handle.add(ArtClass.PointerSize * 11 + DexFile.size_t_len * 2 + 32).readU32()
    }

    // Points to the base of the call sites id list.
    //   const dex::CallSiteIdItem* call_site_ids_;
    get call_site_ids(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 11 + DexFile.size_t_len * 3 + 32).readPointer()
    }

    // Number of elements in the call sites list.
    //   size_t num_call_site_ids_;
    get num_call_site_ids(): number {
        return this.handle.add(ArtClass.PointerSize * 12 + DexFile.size_t_len * 3 + 32).readU32()
    }

    // Points to the base of the hiddenapi class data item_, or nullptr if the dex
    // file does not have one.
    //   const dex::HiddenapiClassData* hiddenapi_class_data_;
    get hiddenapi_class_data(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 12 + DexFile.size_t_len * 4 + 32).readPointer()
    }

    // If this dex file was loaded from an oat file, oat_dex_file_ contains a
    // pointer to the OatDexFile it was loaded from. Otherwise oat_dex_file_ is
    // null.
    //   mutable const OatDexFile* oat_dex_file_;
    get oat_dex_file(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 13 + DexFile.size_t_len * 4 + 32).readPointer()
    }

    // Manages the underlying memory allocation.
    //   std::unique_ptr<DexFileContainer> container_;
    get container(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 14 + DexFile.size_t_len * 4 + 32).readPointer()
    }

    // If the dex file is a compact dex file. If false then the dex file is a standard dex file.
    //   const bool is_compact_dex_;
    get is_compact_dex(): boolean {
        return this.handle.add(ArtClass.PointerSize * 13 + DexFile.size_t_len * 4 + 32).readU8() == 1
    }

    // The domain this dex file belongs to for hidden API access checks.
    // It is decleared `mutable` because the domain is assigned after the DexFile
    // has been created and can be changed later by the runtime.
    //   mutable hiddenapi::Domain hiddenapi_domain_;
    get hiddenapi_domain(): NativePointer {
        return this.handle.add(ArtClass.PointerSize * 13 + DexFile.size_t_len * 4 + 32 + 8).readPointer()
    }

}

declare global {
    var DexFile: any
}

globalThis.DexFile = DexFile