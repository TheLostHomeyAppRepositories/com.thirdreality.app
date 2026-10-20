'use strict';

const { Driver } = require('homey');

class MyDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this._triggerTurnOnLeft = this.homey.flow.getDeviceTriggerCard('turn_on_left');
    this._triggerTurnOffLeft = this.homey.flow.getDeviceTriggerCard('turn_off_left');
    this._triggerTurnOnRight = this.homey.flow.getDeviceTriggerCard('turn_on_right');
    this._triggerTurnOffRight = this.homey.flow.getDeviceTriggerCard('turn_off_right');

    this.registerConditionListeners();
    this.registerActionListeners();
  }

  registerConditionListeners() {
    this.homey.flow.getConditionCard('is_turned_on_left')
      .registerRunListener(async (args) => args.device.getCapabilityValue('onoff.1') === true);

    this.homey.flow.getConditionCard('is_turned_off_left')
      .registerRunListener(async (args) => args.device.getCapabilityValue('onoff.1') === false);

    this.homey.flow.getConditionCard('is_turned_on_right')
      .registerRunListener(async (args) => args.device.getCapabilityValue('onoff.2') === true);

    this.homey.flow.getConditionCard('is_turned_off_right')
      .registerRunListener(async (args) => args.device.getCapabilityValue('onoff.2') === false);

    this.homey.flow.getConditionCard('current_greater_than_left')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_current.1') > args.value);

    this.homey.flow.getConditionCard('current_less_than_left')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_current.1') < args.value);

    this.homey.flow.getConditionCard('current_greater_than_right')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_current.2') > args.value);

    this.homey.flow.getConditionCard('current_less_than_right')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_current.2') < args.value);

    this.homey.flow.getConditionCard('voltage_greater_than_left')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_voltage.1') > args.value);

    this.homey.flow.getConditionCard('voltage_less_than_left')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_voltage.1') < args.value);

    this.homey.flow.getConditionCard('voltage_greater_than_right')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_voltage.2') > args.value);

    this.homey.flow.getConditionCard('voltage_less_than_right')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_voltage.2') < args.value);

    this.homey.flow.getConditionCard('power_greater_than_left')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_power.1') > args.value);

    this.homey.flow.getConditionCard('power_less_than_left')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_power.1') < args.value);

    this.homey.flow.getConditionCard('power_greater_than_right')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_power.2') > args.value);

    this.homey.flow.getConditionCard('power_less_than_right')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_power.2') < args.value);

    this.homey.flow.getConditionCard('energy_greater_than_left')
      .registerRunListener(async (args) => args.device.getCapabilityValue('meter_power.1') > args.value);

    this.homey.flow.getConditionCard('energy_less_than_left')
      .registerRunListener(async (args) => args.device.getCapabilityValue('meter_power.1') < args.value);

    this.homey.flow.getConditionCard('energy_greater_than_right')
      .registerRunListener(async (args) => args.device.getCapabilityValue('meter_power.2') > args.value);

    this.homey.flow.getConditionCard('energy_less_than_right')
      .registerRunListener(async (args) => args.device.getCapabilityValue('meter_power.2') < args.value);
  }

  registerActionListeners() {
    this.homey.flow.getActionCard('turn_on_left')
      .registerRunListener(async (args) => {
        await args.device.triggerCapabilityListener('onoff.1', true);
      });

    this.homey.flow.getActionCard('turn_off_left')
      .registerRunListener(async (args) => {
        await args.device.triggerCapabilityListener('onoff.1', false);
      });

    this.homey.flow.getActionCard('turn_on_right')
      .registerRunListener(async (args) => {
        await args.device.triggerCapabilityListener('onoff.2', true);
      });

    this.homey.flow.getActionCard('turn_off_right')
      .registerRunListener(async (args) => {
        await args.device.triggerCapabilityListener('onoff.2', false);
      });
  }

  triggerTurnOnLeft(device) {
    this._triggerTurnOnLeft.trigger(device).catch((err) => this.error(err));
  }

  triggerTurnOffLeft(device) {
    this._triggerTurnOffLeft.trigger(device).catch((err) => this.error(err));
  }

  triggerTurnOnRight(device) {
    this._triggerTurnOnRight.trigger(device).catch((err) => this.error(err));
  }

  triggerTurnOffRight(device) {
    this._triggerTurnOffRight.trigger(device).catch((err) => this.error(err));
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
