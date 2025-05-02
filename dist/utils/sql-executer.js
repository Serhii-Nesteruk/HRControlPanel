"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require('path');
const fs = require('fs').promises;
function checkFileExists(pathStr) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs.access(pathStr, fs.constants.R_OK);
            return true;
        }
        catch (err) {
            return false;
        }
    });
}
module.exports = (fileName, db, projectHomedir) => __awaiter(void 0, void 0, void 0, function* () {
    const pathStr = path.join(projectHomedir, fileName);
    if (!(yield checkFileExists(pathStr))) {
        throw new Error(`Failed to execute sql file: ${pathStr}`);
    }
    const file_content = yield fs.readFile(pathStr, 'utf8');
    const file_content_arr = file_content.split(';');
    for (const query of file_content_arr) {
        yield db.execute(query);
    }
});
