"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var through2_1 = __importDefault(require("through2"));
var parse5_html_rewriting_stream_1 = __importDefault(require("parse5-html-rewriting-stream"));
var url = __importStar(require("url"));
var defaultOptions = {
    name: "_v",
    hash: function (pahtname) { return "" + Date.now(); }
};
function default_1(options) {
    if (options === void 0) { options = defaultOptions; }
    return through2_1.default.obj(function (file, _, cb) {
        var tpl = "";
        var rewriter = new parse5_html_rewriting_stream_1.default();
        rewriter.on('startTag', function (token) {
            if (token.tagName === 'link') {
                var attr = token.attrs.filter(function (attr) { return attr.name === "href"; })[0];
                if (attr) {
                    var urlObject = url.parse(attr.value, true);
                    var query = urlObject.query;
                    query[options.name] = options.hash(urlObject.pathname);
                    attr.value = url.format(urlObject);
                }
            }
            rewriter.emitStartTag(token);
        });
        rewriter.on("text", function (token) {
            rewriter.emitText(token);
        });
        rewriter.on("data", function (token) {
            tpl += token;
        });
        rewriter.on("end", function () {
            file.contents = Buffer.from(tpl);
            cb(null, file);
        });
        rewriter.end(file.contents.toString());
    });
}
exports.default = default_1;
