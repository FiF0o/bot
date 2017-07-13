# bot
This project uses the Slack API (Events API) to offer a bot that performs a sentiment analysis.
OAuth route (`/oauth`) has been implemented to share the app.


## Setup
Instructions tp set up the bot (Slack API) are available in the `./app.js` file.
Replace `BOT_NAME` with the name of your bot (`req.body.event.username`).


## Deploy
The bot is deployed using Heroku.
To deploy your own:
- `heroku create`, `git push heroku master` and `heroku open`
- don't forget to update your environment variables `.env` and add them to your heroku app (terminal or Settings > Config Variables)
- change the appropriate `redirect_url`, `url_request` in your Slack app with the ones from your heroku app


## Pi
### Headless

#### 1- Burn OS in your raspeberry pi SD card
- download your [OS](https://www.raspberrypi.org/downloads/)
- burn/flash your OS on the pi SD card using [etcher](https://etcher.io/)
- put the SD card back in your device and switch it on

#### 2- SSH configuration
- add a `ssh` file in your bot
- add a `wpa_supplicant.conf` file
- you wpa file must have your network keys, see example below
- you should be ready to ssh your device: `ssh pi@raspeberrypi.local` - default password will be `raspberry`
- additional settings for your raspberry pi can now be done: `sudo raspi-config`
- don't forget to change your raspberrypi password once connected to the network
```
// wpa_supplicant.conf file example

country=GB
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="yournetworkname"
    psk="yournetworkpassword"
    id_str="nameitwhatyouwant"
}
```
##### useful commands
- list networks: `/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport /usr/sbin/airport -s`
- list devices on the network: `arp -al`
