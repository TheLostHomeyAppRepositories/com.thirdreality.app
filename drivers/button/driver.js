'use strict';


const { Driver } = require('homey');
const buttonDevice = require("./device.js")

class MyDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this._singlePress = this.homey.flow.getDeviceTriggerCard("button_press_single");
    this._doublepress = this.homey.flow.getDeviceTriggerCard("button_press_double");
    this._longpress = this.homey.flow.getDeviceTriggerCard("button_press_Long");
    this._release = this.homey.flow.getDeviceTriggerCard("button_release");

  }

  triggerButtonSinglePress(device){
    this._singlePress.trigger(device).then(this.log).catch(this.error)
  }

  triggerButtonDoublePress(device){
    this._doublepress.trigger(device).then(this.log).catch(this.error)
  }

  triggerButtonLongPress(device){
    this._longpress.trigger(device).then(this.log).catch(this.error)
  }

  triggerButtonRelease(device){
    this._release.trigger(device).then(this.log).catch(this.error)
  }
  


  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      // Example device data, note that `store` is optional
      // {
      //   name: 'My Device',
      //   data: {
      //     id: 'my-device',
      //   },
      //   store: {
      //     address: '127.0.0.1',
      //   },
      // },
    ];
  }

  mapDeviceClass() {
    return buttonDevice;
  }
}

module.exports = MyDriver;
