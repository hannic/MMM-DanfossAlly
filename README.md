# MMM-DanfossAlly
A MagicMirror² module that displays your Danfoss Ally thermostat data.

## Preparation Danfoss Ally App

You will need: 
- YOUR_DANFOSS_CONSUMER_KEY 
- YOUR_DANFOSS_CONSUMER_SECRET

1. Go to https://developer.danfoss.com and create a login with the same email address as you use as Administrator. 
2. Under [Your Name] > Apps: Create an App, e.g. "My MagicMirror Danfoss App" 
3. You will need the consumer key and the consumer secret for the module


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

![MMM-DanfossAlly](MMM-DanfossAlly_Screeenshot.jpeg)



