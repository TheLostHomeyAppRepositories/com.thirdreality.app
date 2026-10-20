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
  temperaturePollIntervalId = null
  humidityPollIntervalId = null

  async onNodeInit({ zclNode }) {
    try {
      this.log('Soil Moisture Sensor has been initialized');
      this.zclNode = zclNode

      if (this.hasCapability("measure_humidity") || !this.hasCapability("measure_moisture")) {
        this.removeCapability("measure_humidity")
        this.addCapability("measure_moisture")
      }
      this.device_version = await zclNode.endpoints[1].clusters.basic.readAttributes(['appVersion']).catch(error => { this.error(error) })
      await this.registerCapability("measure_battery", CLUSTER.POWER_CONFIGURATION);

      // measure_battery // alarm_battery
      this.zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME]
        .on('attr.batteryPercentageRemaining', this.onBatteryPercentageRemainingAttributeReport.bind(this));

      // Zigbee 认证要求：温湿度不再使用主动上报(report)，改为由 HUB 定时主动 read
      // 老版本可能已经给设备写入过上报配置，升级后需要主动关闭，避免设备仍在主动上报
      await this.disableLegacyReporting()
      this.startTemperaturePolling()
      this.startHumidityPolling()

    } catch (err) {
      this.log(err)
    }

  }

  // 关闭设备端残留的温湿度上报配置（例如从老版本 app 升级而来的设备），
  // 确保设备不再主动上报，统一由 HUB 轮询 read。
  async disableLegacyReporting() {
    await this.zclNode.endpoints[1].clusters[CLUSTER.TEMPERATURE_MEASUREMENT.NAME].configureReporting({
      measuredValue: {
        minInterval: 0xFFFF,
        maxInterval: 0xFFFF,
        // measuredValue 是有符号 int16（-32768~32767），不能用 0xFFFF
        minChange: 0x7FFF
      }
    }).catch(error => { this.error(error) })

    await this.zclNode.endpoints[1].clusters['privateMoistureHumidity'].configureReporting({
      measuredValue: {
        minInterval: 0xFFFF,
        maxInterval: 0xFFFF,
        minChange: 0xFFFF
      }
    }).catch(error => { this.error(error) })
  }

  startTemperaturePolling(pollIntervalSeconds) {
    if (this.temperaturePollIntervalId) {
      this.homey.clearInterval(this.temperaturePollIntervalId)
    }

    pollIntervalSeconds = pollIntervalSeconds || this.getSetting('temperature_poll_interval') || 300
    this.temperaturePollIntervalId = this.homey.setInterval(() => {
      this.pollTemperature()
    }, pollIntervalSeconds * 1000)

    // 立即读取一次，避免等待第一个轮询周期
    this.pollTemperature()
  }

  startHumidityPolling(pollIntervalSeconds) {
    if (this.humidityPollIntervalId) {
      this.homey.clearInterval(this.humidityPollIntervalId)
    }

    pollIntervalSeconds = pollIntervalSeconds || this.getSetting('humidity_poll_interval') || 300
    this.humidityPollIntervalId = this.homey.setInterval(() => {
      this.pollHumidity()
    }, pollIntervalSeconds * 1000)

    // 立即读取一次，避免等待第一个轮询周期
    this.pollHumidity()
  }

  async pollTemperature() {
    const temperatureAttributes = await this.zclNode.endpoints[1].clusters[CLUSTER.TEMPERATURE_MEASUREMENT.NAME]
      .readAttributes(['measuredValue']).catch(error => { this.error(error) })
    if (temperatureAttributes) {
      this.onTemperatureMeasuredAttributeReport(temperatureAttributes.measuredValue)
    }
  }

  async pollHumidity() {
    const humidityAttributes = await this.zclNode.endpoints[1].clusters['privateMoistureHumidity']
      .readAttributes(['measuredValue']).catch(error => { this.error(error) })
    if (humidityAttributes) {
      this.onMoistureHumidityMeasuredAttributeReport(humidityAttributes.measuredValue)
    }
  }

  onTemperatureMeasuredAttributeReport(measuredValue) {
    const temperatureOffset = this.getSetting('temperature_offset') || 0;
    const parsedValue = this.getSetting('temperature_decimals') === '2' ? Math.round((measuredValue / 100) * 100) / 100 : Math.round((measuredValue / 100) * 10) / 10;
    this.log('measure_temperature | temperatureMeasurement - measuredValue (temperature):', parsedValue, '+ temperature offset', temperatureOffset);
    this.setCapabilityValue('measure_temperature', parsedValue + temperatureOffset).catch(this.error);
  }

  onMoistureHumidityMeasuredAttributeReport(measuredValue) {
    const humidityOffset = this.getSetting('humidity_offset') || 0;
    const parsedValue = this.getSetting('humidity_decimals') === '2' ? Math.round((measuredValue / 100) * 100) / 100 : Math.round((measuredValue / 100) * 10) / 10;
    this.log('MoistureHumidity:', parsedValue, '+ humidity offset', humidityOffset);
    this.setCapabilityValue('measure_moisture', parsedValue + humidityOffset).catch(this.error);
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

  // 温湿度不再使用 configureReporting，改为由 HUB 定时主动 read。
  // 这里仅在轮询间隔设置变更时重启对应的轮询定时器。
  async setTemperaturAndHumidityConfigReport(oldSettings, newSettings, changedKeys) {
    this.log(`changedKeys: ${changedKeys}`)

    if (changedKeys.includes('temperature_poll_interval')) {
      this.log(`temperature poll interval changed to: ${newSettings['temperature_poll_interval']}`)
      this.startTemperaturePolling(newSettings['temperature_poll_interval'])
    }

    if (changedKeys.includes('humidity_poll_interval')) {
      this.log(`humidity poll interval changed to: ${newSettings['humidity_poll_interval']}`)
      this.startHumidityPolling(newSettings['humidity_poll_interval'])
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
    if (this.temperaturePollIntervalId) {
      this.homey.clearInterval(this.temperaturePollIntervalId)
    }
    if (this.humidityPollIntervalId) {
      this.homey.clearInterval(this.humidityPollIntervalId)
    }
    this.log('Soil Moisture Sensor has been deleted');
  }

}

module.exports = soilMoistureSensor;
