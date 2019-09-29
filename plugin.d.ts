/// <reference types="node" />
interface PluginOption {
    name?: string;
    hash?(pathname?: string): string;
    match?(pathname: string): boolean;
}
export default function (options: PluginOption): import("stream").Transform;
export {};
