import { PlaybackState } from "./PlaybackState"
import { Settings } from "./Settings"
import { LyricsLine } from "./Sources/BaseSource"
import { Autooffset } from "./Autooffset"

// === Emoji mapping for dynamic status ===
const emojiByLyricList: Array<{ keywords: string[], emoji: string }> = [
    { keywords: ["love", "loving", "adore", "beloved", "sweetheart"], emoji: "❤️" },
    { keywords: ["happy", "joy", "joyful", "glad", "delight", "cheerful", "jolly"], emoji: "😊" },
    { keywords: ["sad", "sadness", "cry", "crying", "weep", "tears", "unhappy", "blue"], emoji: "😢" },
    { keywords: ["party", "celebrate", "celebration", "fun", "festival", "festive"], emoji: "🎉" },
    { keywords: ["fire", "burning", "blaze", "flame", "ignite", "ember", "inferno"], emoji: "🔥" },
    { keywords: ["night", "midnight", "evening", "moonlight", "twilight", "dusk"], emoji: "🌙" },
    { keywords: ["star", "stars", "twinkle", "sparkling", "shine", "stellar"], emoji: "⭐" },
    { keywords: ["dance", "dancing", "groove", "moves", "disco", "boogie"], emoji: "💃" },
    { keywords: ["rain", "raining", "storm", "drizzle", "shower", "rainfall"], emoji: "🌧️" },
    { keywords: ["cry", "crying", "sob", "heartbreak", "heartbroken", "weep"], emoji: "😭" },
    { keywords: ["heart", "hearts", "romance", "romantic", "darling", "dear"], emoji: "💖" },
    { keywords: ["smile", "laughing", "laughter", "giggle", "grin"], emoji: "😄" },
    { keywords: ["sun", "sunshine", "sunrise", "sunset", "rays", "solar"], emoji: "☀️" },
    { keywords: ["moon", "moons", "lunar", "crescent", "fullmoon"], emoji: "🌝" },
    { keywords: ["shine", "shining", "glow", "sparkling", "light"], emoji: "✨" },
    { keywords: ["alone", "lonely", "solitude", "solo", "isolation"], emoji: "😔" },
    { keywords: ["together", "unite", "united", "friendship", "companion", "duet"], emoji: "🤗" },
    { keywords: ["dream", "dreaming", "fantasy", "imagine", "imagination", "vision"], emoji: "💭" },
    { keywords: ["sky", "skies", "cloud", "clouds", "heaven"], emoji: "🌌" },
    { keywords: ["girl", "girls", "woman", "lady", "feminine"], emoji: "👧" },
    { keywords: ["boy", "boys", "man", "guy", "masculine"], emoji: "👦" },
    { keywords: ["friend", "friends", "buddy", "bestie", "mates", "pal"], emoji: "🫂" },
    { keywords: ["king", "royalty", "throne", "ruler", "monarch"], emoji: "🤴" },
    { keywords: ["queen", "princess", "empress", "duchess", "majesty"], emoji: "👸" },
    { keywords: ["win", "winner", "victory", "success", "champion"], emoji: "🏆" },
    { keywords: ["lose", "loss", "losing", "defeat", "sorrow"], emoji: "🥀" },
    { keywords: ["game", "gaming", "player", "play", "match"], emoji: "🎮" },
    { keywords: ["peace", "harmony", "calm", "peaceful", "stillness"], emoji: "✌️" },
    { keywords: ["war", "battle", "fight", "combat", "warrior"], emoji: "⚔️" },
    { keywords: ["light", "lights", "bright", "illuminate", "lamp"], emoji: "💡" },
    { keywords: ["dark", "darkness", "shadow", "dim", "blackout"], emoji: "🌑" },
    { keywords: ["city", "urban", "downtown", "skyscraper", "metropolis"], emoji: "🏙️" },
    { keywords: ["road", "route", "journey", "path", "drive", "travel"], emoji: "🛣️" },
    { keywords: ["home", "house", "homestead", "cottage", "residence"], emoji: "🏡" },
    { keywords: ["car", "cars", "driving", "ride", "vehicle"], emoji: "🚗" },
    { keywords: ["plane", "flight", "fly", "aviation", "jet"], emoji: "🛫" },
    { keywords: ["travel", "adventure", "trip", "explore", "wander"], emoji: "🧳" },
    { keywords: ["ocean", "sea", "seaside", "beach", "tide"], emoji: "🌊" },
    { keywords: ["water", "lake", "river", "stream", "flow"], emoji: "💧" },
    { keywords: ["flower", "flowers", "blossom", "bloom", "petal"], emoji: "🌻" },
    { keywords: ["tree", "trees", "woods", "forest", "grove"], emoji: "🌳" },
    { keywords: ["mountain", "mountains", "hill", "summit", "cliff"], emoji: "🏔️" },
    { keywords: ["high", "up", "altitude", "soar", "rise"], emoji: "⛰️" },
    { keywords: ["fall", "autumn", "leaves", "leaf", "falling"], emoji: "🍂" },
    { keywords: ["rise", "sunrise", "dawn", "awaken"], emoji: "🌅" },
    { keywords: ["freedom", "free", "liberate", "liberation"], emoji: "🕊️" },
    { keywords: ["magic", "wonder", "mystical", "spell"], emoji: "🪄" },
    { keywords: ["ice", "frozen", "icy", "freeze"], emoji: "🧊" },
    { keywords: ["firework", "fireworks", "sparkler", "newyear", "festival"], emoji: "🎆" },
    { keywords: ["world", "earth", "globe", "planet", "universe"], emoji: "🌍" },
    { keywords: ["hope", "hopeful", "belief", "faith", "trust"], emoji: "🕯️" },
    { keywords: ["wish", "wishing", "desire", "fantasy"], emoji: "🌠" },
    { keywords: ["angel", "angels", "halo", "cherub"], emoji: "👼" },
    { keywords: ["devil", "demon", "evil", "wicked", "sinister"], emoji: "👿" },
    { keywords: ["money", "wealth", "cash", "dollar"], emoji: "💸" },
    { keywords: ["rich", "prosper", "fortune", "affluent"], emoji: "💰" },
    { keywords: ["poor", "broke", "bankrupt", "poverty"], emoji: "🥺" },
    { keywords: ["sweet", "candy", "sugar", "dessert"], emoji: "🍬" },
    { keywords: ["cold", "chilly", "freezing", "frosty"], emoji: "🥶" },
    { keywords: ["hot", "heat", "burning", "warm"], emoji: "🥵" },
    { keywords: ["school", "study", "education", "class", "lesson"], emoji: "🏫" },
    { keywords: ["work", "job", "office", "business"], emoji: "💻" },
    { keywords: ["sleep", "sleeping", "nap", "snooze", "slumber"], emoji: "😴" },
    { keywords: ["wake", "awake", "awaken", "daybreak"], emoji: "🌄" },
    { keywords: ["clock", "time", "hour", "minute", "alarm"], emoji: "⏰" },
    { keywords: ["run", "running", "runner", "dash", "sprint"], emoji: "🏃♂️" },
    { keywords: ["jump", "leap", "bounce", "hop"], emoji: "🤾" },
    { keywords: ["sing", "singing", "singer", "melody", "song"], emoji: "🎤" },
    { keywords: ["music", "musical", "tune", "harmony", "rhythm"], emoji: "🎶" },
    { keywords: ["band", "ensemble", "orchestra", "group"], emoji: "🎺" },
    { keywords: ["guitar", "guitars", "string", "rock"], emoji: "🎸" },
    { keywords: ["piano", "keyboard", "grand"], emoji: "🎹" },
    { keywords: ["beat", "beats", "drum", "drums", "percussion"], emoji: "🥁" },
    { keywords: ["bass", "groove", "strings"], emoji: "🪕" },
    { keywords: ["lyrics", "write", "words", "pen"], emoji: "📝" },
    { keywords: ["shout", "yell", "cheer", "voice"], emoji: "🗣️" },
    { keywords: ["call", "calling", "dial", "ring", "telephone"], emoji: "📞" },
    { keywords: ["text", "texting", "message", "chat", "sms"], emoji: "💬" },
    { keywords: ["phone", "mobile", "cell", "smartphone"], emoji: "📱" },
    { keywords: ["dreamer", "fantasize", "imagining", "visionary"], emoji: "🤩" },
    { keywords: ["family", "relatives", "parents", "kids", "home"], emoji: "👨👩👧👦" },
    { keywords: ["child", "children", "kid", "youngster"], emoji: "🧒" },
    { keywords: ["angelic", "innocent", "pure", "saint"], emoji: "😇" },
    { keywords: ["wild", "wildness", "untamed", "jungle"], emoji: "🐅" },
    { keywords: ["animal", "creature", "paw", "wildlife"], emoji: "🐾" },
    { keywords: ["cat", "kitty", "kitten", "feline"], emoji: "🐱" },
    { keywords: ["dog", "puppy", "pup", "canine"], emoji: "🐕" },
    { keywords: ["bird", "birds", "parrot", "flying", "wings"], emoji: "🦜" },
    { keywords: ["rose", "roses", "bloom", "petal"], emoji: "🌹" },
    { keywords: ["diamond", "gem", "jewel", "crystal", "precious"], emoji: "💎" },
    { keywords: ["broken", "break", "breakup", "shattered", "torn"], emoji: "💔" },
    { keywords: ["fix", "repair", "mend", "restore"], emoji: "🛠️" },
    { keywords: ["new", "fresh", "beginning", "original"], emoji: "🆕" },
    { keywords: ["old", "aged", "antique", "vintage"], emoji: "👴" },
    { keywords: ["forever", "eternal", "infinity", "endless"], emoji: "♾️" },
    { keywords: ["end", "finish", "final", "done", "close"], emoji: "🔚" },
    { keywords: ["goodbye", "bye", "farewell", "seeya", "parting"], emoji: "👋" },
    { keywords: ["hello", "hi", "greetings", "welcome", "hey"], emoji: "🙋♂️" },
    { keywords: ["begin", "starting", "initiate", "launch"], emoji: "🔜" },
    { keywords: ["faith", "believe", "religion", "prayer"], emoji: "🙏" },
    { keywords: ["trust", "reliance", "confidant", "bonded"], emoji: "🤝" },
    { keywords: ["secret", "hush", "quiet", "silence", "whisper"], emoji: "🤫" },
    { keywords: ["mystery", "detective", "sleuth", "clue"], emoji: "🕵️♂️" },
    { keywords: ["gold", "golden", "prize", "medal"], emoji: "🥇" },
    { keywords: ["silver", "runnerup", "medallist", "honor"], emoji: "🥈" },
    { keywords: ["bronze", "third", "merit"], emoji: "🥉" },
    { keywords: ["orange", "tangerine", "citrus", "fruit"], emoji: "🍊" },
    { keywords: ["blue", "azure", "navy", "indigo", "teal"], emoji: "🔷" },
    { keywords: ["green", "emerald", "leaf", "grass", "jade"], emoji: "🟢" },
    { keywords: ["red", "crimson", "scarlet", "cherry", "ruby"], emoji: "🔴" },
    { keywords: ["yellow", "goldy", "lemon", "canary", "honey"], emoji: "🟡" },
    { keywords: ["purple", "violet", "lavender", "plum"], emoji: "🟣" },
    { keywords: ["black", "ebony", "obsidian", "midnight"], emoji: "⚫️" },
    { keywords: ["white", "snowy", "ivory", "frost", "pearl"], emoji: "⚪️" },
    { keywords: ["pink", "blush", "fuchsia", "peach"], emoji: "💗" },
    { keywords: ["brown", "chocolate", "mocha", "hazel"], emoji: "🤎" },
    { keywords: ["coffee", "espresso", "latte", "mocha"], emoji: "☕" },
    { keywords: ["tea", "chai", "herbal"], emoji: "🍵" },
    { keywords: ["beer", "lager", "ale", "brew"], emoji: "🍻" },
    { keywords: ["rainbow", "colorful", "spectrum", "arc", "pride"], emoji: "🌈" },
    { keywords: ["wave", "surfing", "surf", "tide", "swell"], emoji: "🏄♂️" },
    { keywords: ["luck", "lucky", "fortune", "serendipity", "blessing"], emoji: "🍀" },
    { keywords: ["beautiful", "beauty", "gorgeous", "lovely", "stunning"], emoji: "😍" },
    { keywords: ["crazy", "zany", "insane", "goofy"], emoji: "🤪" }
];

