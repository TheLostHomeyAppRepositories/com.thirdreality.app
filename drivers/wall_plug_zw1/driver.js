'use strict';

const { Driver } = require('homey');

class MyDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this._triggerTurnOnBottom = this.homey.flow.getDeviceTriggerCard('wall_zw1_turn_on_bottom');
    this._triggerTurnOffBottom = this.homey.flow.getDeviceTriggerCard('wall_zw1_turn_off_bottom');
    this._triggerTurnOnTop = this.homey.flow.getDeviceTriggerCard('wall_zw1_turn_on_top');
    this._triggerTurnOffTop = this.homey.flow.getDeviceTriggerCard('wall_zw1_turn_off_top');

    this.registerConditionListeners();
    this.registerActionListeners();
  }

  registerConditionListeners() {
    this.homey.flow.getConditionCard('wall_zw1_is_turned_on_bottom')
      .registerRunListener(async (args) => args.device.getCapabilityValue('onoff.1') === true);

    this.homey.flow.getConditionCard('wall_zw1_is_turned_off_bottom')
      .registerRunListener(async (args) => args.device.getCapabilityValue('onoff.1') === false);

    this.homey.flow.getConditionCard('wall_zw1_is_turned_on_top')
      .registerRunListener(async (args) => args.device.getCapabilityValue('onoff.2') === true);

    this.homey.flow.getConditionCard('wall_zw1_is_turned_off_top')
      .registerRunListener(async (args) => args.device.getCapabilityValue('onoff.2') === false);

    this.homey.flow.getConditionCard('wall_zw1_current_greater_than_bottom')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_current.1') > args.value);

    this.homey.flow.getConditionCard('wall_zw1_current_less_than_bottom')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_current.1') < args.value);

    this.homey.flow.getConditionCard('wall_zw1_current_greater_than_top')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_current.2') > args.value);

    this.homey.flow.getConditionCard('wall_zw1_current_less_than_top')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_current.2') < args.value);

    this.homey.flow.getConditionCard('wall_zw1_voltage_greater_than_bottom')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_voltage.1') > args.value);

    this.homey.flow.getConditionCard('wall_zw1_voltage_less_than_bottom')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_voltage.1') < args.value);

    this.homey.flow.getConditionCard('wall_zw1_voltage_greater_than_top')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_voltage.2') > args.value);

    this.homey.flow.getConditionCard('wall_zw1_voltage_less_than_top')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_voltage.2') < args.value);

    this.homey.flow.getConditionCard('wall_zw1_power_greater_than_bottom')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_power.1') > args.value);

    this.homey.flow.getConditionCard('wall_zw1_power_less_than_bottom')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_power.1') < args.value);

    this.homey.flow.getConditionCard('wall_zw1_power_greater_than_top')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_power.2') > args.value);

    this.homey.flow.getConditionCard('wall_zw1_power_less_than_top')
      .registerRunListener(async (args) => args.device.getCapabilityValue('measure_power.2') < args.value);

    this.homey.flow.getConditionCard('wall_zw1_energy_greater_than_bottom')
      .registerRunListener(async (args) => args.device.getCapabilityValue('meter_power.1') > args.value);

    this.homey.flow.getConditionCard('wall_zw1_energy_less_than_bottom')
      .registerRunListener(async (args) => args.device.getCapabilityValue('meter_power.1') < args.value);

    this.homey.flow.getConditionCard('wall_zw1_energy_greater_than_top')
      .registerRunListener(async (args) => args.device.getCapabilityValue('meter_power.2') > args.value);

    this.homey.flow.getConditionCard('wall_zw1_energy_less_than_top')
      .registerRunListener(async (args) => args.device.getCapabilityValue('meter_power.2') < args.value);
  }

  registerActionListeners() {
    this.homey.flow.getActionCard('wall_zw1_turn_on_bottom')
      .registerRunListener(async (args) => {
        await args.device.triggerCapabilityListener('onoff.1', true);
      });

    this.homey.flow.getActionCard('wall_zw1_turn_off_bottom')
      .registerRunListener(async (args) => {
        await args.device.triggerCapabilityListener('onoff.1', false);
      });

    this.homey.flow.getActionCard('wall_zw1_turn_on_top')
      .registerRunListener(async (args) => {
        await args.device.triggerCapabilityListener('onoff.2', true);
      });

    this.homey.flow.getActionCard('wall_zw1_turn_off_top')
      .registerRunListener(async (args) => {
        await args.device.triggerCapabilityListener('onoff.2', false);
      });
  }

  triggerTurnOnBottomSwitch(device) {
    this._triggerTurnOnBottom.trigger(device).catch((err) => this.error(err));
  }

  triggerTurnOffBottomSwitch(device) {
    this._triggerTurnOffBottom.trigger(device).catch((err) => this.error(err));
  }

  triggerTurnOnTopSwitch(device) {
    this._triggerTurnOnTop.trigger(device).catch((err) => this.error(err));
  }

  triggerTurnOffTopSwitch(device) {
    this._triggerTurnOffTop.trigger(device).catch((err) => this.error(err));
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
