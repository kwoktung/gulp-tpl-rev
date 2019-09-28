import through2 from "through2";
import RewritingStream from "parse5-html-rewriting-stream"
import * as url from "url";

interface PluginOption {
    name: string,
    hash(pahtname?: string):string
}

const defaultOptions: PluginOption = {
    name: "_v",
    hash: function(pahtname: string) { return "" + Date.now() }
}

export default function(options: PluginOption = defaultOptions) {
    return through2.obj(function(file, _, cb) {
        let tpl = "";
        const rewriter = new RewritingStream();
        rewriter.on('startTag', token => {
            if (token.tagName === 'link') {
                const attr = token.attrs.filter(attr => attr.name === "href")[0];
                if (attr) {
                    const urlObject = url.parse(attr.value, true);
                    const query = urlObject.query;
                    query[options.name] = options.hash(urlObject.pathname);
                    attr.value = url.format(urlObject);
                }
            }
            rewriter.emitStartTag(token);
        });
        rewriter.on("text", function(token) {
            rewriter.emitText(token)
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