export function pickEmojiForLyric(text: string): string {
    if (!text) return "🎶";
    const lower = text.toLowerCase();
    for (const mapping of emojiByLyricList) {
        for (const word of mapping.keywords) {
            if (lower.includes(word)) return mapping.emoji;
        }
    }
    return "🎶";
}

export class StatusChanger {
    public playbackState: PlaybackState
    public sentLines: LyricsLine[]
    public autooffset: Autooffset

    constructor(playbackState: PlaybackState) {
        this.playbackState = playbackState
        this.sentLines = []
        this.autooffset = new Autooffset()
    }

    public changeStatusRequest(text: string, token: string, emoji: string): Promise<Response> {
        const now = Date.now()
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
        })

        request.then(() => this.autooffset.addValue(Date.now() - now))
        return request
    }

    public changeStatus(): void {
        this.autooffset.setLimit(Settings.timings.autooffset)
        const playbackState = this.playbackState
        if (playbackState.ended || !playbackState.hasLyrics || !playbackState.isPlaying) return
        const lyrics = playbackState.lyrics
        if (!lyrics) return

        const currentLine = playbackState.currentLine
        const songProgress = playbackState.songProgress
        const lines = lyrics.lines
        const offset = Settings.timings.enableAutooffset ? this.autooffset.getAverageValue() + 100 : Settings.timings.sendTimeOffset

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const nextLine = lines[i + 1]
            if (line.time < (songProgress + offset)) {
                if (!line.text) continue
                if (nextLine && nextLine.time < (songProgress + offset)) continue
                if (this.sentLines.some((sentLine) => sentLine.time === line.time)) break
                if (line === currentLine) break

                playbackState.currentLine = line

                // CHANGED: Use dynamic emoji for status
                const emoji = pickEmojiForLyric(line.text);

                if (Settings.view.advanced.enabled) {
                    this.changeStatusRequest(
                        this.parseStatusString(Settings.view.advanced.customStatus),
                        Settings.credentials.token,
                        Settings.view.advanced.customEmoji
                    )
                } else {
                    this.changeStatusRequest(
                        this.getStatusString(line),
                        Settings.credentials.token,
                        emoji // <-- dynamic!
                    )
                }

                this.sentLines.push(line)
                break
            }
        }
    }

    public songChanged(): void {
        this.sentLines = []
    }

    public formatSeconds(s: number): string {
        return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s
    }

    public getStatusString(line: LyricsLine): string {
        return `${Settings.view.timestamp ? `[${this.formatSeconds(+(line.time / 1000).toFixed(0))}] ` : ""}${Settings.view.label ? "Song lyrics - " : ""}${line.text.replace("♪", "🎶")}`.slice(0, 128)
    }

    public parseStatusString(status: string): string {
        if (this.playbackState.currentLine) {
            const line = this.playbackState.currentLine
            const songName = this.playbackState.songName
            const songAuthor = this.playbackState.songAuthor

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
