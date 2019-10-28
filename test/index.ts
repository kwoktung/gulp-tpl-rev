import { default as File } from "vinyl";
import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import plugin from "../plugin";


describe("plugin", function() {
    const tpl = plugin(function(pathname) { 
        if (pathname !== undefined) {
            const { ext } = path.parse(pathname)
            if (ext === ".css" || ext === ".js") {
                return "1"
            }
        }
        return ""
    })
    const file = new File({
        path: "/test/index.html",
        contents: fs.readFileSync("./test/index.html")
    });
    tpl.write(file)
    tpl.end();
    it("should append ?_v=1 to link and script", function() {
        assert.equal(file.contents.toString(), fs.readFileSync('./test/index_o.html', 'utf-8'))
    })
})