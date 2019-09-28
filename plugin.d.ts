/// <reference types="node" />
interface PluginOption {
    name: string;
    hash(pahtname?: string): string;
}
export default function (options?: PluginOption): import("stream").Transform;
export {};
