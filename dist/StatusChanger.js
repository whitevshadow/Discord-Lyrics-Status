"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusChanger = void 0;
const Settings_1 = require("./Settings");
const Autooffset_1 = require("./Autooffset");

// ===== Dynamic Emoji Mapping =====
const emojiByLyric = {
    love: "❤️", happy: "😊", sad: "😢", party: "🎉", fire: "🔥", night: "🌙", star: "⭐", dance: "💃", rain: "🌧️", cry: "😭",
    heart: "💖", smile: "😄", sun: "☀️", moon: "🌝", shine: "✨", alone: "😔", together: "🤗", dream: "💭", sky: "🌌", girl: "👧",
    boy: "👦", friend: "🫂", king: "🤴", queen: "👸", win: "🏆", lose: "🥀", game: "🎮", peace: "✌️", war: "⚔️", light: "💡",
    dark: "🌑", city: "🏙️", road: "🛣️", home: "🏡", car: "🚗", plane: "🛫", travel: "🧳", ocean: "🌊", water: "💧", flower: "🌻",
    tree: "🌳", mountain: "🏔️", high: "⛰️", fall: "🍂", rise: "🌅", freedom: "🕊️", magic: "🪄", ice: "🧊", firework: "🎆", world: "🌍",
    hope: "🕯️", wish: "🌠", angel: "👼", devil: "👿", money: "💸", rich: "💰", poor: "🥺", sweet: "🍬", cold: "🥶", hot: "🥵",
    school: "🏫", work: "💻", sleep: "😴", wake: "🌄", clock: "⏰", time: "⌚", run: "🏃‍♂️", jump: "🤾", sing: "🎤", music: "🎶",
    band: "🎺", guitar: "🎸", piano: "🎹", beat: "🥁", bass: "🪕", lyrics: "📝", shout: "🗣️", call: "📞", text: "💬", phone: "📱",
    dreamer: "🤩", family: "👨‍👩‍👧‍👦", child: "🧒", angelic: "😇", wild: "🐅", animal: "🐾", cat: "🐱", dog: "🐕", bird: "🦜", rose: "🌹",
    diamond: "💎", broken: "💔", fix: "🛠️", new: "🆕", old: "👴", forever: "♾️", end: "🔚", goodbye: "👋", hello: "🙋‍♂️", begin: "🔜",
    faith: "🙏", trust: "🤝", secret: "🤫", mystery: "🕵️‍♂️", gold: "🥇", silver: "🥈", bronze: "🥉", orange: "🍊", blue: "🔷", green: "🟢",
    red: "🔴", yellow: "🟡", purple: "🟣", black: "⚫️", white: "⚪️", pink: "💗", brown: "🤎", coffee: "☕", tea: "🍵", beer: "🍻",
    lost: "🗺️", found: "🔎", fast: "⚡", slow: "🦥", mist: "🌫️", storm: "🌩️", thunder: "⚡️", lightning: "🌩️", earth: "🌏", starry: "🌠",
    silence: "🤫", noise: "🔊", loud: "📢", quiet: "🤫", journey: "🧭", roadtrip: "🚙", adventure: "🧗‍♂️", scared: "😱", strong: "💪", weak: "🥲",
    freedom: "🦅", lost: "❓", wild: "🦁", peace: "☮️", rainbow: "🌈", wave: "🏄‍♂️", luck: "🍀", magic: "🦄", beautiful: "😍", crazy: "🤪"
};
// ===== Helper Function =====
function pickEmojiForLyric(text) {
    if (!text) return "🎶";
    for (const key in emojiByLyric) {
        if (text.toLowerCase().includes(key)) {
            return emojiByLyric[key];
        }
    }
    return "🎶";
}

