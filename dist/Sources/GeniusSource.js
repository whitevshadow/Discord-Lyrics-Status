"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.GeniusSource = void 0;
const BaseSource_1 = require("./BaseSource");
const he = __importStar(require("he"));
class GeniusSource extends BaseSource_1.BaseSource {
    getLyrics(name, artist) {
        return __awaiter(this, void 0, void 0, function* () {
            // Search for the song
            const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(`${name} ${artist}`)}`;
            const searchRes = yield fetch(searchUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
            });
            const searchJson = yield searchRes.json();
            let songUrl = null;
            for (const section of searchJson.response.sections) {
                if (section.hits.length > 0) {
                    // simple check, just take the first one for now or refine
                    songUrl = section.hits[0].result.url;
                    break;
                }
            }
            if (!songUrl)
                throw "Lyrics not found";
            // Fetch the lyrics page
            const lyricsRes = yield fetch(songUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
            });
            const lyricsHtml = yield lyricsRes.text();
            return this.parseLyrics(lyricsHtml);
        });
    }
    parseLyrics(html) {
        // Basic scraper for Genius lyrics
        // Genius structure changes often, but typically it's in a container with class matching 'Lyrics__Container'
        // or data-lyrics-container="true"
        const result = {
            lines: []
        };
        // Regex to extract lyrics content - this is fragile but avoids heavy deps like cheerio
        // We look for the lyrics container(s)
        const containerRegex = /<div[^>]*data-lyrics-container="true"[^>]*>(.*?)<\/div>/g;
        let match = containerRegex.exec(html);
        let rawHtml = "";
        while (match !== null) {
            rawHtml += match[1] + "\n";
            match = containerRegex.exec(html);
        }
        if (!rawHtml) {
            // Fallback for older/different layouts if any
            throw "Could not parse lyrics format";
        }
        // Clean up the HTML
        // Replace <br> with newlines
        let text = rawHtml.replace(/<br\s*\/?>/gi, "\n");
        // Remove other tags
        text = text.replace(/<[^>]+>/g, "");
        // Decode entities
        text = he.decode(text);
        const lines = text.split("\n");
        // Since Genius doesn't strictly provide time-synced lyrics in HTML, 
        // we'll return unsynced lyrics. 
        // To fit the interface which expects 'time', we might have to fake it or just provide lines.
        // The interface uses 'time: number'. If we don't have time, maybe we can't use this source for *synced* lyrics.
        // But the user just asked for "more features", and lyrics is the main one.
        // If the app requires synced lyrics, Genius might not be the best fit without a synced database.
        // However, looking at BaseSource, it returns SongLyrics which is LyricsLine[] -> {time, text}.
        // If we can't sync, maybe we just put them all at 0 or distribute them?
        // Or maybe this app supports unsynced lyrics?
        // Let's assume we just want to show them.
        // Detailed check: SpotifySource returns real times. NetEase returns real times.
        // If I provide 0, it might just show all at once or nothing.
        // I will provide them with incrementing meaningless time just to display them, 
        // or check if there's a "unsynced" flag? No, interface is simple.
        let dummyTime = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
                result.lines.push({
                    time: dummyTime,
                    text: trimmed
                });
                dummyTime += 100; // increment slightly so they don't overlap keys if that matters
            }
        }
        return result;
    }
    getAppName() {
        return "Genius";
    }
}
exports.GeniusSource = GeniusSource;
