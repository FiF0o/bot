# bot


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
