'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER, Cluster } = require("zigbee-clusters");
const PlugOnOffCluster = require("../../lib/startUpOnOffSpecificCluster")
const PlugPrivateCluster = require("../../lib/plugPrivateCluster")

Cluster.addCluster(PlugOnOffCluster)
Cluster.addCluster(PlugPrivateCluster)


class Plug_V2 extends ZigBeeDevice {
  async onNodeInit({ zclNode }) {

    this.registerCapability("measure_current_of_left_dual_plug", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("measure_current_of_right_dual_plug", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("measure_power_of_left_dual_plug", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("measure_power_of_right_dual_plug", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("measure_voltage_of_left_dual_plug", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("measure_voltage_of_right_dual_plug", CLUSTER.ELECTRICAL_MEASUREMENT)
    this.registerCapability("meter_power_of_left_dual_plug", CLUSTER.METERING)
    this.registerCapability("meter_power_of_right_dual_plug", CLUSTER.METERING)
    await this.configAttributeReport(1)
    await this.configAttributeReport(2)


    await this.readEndpointOnOffState(1)
    await this.readEndpointOnOffState(2)

    await this.updatePowerCapabilitiesValue(1)
    await this.updatePowerCapabilitiesValue(2)

    this.registerCapabilityListener('third_reality_dual_plug_left_switch_capability',async (value) =>{
      if (value === true){
        await this.zclNode.endpoints[1].clusters['onOff'].setOn().catch(err => { this.error(err)})
      }
      else{
        await this.zclNode.endpoints[1].clusters['onOff'].setOff().catch(err => { this.error(err)})
      }
      
    })

    this.registerCapabilityListener('third_reality_dual_plug_right_switch_capability',async (value) =>{
      if (value === true){
        await this.zclNode.endpoints[2].clusters['onOff'].setOn().catch(err => { this.error(err)})
      }
      else{
        await this.zclNode.endpoints[2].clusters['onOff'].setOff().catch(err => { this.error(err)})
      }
      
    })

    this.registerCapabilityListener('reset_left_summation_delivered_capability',async (value) =>{
      if (value === true){
        await this.zclNode.endpoints[1].clusters["plugPrivateCluster"].writeAttributes({ reset_summation_delivered: 1 }).catch(err => { this.error(err)})
      }
      
    })

    this.registerCapabilityListener('reset_right_summation_delivered_capability',async (value) =>{
      if (value === true){
        await this.zclNode.endpoints[2].clusters["plugPrivateCluster"].writeAttributes({ reset_summation_delivered: 1 }).catch(err => { this.error(err)})
      }
      
    })


  }

  async configAttributeReport(ep){
    await this.zclNode.endpoints[ep].clusters[CLUSTER.ON_OFF.NAME].configureReporting({
      onOff:{
        minInterval: 1000,
        maxInterval: 10000
      }
    })
    await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].configureReporting({
        rmsCurrent: {
          minInterval: 1000,
          maxInterval: 10000,
          minChange: 1
        },
        rmsVoltage: {
          minInterval: 0,
          maxInterval: 10000,
          minChange: 1
        },
        activePower: {
          minInterval: 0,
          maxInterval: 10000,
          minChange: 1
        },
      }).catch(err => { this.error(err)});

    await this.zclNode.endpoints[ep].clusters[CLUSTER.METERING.NAME].configureReporting({
        currentSummationDelivered: {
          minInterval: 0,
          maxInterval: 10000,
          minChange: 1
        },
      }).catch(err => { this.error(err)}); 
  }

  async updatePowerCapabilitiesValue(ep){
    if(ep === 1){
      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.rmsCurrent",
        (value) => {
          const currentValue = value / 1000
          this.log(`left_current_value: ${currentValue} A`)
          this.setCapabilityValue("measure_current_of_left_dual_plug",currentValue)
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.rmsVoltage",
        (value) => {
          const voltageValue = value / 10
          this.log(`left_voltage_value: ${voltageValue} V`)
          this.setCapabilityValue("measure_voltage_of_left_dual_plug",voltageValue)
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.activePower",
        (value) => {
          const powerValue = value / 10
          this.log(`left_power_value: ${powerValue} W`)
          this.setCapabilityValue("measure_power_of_left_dual_plug",powerValue)
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.METERING.NAME].on(
        "attr.currentSummationDelivered",
        (value) => {
          const meteringValue = value / 1000
          this.log(`left_metering_value: ${meteringValue} kWh`)
          this.setCapabilityValue("meter_power_of_left_dual_plug",meteringValue)
        }
      )
    }

    else if(ep===2){
      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.rmsCurrent",
        (value) => {
          const currentValue = value / 1000
          this.log(`right_current_value: ${currentValue} A`)
          this.setCapabilityValue("measure_current_of_right_dual_plug",currentValue)
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.rmsVoltage",
        (value) => {
          const voltageValue = value / 10
          this.log(`right_voltage_value: ${voltageValue} V`)
          this.setCapabilityValue("measure_voltage_of_right_dual_plug",voltageValue)
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME].on(
        "attr.activePower",
        (value) => {
          const powerValue = value / 10
          this.log(`right_power_value: ${powerValue} W`)
          this.setCapabilityValue("measure_power_of_right_dual_plug",powerValue)
        }
      )

      await this.zclNode.endpoints[ep].clusters[CLUSTER.METERING.NAME].on(
        "attr.currentSummationDelivered",
        (value) => {
          const meteringValue = value / 1000
          this.log(`right_metering_value: ${meteringValue} kWh`)
          this.setCapabilityValue("meter_power_of_right_dual_plug",meteringValue)
        }
      )
    }
  }


  async readEndpointOnOffState(ep){
    await this.zclNode.endpoints[ep].clusters['onOff'].on("attr.onOff",(onOffState) => {
      this.log(`on_off_state_${ep}: `,onOffState)
      if (ep === 1){
        this.setCapabilityValue("third_reality_dual_plug_left_switch_capability",onOffState).catch(err => { this.error(err)})
      }
      else if (ep === 2){
        this.setCapabilityValue("third_reality_dual_plug_right_switch_capability",onOffState).catch(err => { this.error(err)})
      }
        
    })
  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log("changedKeys: ",changedKeys)
    this.log("newSettings: ",newSettings)
    this.log("oldSettings: ",oldSettings)
      if (changedKeys == "start_up_on_off") {
        if (newSettings[changedKeys] == "0") {
          await this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 0 }).catch(err => { this.error(err)})
          console.log("Start Up On/Off is OFF")

        }
        else if (newSettings[changedKeys] == "1") {
          await this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 1 }).catch(err => { this.error(err)})
          console.log("Start Up On/Off is ON")

        }
        else if (newSettings[changedKeys] == "2") {
          await this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 2 }).catch(err => { this.error(err)})
          console.log("Start Up On/Off is TOGGLE")

        }
        else if (newSettings[changedKeys] == "255") {
          await this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 255 }).catch(err => { this.error(err)})
          console.log("Start Up On/Off is PREVIOUS")
        }
      }
      else if(changedKeys == "count_down_time"){
        const seconds = newSettings[changedKeys]
        this.log("count_down_time: ",seconds)
        this.zclNode.endpoints[1].clusters["plugPrivateCluster"].writeAttributes({ count_down_time: seconds }).catch(err => { this.error(err)})
      }
    }
  }



module.exports = Plug_V2;
