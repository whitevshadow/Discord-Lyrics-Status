import { BaseSource, SongLyrics } from "./BaseSource"

interface LrcLibTrack {
    id: number
    name: string
    artistName: string
    albumName: string
    duration: number
    instrumental: boolean
    plainLyrics: string
    syncedLyrics: string
}

export class LrcLibSource extends BaseSource {
    public async getLyrics(name: string, artist: string): Promise<SongLyrics> {
        // Use search API as we don't have duration/album readily available in this interface
        const url = `https://lrclib.net/api/search?q=${encodeURIComponent(`${name} ${artist}`)}`

        const response = await fetch(url, {
            headers: {
                "User-Agent": "LyricsStatus v3 (https://github.com/OvalQuilter/lyrics-status)"
            }
        })

        const tracks = await response.json() as LrcLibTrack[]

        // Find the first track with synced lyrics
        const track = tracks.find(t => t.syncedLyrics)

        if (!track) throw "Lyrics not found"

        return this.parseLyrics(track.syncedLyrics)
    }

    public parseLyrics(lrc: string): SongLyrics {
        const result: SongLyrics = {
            lines: []
        }

        const lines = lrc.split("\n")

        // Regex for [mm:ss.xx] or [mm:ss.xxx]
        const timeRegex = /\[(\d+):(\d+)\.(\d+)\]/

        for (const line of lines) {
            const match = timeRegex.exec(line)
            if (!match) continue

            const minutes = parseInt(match[1])
            const seconds = parseInt(match[2])
            const hundredths = parseInt(match[3])

            // Normalize milliseconds (if 2 digits, it's 10ms units, if 3, it's 1ms)
            // Typically LrcLib returns .xx (hundredths) -> * 10
            // But let's handle the string length logic if needed or just assume typical LRC

            // Standard LRC is usually hundredths.
            // If the captured group 'hundredths' has 2 digits, it is 10ms. 3 digits = 1ms.
            let ms = hundredths
            if (match[3].length === 2) ms *= 10
            else if (match[3].length === 1) ms *= 100

            const time = (minutes * 60 * 1000) + (seconds * 1000) + ms
            const text = line.replace(timeRegex, "").trim()

            if (text) {
                result.lines.push({
                    time,
                    text
                })
            }
        }

        return result
    }

    public getAppName(): string {
        return "LrcLib"
    }
}
