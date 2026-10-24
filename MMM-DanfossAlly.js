Module.register("MMM-DanfossAlly", {
    defaults: {
        updateInterval: 5 * 60 * 1000, // 5 minutes
        animationSpeed: 1000,
        apiKey: "",
        apiSecret: "",
    },

    getStyles: function() {
        return ["MMM-DanfossAlly.css", "font-awesome.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);
        this.devices = [];
        this.loaded = false;
        this.sendSocketNotification("CONFIG", this.config);
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "danfoss-ally-wrapper";

        if (!this.loaded) {
            wrapper.innerHTML = "Loading Danfoss Ally data...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if (this.devices.length === 0) {
            wrapper.innerHTML = "No devices found.";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        const table = document.createElement("table");
        table.className = "small";

        this.devices.forEach(device => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.className = "title bright";
            nameCell.innerHTML = device.name || "Thermostat";
            row.appendChild(nameCell);

            const tempCell = document.createElement("td");
            tempCell.className = "value bright text-right";
            tempCell.innerHTML = `<i class="fa fa-thermometer-half"></i> ${device.currentTemperature}°C`;
            row.appendChild(tempCell);

            const targetCell = document.createElement("td");
            targetCell.className = "value dimmed text-right";
            targetCell.innerHTML = `<i class="fa fa-bullseye"></i> ${device.targetTemperature}°C`;
            row.appendChild(targetCell);

            if (typeof device.battery !== 'undefined') {
                const batteryCell = document.createElement("td");
                batteryCell.className = "value dimmed text-right";
                batteryCell.innerHTML = `<i class="fa fa-battery-three-quarters"></i> ${device.battery}%`;
                row.appendChild(batteryCell);
            }

            table.appendChild(row);
        });

        wrapper.appendChild(table);
        return wrapper;
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "DATA") {
            this.devices = payload;
            this.loaded = true;
            this.updateDom(this.config.animationSpeed);
        }
    }
});