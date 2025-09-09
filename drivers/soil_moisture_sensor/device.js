'use strict';



const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER, Cluster } = require("zigbee-clusters");

const privateMoistureHumidityCluster = require("../../lib/privateMoistureHumidityCluster")

Cluster.addCluster(privateMoistureHumidityCluster)

class soilMoistureSensor extends ZigBeeDevice {

  /**
   * onInit is called when the device is initialized.
   */
  device_version = null
  zclNode = null

  async onNodeInit({ zclNode }) {


    this.log('Soil Moisture Sensor has been initialized');
    this.zclNode = zclNode
    this.device_version = await zclNode.endpoints[1].clusters.basic.readAttributes(['appVersion']).catch(error => { this.error(error) })
    await this.registerCapability("measure_battery", CLUSTER.POWER_CONFIGURATION);

    this.zclNode.endpoints[1].clusters[CLUSTER.TEMPERATURE_MEASUREMENT.NAME]
      .on('attr.measuredValue', this.onTemperatureMeasuredAttributeReport.bind(this));

    // measure_battery // alarm_battery
    this.zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME]
      .on('attr.batteryPercentageRemaining', this.onBatteryPercentageRemainingAttributeReport.bind(this));

    this.zclNode.endpoints[1].clusters[CLUSTER.RELATIVE_HUMIDITY_MEASUREMENT.NAME].on('attr.measuredValue', this.onRelativeHumidityMeasuredAttributeReport.bind(this));


  }

  onTemperatureMeasuredAttributeReport(measuredValue) {
    const temperatureOffset = this.getSetting('temperature_offset') || 0;
    const parsedValue = this.getSetting('temperature_decimals') === '2' ? Math.round((measuredValue / 100) * 100) / 100 : Math.round((measuredValue / 100) * 10) / 10;
    this.log('measure_temperature | temperatureMeasurement - measuredValue (temperature):', parsedValue, '+ temperature offset', temperatureOffset);
    this.setCapabilityValue('measure_temperature', parsedValue + temperatureOffset).catch(this.error);
  }

  onRelativeHumidityMeasuredAttributeReport(measuredValue) {
    const humidityOffset = this.getSetting('humidity_offset') || 0;
    const parsedValue = this.getSetting('humidity_decimals') === '2' ? Math.round((measuredValue / 100) * 100) / 100 : Math.round((measuredValue / 100) * 10) / 10;
    this.log('relativeHumidity:', parsedValue, '+ humidity offset', humidityOffset);
    this.setCapabilityValue('measure_humidity', parsedValue + humidityOffset).catch(this.error);
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

  async setTemperaturAndHumidityConfigReport(oldSettings, newSettings, changedKeys) {
    this.log(`changedKeys: ${changedKeys}`)
    let temperature_report_min_interval_value
    let temperature_report_max_interval_value
    let temperature_report_change_value
    let humidity_report_min_interval_value
    let humidity_report_max_interval_value
    let humidity_report_change_value

    temperature_report_min_interval_value = changedKeys.includes('temperature_report_min_interval') ? newSettings['temperature_report_min_interval'] : oldSettings['temperature_report_min_interval']
    temperature_report_max_interval_value = changedKeys.includes('temperature_report_max_interval') ? newSettings['temperature_report_max_interval'] : oldSettings['temperature_report_max_interval']
    temperature_report_change_value = changedKeys.includes('temperature_report_change') ? newSettings['temperature_report_change'] : oldSettings['temperature_report_change']
    humidity_report_min_interval_value = changedKeys.includes('humidity_report_min_interval') ? newSettings['humidity_report_min_interval'] : oldSettings['humidity_report_min_interval']
    humidity_report_max_interval_value = changedKeys.includes('humidity_report_max_interval') ? newSettings['humidity_report_max_interval'] : oldSettings['humidity_report_max_interval']
    humidity_report_change_value = changedKeys.includes('humidity_report_change') ? newSettings['humidity_report_change'] : oldSettings['humidity_report_change']

    this.log(`temperature_report_min_interval_value: ${temperature_report_min_interval_value}`)
    this.log(`temperature_report_max_interval_value: ${temperature_report_max_interval_value}`)
    this.log(`temperature_report_change_value: ${temperature_report_change_value}`)
    this.log(`humidity_report_min_interval_value: ${humidity_report_min_interval_value}`)
    this.log(`humidity_report_max_interval_value: ${humidity_report_max_interval_value}`)
    this.log(`humidity_report_change_value: ${humidity_report_change_value}`)

    if (temperature_report_min_interval_value > temperature_report_max_interval_value || humidity_report_min_interval_value > humidity_report_max_interval_value) {
      throw new Error("The minimum interval must be smaller than the maximum interval")
    }

    if (changedKeys.includes("temperature_report_min_interval") || changedKeys.includes("temperature_report_max_interval") || changedKeys.includes("temperature_report_change")) {
      await this.zclNode.endpoints[1].clusters['temperatureMeasurement'].configureReporting({
        measuredValue: {
          minInterval: temperature_report_min_interval_value,
          maxInterval: temperature_report_max_interval_value,
          minChange: temperature_report_change_value
        }

      }).catch(error => { this.log(error) })
    }

    if (changedKeys.includes("humidity_report_min_interval") || changedKeys.includes("humidity_report_max_interval") || changedKeys.includes("humidity_report_change")) {

      await this.zclNode.endpoints[1].clusters['relativeHumidity'].configureReporting({
        measuredValue: {
          minInterval: humidity_report_min_interval_value,
          maxInterval: humidity_report_max_interval_value,
          minChange: humidity_report_change_value
        }
      }).catch(error => { this.log(error) })

    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    await this.setTemperaturAndHumidityConfigReport(oldSettings, newSettings, changedKeys)
    this.log('Soil moisture sensor settings where changed');
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

module.exports = soilMoistureSensor;
