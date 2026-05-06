"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const node_fs_1 = require("node:fs");
const Debug_1 = require("./Debug");
class Settings {
    static save() {
        (0, node_fs_1.writeFileSync)("./settings.json", JSON.stringify({
            credentials: this.credentials,
            view: this.view,
            timings: this.timings,
            update: this.update
        }));
    }
    static load() {
        let settings;
        try {
            settings = JSON.parse((0, node_fs_1.readFileSync)("./settings.json").toString());
        }
        catch (e) {
            Debug_1.Debug.write("An error occurred while trying to read settings from file. Using defaults. Error: " + e.stack);
        }
        if (settings) {
            this.credentials = Object.assign(Object.assign({}, this.credentials), (settings.credentials || {}));
            // Merge view recursively or explicitly
            const savedView = settings.view || {};
            this.view = Object.assign(Object.assign({}, this.view), savedView);
            // Ensure advanced object exists and is merged
            if (this.view.advanced === undefined) {
                this.view.advanced = {
                    enabled: false,
                    customEmoji: "🎶",
                    customStatus: "[{timestamp}] [{lyrics}]"
                };
            }
            else {
                this.view.advanced = Object.assign({ enabled: false, customEmoji: "🎶", customStatus: "[{timestamp}] [{lyrics}]" }, (savedView.advanced || {}));
            }
            this.timings = Object.assign(Object.assign({}, this.timings), (settings.timings || {}));
            this.update = Object.assign(Object.assign({}, this.update), (settings.update || {}));
        }
    }
}
exports.Settings = Settings;
Settings.credentials = {
    token: "",
    cookies: "",
    clientID: "",
    clientSecret: "",
    useExternalAuthServer: "",
    code: "",
    refreshToken: "",
    uuid: "",
    customRedirectUri: ""
};
Settings.view = {
    timestamp: true,
    label: true,
    advanced: {
        enabled: false,
        customEmoji: "🎶",
        customStatus: "[{timestamp}] [{lyrics}]"
    }
};
Settings.timings = {
    sendTimeOffset: 500,
    enableAutooffset: true,
    autooffset: 3
};
Settings.update = {
    enableAutoupdate: true
};
