const NodeHelper = require("node_helper");
const fetch = require("node-fetch");

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: " + this.name);
        this.config = null;
        this.token = null;
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "CONFIG") {
            this.config = payload;
            this.scheduleUpdate();
        }
    },

    scheduleUpdate: function() {
        this.getData();
        setInterval(() => { this.getData(); }, this.config.updateInterval);
    },

    async getData() {
        if (!this.config.apiKey || !this.config.apiSecret) {
            console.error("MMM-DanfossAlly: API Credentials missing in config.js");
            return;
        }

        try {
            // 1. OAuth2 Token holen
            if (!this.token) {
                const authHeader = Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString("base64");
                
                // Verwendung von URLSearchParams für eine standardkonforme Formatierung
                const params = new URLSearchParams();
                params.append("grant_type", "client_credentials");

                console.log("MMM-DanfossAlly: Sende Token-Request an Danfoss...");

                const tokenResponse = await fetch("https://api.danfoss.com/oauth2/token", {
                    method: "POST",
                    headers: {
                        "Authorization": `Basic ${authHeader}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json",
                        "User-Agent": "MagicMirror/MMM-DanfossAlly"
                    },
                    body: params.toString()
                });

                const contentType = tokenResponse.headers.get("content-type");
                
                // Detailliertes Debugging bei Fehlern
                if (!contentType || !contentType.includes("application/json")) {
                    const errorText = await tokenResponse.text();
                    console.error(`\n[MMM-DanfossAlly DEBUG]`);
                    console.error(`HTTP-Statuscode: ${tokenResponse.status}`);
                    console.error(`Content-Type erhalten: ${contentType}`);
                    console.error(`Antwort-Inhalt (erste 300 Zeichen): ${errorText.substring(0, 300).replace(/\r?\n|\r/g, " ")}`);
                    console.error(`HINWEIS: Wenn hier Status 200/404 mit HTML steht, blockiert das Danfoss Gateway deine API-Keys (apiKey/apiSecret). Bitte überprüfe sie in der config.js.\n`);
                    return;
                }

                const tokenData = await tokenResponse.json();
                if (tokenData.error) {
                    console.error("MMM-DanfossAlly: OAuth2-Fehler vom Server:", tokenData.error_description || tokenData.error);
                    return;
                }

                this.token = tokenData.access_token;
                console.log("MMM-DanfossAlly: Authentifizierung erfolgreich. Token erhalten.");
            }

            // 2. Geräte abrufen
            const response = await fetch("https://api.danfoss.com/ally/devices", {
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Accept": "application/json",
                    "User-Agent": "MagicMirror/MMM-DanfossAlly"
                }
            });

            if (response.status === 401) {
                console.warn("MMM-DanfossAlly: Token abgelaufen, wird zurückgesetzt.");
                this.token = null; 
                return;
            }

            const responseContentType = response.headers.get("content-type");
            if (!responseContentType || !responseContentType.includes("application/json")) {
                console.error(`MMM-DanfossAlly: Geräte-Pfad lieferte kein JSON (Status ${response.status}).`);
                return;
            }

            const data = await response.json();
            
            const rawDevices = data.result || [];

            // Nur echte Thermostate verarbeiten, Gateways herausfiltern
            const devices = rawDevices
                .filter(d => d.device_type && d.device_type.includes("Thermostat"))
                .map(d => {
                    // Hilfsfunktion um Werte aus dem status-Array anhand des 'code' zu extrahieren
                    const findStatusValue = (code) => {
                        const item = d.status.find(s => s.code === code);
                        return item ? item.value : undefined;
                    };

                    const rawCurrent = findStatusValue("temp_current") || 0;
                    const rawTarget = findStatusValue("temp_set") || 0;

                    return {
                        name: d.name || "Thermostat",
                        currentTemperature: (rawCurrent / 10).toFixed(1), // 258 -> 25.8
                        targetTemperature: (rawTarget / 10).toFixed(1),   // 220 -> 22.0
                        battery: findStatusValue("battery_percentage")
                    };
                });
/*
            // DIAGNOSE-LOGS: Zeigt die Struktur im Terminal an
            console.log("=========================================");
            console.log("MMM-DanfossAlly - Rohe Keys vom Server:", Object.keys(data));
            console.log("MMM-DanfossAlly - Komplette Antwort:", JSON.stringify(data));
            console.log("=========================================");

            // Flexible Erkennung verschiedener API-Strukturen
            let rawDevices = [];
            if (Array.isArray(data)) {
                rawDevices = data;
            } else if (data.devices && Array.isArray(data.devices)) {
                rawDevices = data.devices;
            } else if (data.result && Array.isArray(data.result)) {
                rawDevices = data.result;
            }

            const devices = rawDevices.map(d => ({
                name: d.name || "Thermostat",
                currentTemperature: d.status?.temperature || d.status?.setpoint || 0,
                targetTemperature: d.settings?.setpoint || 0,
                battery: d.status?.battery
            }));
*/
            console.log(`MMM-DanfossAlly: ${devices.length} Geräte erfolgreich verarbeitet.`);
            this.sendSocketNotification("DATA", devices);
        } catch (error) {
            console.error("MMM-DanfossAlly: API Error im Hauptprozess", error);
        }
    }
});
