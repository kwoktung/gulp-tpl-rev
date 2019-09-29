import through2 from "through2";
import RewritingStream from "parse5-html-rewriting-stream"
import * as url from "url";

interface PluginOption {
    name?: string,
    hash?(pathname?: string):string
    match?(pathname: string): boolean
}

const defaultOptions: PluginOption = {
    name: "_v",
    hash: function(pathname: string) { return "" + Date.now() },
    match: function(pathname: string) { return /^\/[^/]+/.test(pathname) }
}

export default function(options: PluginOption) {
    if (!options.name) {
        options.name = defaultOptions.name
    }
    if(!options.hash) {
        options.hash = defaultOptions.hash
    }
    if (!options.match) {
        options.match = defaultOptions.match
    }
    return through2.obj(function(file, _, cb) {
        let tpl = "";
        const rewriter = new RewritingStream();
        rewriter.on('startTag', token => {
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
            }
            rewriter.emitStartTag(token);
        });
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
    })
}