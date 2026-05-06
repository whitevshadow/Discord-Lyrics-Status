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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LrcLibSource = void 0;
const BaseSource_1 = require("./BaseSource");
class LrcLibSource extends BaseSource_1.BaseSource {
    getLyrics(name, artist) {
        return __awaiter(this, void 0, void 0, function* () {
            // Use search API as we don't have duration/album readily available in this interface
            const url = `https://lrclib.net/api/search?q=${encodeURIComponent(`${name} ${artist}`)}`;
            const response = yield fetch(url, {
                headers: {
                    "User-Agent": "LyricsStatus v3 (https://github.com/OvalQuilter/lyrics-status)"
                }
            });
            const tracks = yield response.json();
            // Find the first track with synced lyrics
            const track = tracks.find(t => t.syncedLyrics);
            if (!track)
                throw "Lyrics not found";
            return this.parseLyrics(track.syncedLyrics);
        });
    }
    parseLyrics(lrc) {
        const result = {
            lines: []
        };
        const lines = lrc.split("\n");
        // Regex for [mm:ss.xx] or [mm:ss.xxx]
        const timeRegex = /\[(\d+):(\d+)\.(\d+)\]/;
        for (const line of lines) {
            const match = timeRegex.exec(line);
            if (!match)
                continue;
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const hundredths = parseInt(match[3]);
            // Normalize milliseconds (if 2 digits, it's 10ms units, if 3, it's 1ms)
            // Typically LrcLib returns .xx (hundredths) -> * 10
            // But let's handle the string length logic if needed or just assume typical LRC
            // Standard LRC is usually hundredths.
            // If the captured group 'hundredths' has 2 digits, it is 10ms. 3 digits = 1ms.
            let ms = hundredths;
            if (match[3].length === 2)
                ms *= 10;
            else if (match[3].length === 1)
                ms *= 100;
            const time = (minutes * 60 * 1000) + (seconds * 1000) + ms;
            const text = line.replace(timeRegex, "").trim();
            if (text) {
                result.lines.push({
                    time,
                    text
                });
            }
        }
        return result;
    }
    getAppName() {
        return "LrcLib";
    }
}
exports.LrcLibSource = LrcLibSource;
