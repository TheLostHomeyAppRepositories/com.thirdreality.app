'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER } = require("zigbee-clusters");

class waterKit extends ZigBeeDevice {
  async onNodeInit({ zclNode }) {
    await this.registerCapability("onoff", CLUSTER.ON_OFF);

    const device_ieee = this.getSettings()["zb_ieee_address"]
    const modeNum = this.getSettings()["zb_product_id"]

    zclNode.endpoints[1].clusters["powerConfiguration"]
      .on('attr.batteryPercentageRemaining', (batteryPercentageRemaining) => { this.onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining) });
  }

  onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining) {
    const batteryThreshold = this.getSetting('batteryThreshold') || 20;
    this.log("measure_battery | powerConfiguration - batteryPercentageRemaining (%): ", batteryPercentageRemaining / 2);
    this.setCapabilityValue('measure_battery', batteryPercentageRemaining / 2).catch(this.error);
  }

  /**
 * onAdded is called when the user adds the device, called just after pairing.
 */
  async onAdded() {
    this.log('Soil Moisture Sensor has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('Soil Moisture Sensor settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('Soil Moisture Sensor was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('Soil Moisture Sensor has been deleted');
  }
}

module.exports = waterKit;
