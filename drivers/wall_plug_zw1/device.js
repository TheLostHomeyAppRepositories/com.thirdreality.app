'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER, Cluster } = require("zigbee-clusters");
const PlugOnOffCluster = require("../../lib/startUpOnOffSpecificCluster")
const PlugPrivateCluster = require("../../lib/plugPrivateCluster")

Cluster.addCluster(PlugOnOffCluster)
Cluster.addCluster(PlugPrivateCluster)

const LEGACY_CAPABILITY_MIGRATION_MAP = {
  wall_plug_zw1_bottom_switch_capability: "onoff.1",
  wall_plug_zw1_top_switch_capability: "onoff.2",
  wall_plug_zw1_bottom_measure_current: "measure_current.1",
  wall_plug_zw1_top_measure_current: "measure_current.2",
  wall_plug_zw1_bottom_measure_power: "measure_power.1",
  wall_plug_zw1_top_measure_power: "measure_power.2",
  wall_plug_zw1_bottom_measure_voltage: "measure_voltage.1",
  wall_plug_zw1_top_measure_voltage: "measure_voltage.2",
  wall_plug_zw1_bottom_meter_power: "meter_power.1",
  wall_plug_zw1_top_meter_power: "meter_power.2",
};

class Wall_Plug_ZW1 extends ZigBeeDevice {
  async onNodeInit({ zclNode }) {
    await this.migrateLegacyCapabilities();

    this.registerCapability("measure_current.1", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("measure_current.2", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("measure_power.1", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("measure_power.2", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("measure_voltage.1", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("measure_voltage.2", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("meter_power.1", CLUSTER.METERING)
    this.registerCapability("meter_power.2", CLUSTER.METERING)

    await this.configAttributeReport(1)
    await this.configAttributeReport(2)

    await this.readEndpointOnOffState(1)
    await this.readEndpointOnOffState(2)

    await this.updatePowerCapabilitiesValue(1)
    await this.updatePowerCapabilitiesValue(2)


    await zclNode.endpoints[1].clusters[CLUSTER.ON_OFF.NAME].on("attr.onOff", (onOffState) => {
      if (onOffState === true) {
        this.driver.triggerTurnOnBottomSwitch(this)
      }
      else {
        this.driver.triggerTurnOffBottomSwitch(this)
      }
    })

    await zclNode.endpoints[2].clusters[CLUSTER.ON_OFF.NAME].on("attr.onOff", (onOffState) => {
      if (onOffState === true) {
        this.driver.triggerTurnOnTopSwitch(this)
      }
      else {
        this.driver.triggerTurnOffTopSwitch(this)
      }
    })

    this.registerCapabilityListener('onoff.1', async (value) => {
      this.log("onoff.1 value: ", value)
      if (value === true) {
        await this.zclNode.endpoints[1].clusters['onOff'].setOn().catch(err => { this.error(err) })
      }
      else {
        await this.zclNode.endpoints[1].clusters['onOff'].setOff().catch(err => { this.error(err) })
      }

    })

    this.registerCapabilityListener('onoff.2', async (value) => {
      this.log("onoff.2 value: ", value)
      if (value === true) {
        await this.zclNode.endpoints[2].clusters['onOff'].setOn().catch(err => { this.error(err) })
      }
      else {
        await this.zclNode.endpoints[2].clusters['onOff'].setOff().catch(err => { this.error(err) })
      }

    })

    this.registerCapabilityListener('wall_plug_zw1_reset_bottom_summation_delivered_capability', async (value) => {
      if (value === true) {
        await this.zclNode.endpoints[1].clusters["plugPrivateCluster"].writeAttributes({ reset_summation_delivered: 1 }).catch(err => { this.error(err) })
      }

    })

    this.registerCapabilityListener('wall_plug_zw1_reset_top_summation_delivered_capability', async (value) => {
      if (value === true) {
        await this.zclNode.endpoints[2].clusters["plugPrivateCluster"].writeAttributes({ reset_summation_delivered: 1 }).catch(err => { this.error(err) })
      }

    })

  }

  async configAttributeReport(ep) {
    await this.zclNode.endpoints[ep].clusters[CLUSTER.ON_OFF.NAME].configureReporting({
      onOff: {
        minInterval: 0,
        maxInterval: 300
      }
    }).catch(err => { this.error(err) });
    await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].configureReporting({
      rmsCurrent: {
        minInterval: 5,
        maxInterval: 1800,
        minChange: 1
      },
      rmsVoltage: {
        minInterval: 5,
        maxInterval: 1800,
        minChange: 1
      },
      activePower: {
        minInterval: 5,
        maxInterval: 1800,
        minChange: 1
      },
    }).catch(err => { this.error(err) });

    await this.zclNode.endpoints[ep].clusters[CLUSTER.METERING.NAME].configureReporting({
      currentSummationDelivered: {
        minInterval: 5,
        maxInterval: 1800,
        minChange: 1
      },
    }).catch(err => { this.error(err) });
  }

  async updatePowerCapabilitiesValue(ep) {
    if (ep === 1) {
      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.rmsCurrent",
        (value) => {
          const currentValue = value / 1000
          this.log(`bottom_current_value: ${currentValue} A`)
          this.setCapabilityValue("measure_current.1", currentValue).catch(err => { this.error(err) })
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.rmsVoltage",
        (value) => {
          const voltageValue = value / 10
          this.log(`bottom_voltage_value: ${voltageValue} V`)
          this.setCapabilityValue("measure_voltage.1", voltageValue).catch(err => { this.error(err) })
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.activePower",
        (value) => {
          const powerValue = value / 10
          this.log(`bottom_power_value: ${powerValue} W`)
          this.setCapabilityValue("measure_power.1", powerValue).catch(err => { this.error(err) })
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.METERING.NAME].on(
        "attr.currentSummationDelivered",
        (value) => {
          const meteringValue = value / 1000
          this.log(`bottom_metering_value: ${meteringValue} kWh`)
          this.setCapabilityValue("meter_power.1", meteringValue).catch(err => { this.error(err) })
        }
      )
    }

    else if (ep === 2) {
      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.rmsCurrent",
        (value) => {
          const currentValue = value / 1000
          this.log(`top_current_value: ${currentValue} A`)
          this.setCapabilityValue("measure_current.2", currentValue).catch(err => { this.error(err) })
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.rmsVoltage",
        (value) => {
          const voltageValue = value / 10
          this.log(`top_voltage_value: ${voltageValue} V`)
          this.setCapabilityValue("measure_voltage.2", voltageValue).catch(err => { this.error(err) })
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.activePower",
        (value) => {
          const powerValue = value / 10
          this.log(`top_power_value: ${powerValue} W`)
          this.setCapabilityValue("measure_power.2", powerValue).catch(err => { this.error(err) })
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.METERING.NAME].on(
        "attr.currentSummationDelivered",
        (value) => {
          const meteringValue = value / 1000
          this.log(`top_metering_value: ${meteringValue} kWh`)
          this.setCapabilityValue("meter_power.2", meteringValue).catch(err => { this.error(err) })
        }
      )
    }
  }


  async readEndpointOnOffState(ep) {
    await this.zclNode.endpoints[ep].clusters['onOff'].on("attr.onOff", (onOffState) => {
      this.log(`on_off_state_${ep}: `, onOffState)
      if (ep === 1) {
        this.setCapabilityValue("onoff.1", onOffState).catch(err => { this.error(err) })
      }
      else if (ep === 2) {
        this.setCapabilityValue("onoff.2", onOffState).catch(err => { this.error(err) })
      }

    })
  }

  async migrateLegacyCapabilities() {
    for (const [oldCapabilityId, newCapabilityId] of Object.entries(
      LEGACY_CAPABILITY_MIGRATION_MAP,
    )) {
      if (this.hasCapability(oldCapabilityId)) {
        try {
          if (!this.hasCapability(newCapabilityId)) {
            await this.addCapability(newCapabilityId);
          }
          await this.removeCapability(oldCapabilityId);
        } catch (err) {
          this.error(
            `Failed to migrate capability ${oldCapabilityId} -> ${newCapabilityId}`,
            err,
          );
        }
      }
    }
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log("changedKeys: ", changedKeys)
    this.log("newSettings: ", newSettings)
    this.log("oldSettings: ", oldSettings)
    for (let changedKey of changedKeys) {
      this.log(`changedKey: ${changedKey}`)
      if (changedKey == "start_up_on_off_bottom") {
        if (newSettings[changedKey] == "0") {
          await this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 0 }).catch(err => { this.error(err) })
          console.log("Startup ON/OFF(Bottom) is OFF")

        }
        else if (newSettings[changedKey] == "1") {
          await this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 1 }).catch(err => { this.error(err) })
          console.log("Startup ON/OFF(Bottom) is ON")

        }
        else if (newSettings[changedKey] == "2") {
          await this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 2 }).catch(err => { this.error(err) })
          console.log("Startup ON/OFF(Bottom) is TOGGLE")

        }
        else if (newSettings[changedKey] == "255") {
          await this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 255 }).catch(err => { this.error(err) })
          console.log("Startup ON/OFF(Bottom) is PREVIOUS")
        }
      }
      else if (changedKey == "start_up_on_off_top") {
        if (newSettings[changedKey] == "0") {
          await this.zclNode.endpoints[2].clusters["onOff"].writeAttributes({ startUpOnOff: 0 }).catch(err => { this.error(err) })
          console.log("Startup ON/OFF(Top) is OFF")

        }
        else if (newSettings[changedKey] == "1") {
          await this.zclNode.endpoints[2].clusters["onOff"].writeAttributes({ startUpOnOff: 1 }).catch(err => { this.error(err) })
          console.log("Startup ON/OFF(Top) is ON")

        }
        else if (newSettings[changedKey] == "2") {
          await this.zclNode.endpoints[2].clusters["onOff"].writeAttributes({ startUpOnOff: 2 }).catch(err => { this.error(err) })
          console.log("Startup ON/OFF(Top) is TOGGLE")

        }
        else if (newSettings[changedKey] == "255") {
          await this.zclNode.endpoints[2].clusters["onOff"].writeAttributes({ startUpOnOff: 255 }).catch(err => { this.error(err) })
          console.log("Startup ON/OFF(Top) is PREVIOUS")
        }
      }


    }

    // else if(changedKeys == "count_down_time"){
    //   const seconds = newSettings[changedKeys]
    //   this.log("count_down_time: ",seconds)
    //   this.zclNode.endpoints[1].clusters["plugPrivateCluster"].writeAttributes({ count_down_time: seconds }).catch(err => { this.error(err)})
    // }
  }
}



module.exports = Wall_Plug_ZW1;
