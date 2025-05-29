'use strict';

const { Driver } = require('homey');

class MyDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    // Custom Flow triggers
    this._turn_on_left_trigger = this.homey.flow.getDeviceTriggerCard("turn_on_left");
    this._turn_on_right_trigger = this.homey.flow.getDeviceTriggerCard("turn_on_right");
    this._turn_off_left_trigger = this.homey.flow.getDeviceTriggerCard("turn_off_left");
    this._turn_off_right_trigger = this.homey.flow.getDeviceTriggerCard("turn_off_right");
    
    // Custom Flow actions
    this._turn_on_left_action = this.homey.flow.getActionCard("turn_on_left");
    this._turn_on_right_action = this.homey.flow.getActionCard("turn_on_right");
    this._turn_off_left_action = this.homey.flow.getActionCard("turn_off_left");
    this._turn_off_right_action = this.homey.flow.getActionCard("turn_off_right");
  }

  triggerTurnOnLeftSwitch(device){
    this._turn_on_left_trigger.trigger(device).catch(this.error)
  }

  triggerTurnOnRightSwitch(device){
    this._turn_on_right_trigger.trigger(device).catch(this.error)
  }

  triggerTurnOffLeftSwitch(device){
    this._turn_off_left_trigger.trigger(device).catch(this.error)
  }

  triggerTurnOffRightSwitch(device){
    this._turn_off_right_trigger.trigger(device).catch(this.error)
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

}

module.exports = MyDriver;
