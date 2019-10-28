import through2 from "through2";
import RewritingStream from "parse5-html-rewriting-stream"
import * as url from "url";
import { default as File } from "vinyl";

interface PluginOption {
    name?: string,
    hash?(pathname?: string):string
    match?(pathname: string): boolean
}

interface PluginHash {
    (pathname?: string):string
}

export default function(params: PluginOption|PluginHash) {
    const options = {
        name: "_v",
        hash: function(pathname?: string): string { return "" + Date.now() },
        match: function(pathname: string): boolean { return /^\/[^/]+/.test(pathname) }
    }
    if (typeof params === "function") {
        options.hash = params
    } else {
        if (params.name !== undefined) {
            options.name = params.name
        }
        if(typeof params.hash === "function") {
            options.hash = params.hash
        }
        if (typeof params.match === "function") {
            options.match = params.match
        }
    }
    return through2.obj(function(file: File, _, cb) {
        if(file.isBuffer()) {
            let tpl = "";
            const rewriter = new RewritingStream();
            rewriter.on('startTag', (token, html) => {
                let attr;
                if (token.tagName === 'link') {
                    attr = token.attrs.filter(attr => attr.name === "href")[0];
                } else if (token.tagName === 'script') {
                    attr = token.attrs.filter(attr => attr.name === "src")[0];
                }
                if (attr && attr.value && options.match!(attr.value)) {
                    const urlObject = url.parse(attr.value, true);
                    const query = urlObject.query;
                    const hash = options.hash!(urlObject.pathname);
                    if (hash) {
                        query[options.name!] = hash;
                        attr.value = url.format(urlObject);
                    }
                    rewriter.emitStartTag(token);
                } else {
                    rewriter.emitRaw(html)
                }
            })
            rewriter.on("text", function(token) {
                rewriter.emitRaw(token.text)
            })
            rewriter.on("data", function(token) {
                tpl += token
            })
            rewriter.on("end", function() {
                file.contents = Buffer.from(tpl)
                cb(null, file)
            })
            rewriter.end(file.contents.toString())
        } else {
            cb(null, file)
        }
    })
}
