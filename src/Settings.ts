import { readFileSync, writeFileSync } from "node:fs"
import { Debug } from "./Debug"

export class Settings {
    public static credentials = {
        token: "",
        cookies: "",
        clientID: "",
        clientSecret: "",
        useExternalAuthServer: "",
        code: "",
        refreshToken: "",
        uuid: "",
        customRedirectUri: ""
    }

    public static view = {
        timestamp: true,
        label: true,
        advanced: {
            enabled: false,
            customEmoji: "🎶",
            customStatus: "[{timestamp}] [{lyrics}]"
        }
    }

    public static timings = {
        sendTimeOffset: 500,
        enableAutooffset: true,
        autooffset: 3
    }

    public static update = {
        enableAutoupdate: true
    }

    public static save(): void {
        writeFileSync("./settings.json", JSON.stringify({
            credentials: this.credentials,
            view: this.view,
            timings: this.timings,
            update: this.update
        }))
    }

    public static load(): void {
        let settings

        try {
            settings = JSON.parse(readFileSync("./settings.json").toString())
        } catch (e) {
            Debug.write("An error occurred while trying to read settings from file. Using defaults. Error: " + (e as Error).stack)
        }

        if (settings) {
            this.credentials = { ...this.credentials, ...(settings.credentials || {}) }

            // Merge view recursively or explicitly
            const savedView = settings.view || {}
            this.view = { ...this.view, ...savedView }
            // Ensure advanced object exists and is merged
            if (this.view.advanced === undefined) {
                this.view.advanced = {
                    enabled: false,
                    customEmoji: "🎶",
                    customStatus: "[{timestamp}] [{lyrics}]"
                }
            } else {
                this.view.advanced = {
                    enabled: false,
                    customEmoji: "🎶",
                    customStatus: "[{timestamp}] [{lyrics}]",
                    ...(savedView.advanced || {})
                }
            }

            this.timings = { ...this.timings, ...(settings.timings || {}) }
            this.update = { ...this.update, ...(settings.update || {}) }
        }
    }
}