class StatusChanger {
    constructor(playbackState) {
        this.playbackState = playbackState;
        this.sentLines = [];
        this.autooffset = new Autooffset_1.Autooffset();
    }
    changeStatusRequest(text, token, emoji) {
        const now = Date.now();
        const request = fetch("https://discordapp.com/api/v8/users/@me/settings", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                custom_status: {
                    text,
                    emoji_id: null,
                    emoji_name: emoji,
                    expires_at: new Date(Date.now() + 60000).toISOString()
                }
            })
        });
        request.then(() => this.autooffset.addValue(Date.now() - now));
        return request;
    }
    changeStatus() {
        this.autooffset.setLimit(Settings_1.Settings.timings.autooffset);
        const playbackState = this.playbackState;
        if (playbackState.ended || !playbackState.hasLyrics || !playbackState.isPlaying)
            return;
        const lyrics = playbackState.lyrics;
        if (!lyrics)
            return;
        const currentLine = playbackState.currentLine;
        const songProgress = playbackState.songProgress;
        const lines = lyrics.lines;
        const offset = Settings_1.Settings.timings.enableAutooffset
            ? this.autooffset.getAverageValue() + 100
            : Settings_1.Settings.timings.sendTimeOffset;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nextLine = lines[i + 1];
            if (line.time < (songProgress + offset)) {
                if (!line.text) continue;
                if (nextLine && nextLine.time < (songProgress + offset)) continue;
                if (this.sentLines.some((sentLine) => sentLine.time === line.time)) break;
                if (line === currentLine) break;
                playbackState.currentLine = line;
                // -- Dynamic emoji injected here --
                const emoji = pickEmojiForLyric(line.text);
                if (Settings_1.Settings.view.advanced.enabled) {
                    this.changeStatusRequest(
                        this.parseStatusString(Settings_1.Settings.view.advanced.customStatus),
                        Settings_1.Settings.credentials.token,
                        Settings_1.Settings.view.advanced.customEmoji
                    );
                } else {
                    this.changeStatusRequest(
                        this.getStatusString(line),
                        Settings_1.Settings.credentials.token,
                        emoji
                    );
                }
                this.sentLines.push(line);
                break;
            }
        }
    }
    songChanged() {
        this.sentLines = [];
    }
    formatSeconds(s) {
        return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
    }
    getStatusString(line) {
        return `${Settings_1.Settings.view.timestamp ? `[${this.formatSeconds(+(line.time / 1000).toFixed(0))}] ` : ""}${Settings_1.Settings.view.label ? "Song lyrics - " : ""}${line.text.replace("♪", "🎶")}`.slice(0, 128);
    }
    parseStatusString(status) {
        if (this.playbackState.currentLine) {
            const line = this.playbackState.currentLine;
            const songName = this.playbackState.songName;
            const songAuthor = this.playbackState.songAuthor;
            status = status
                .replace("{lyrics}", line.text)
                .replace("{lyrics_upper}", line.text.toUpperCase())
                .replace("{lyrics_lower}", line.text.toLowerCase())
                .replace("{lyrics_letters_only}", line.text.replace(/['",\.]/gi, ""))
                .replace("{lyrics_upper_letters_only}", line.text.toUpperCase().replace(/['",\.]/gi, ""))
                .replace("{lyrics_lower_letters_only}", line.text.toLowerCase().replace(/['",\.]/gi, ""))
                .replace("♪", "🎶")
                .replace("{timestamp}", this.formatSeconds(+(line.time / 1000).toFixed()))
                .replace("{song_name}", songName)
                .replace("{song_name_upper}", songName.toUpperCase())
                .replace("{song_name_lower}", songName.toLowerCase())
                .replace("{song_name_cropped}", songName.replace(/( ?- ?.+)|(\(.+\))/gi, ""))
                .replace("{song_name_upper_cropped}", songName.toUpperCase().replace(/( ?- ?.+)|(\(.+\))/gi, ""))
                .replace("{song_name_lower_cropped}", songName.toLowerCase().replace(/( ?- ?.+)|(\(.+\))/gi, ""))
                .replace("{song_author}", songAuthor)
                .replace("{song_author_upper}", songAuthor.toUpperCase())
                .replace("{song_author_lower}", songAuthor.toLowerCase());
        }
        return status.slice(0, 128);
    }
}
exports.StatusChanger = StatusChanger;
