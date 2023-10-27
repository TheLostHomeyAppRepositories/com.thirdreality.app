'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER } = require("zigbee-clusters");

class Motion extends ZigBeeDevice {

  /**
   * onInit is called when the device is initialized.
   */
  async onNodeInit({ zclNode }) {
    this.registerCapability("measure_battery", CLUSTER.POWER_CONFIGURATION);
    this.registerCapability("alarm_motion", CLUSTER.IAS_ZONE);
    this.printNode();
    // if (this.isFirstInit()) {
    //   await this.configureAttributeReporting([
    //     {
    //       endpointId: 1,
    //       cluster: CLUSTER.POWER_CONFIGURATION,
    //       attributeName: 'batteryPercentageRemaining',
    //       minInterval:0,
    //       maxInterval:65535,
    //       minChange:0
    //     },
    //     {
    //       endpointId: 1,
    //       cluster: CLUSTER.IAS_ZONE,
    //       attributeName: 'zoneStatus',
    //       minInterval:0,
    //       maxInterval:65535,
    //       minChange:0
    //     }
    //   ]).catch(this.error);
    // }


    // alarm_motion
    zclNode.endpoints[1].clusters[CLUSTER.IAS_ZONE.NAME].onZoneStatusChangeNotification = payload => {
      this.onIASZoneStatusChangeNotification(payload);
    }

    // measure_battery
    zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME]
      .on('attr.batteryPercentageRemaining', this.onBatteryPercentageRemainingAttributeReport.bind(this));
  }


  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
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
    this.log('MyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('MyDevice was renamed');
  }


  onIASZoneStatusChangeNotification({zoneStatus, extendedStatus, zoneId, delay,}) {
		this.log('IASZoneStatusChangeNotification received:', zoneStatus, extendedStatus, zoneId, delay);
		this.setCapabilityValue('alarm_motion', zoneStatus.alarm1).catch(this.error);
	}

  onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining) {
    const batteryThreshold = this.getSetting('batteryThreshold') || 20;
    this.log("measure_battery | powerConfiguration - batteryPercentageRemaining (%): ", batteryPercentageRemaining / 2);
    this.setCapabilityValue('measure_battery', batteryPercentageRemaining / 2).catch(this.error);
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

}

module.exports = Motion;
