# MMM-DanfossAlly
A MagicMirror² module that displays your Danfoss Ally thermostat data.

## Installation


```bash
cd ~/MagicMirror/modules
git clone https://github.com/hannic/MMM-DanfossAlly
cd MMM-MyCustomModule
npm install
```



## Configuration
Add the module to the modules array in your `config/config.js` file:

    {
        module: "MMM-DanfossAlly",
        position: "top_right",
        config: {
            apiKey: "YOUR_DANFOSS_CONSUMER_KEY",
            apiSecret: "YOUR_DANFOSS_CONSUMER_SECRET",
            updateInterval: 300000 // 5 minutes
        }
    },


# Danfoss Ally

- https://developer.danfoss.com/user/5905/apps/magicmirror/analytics