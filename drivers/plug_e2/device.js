'use strict';


const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER, Cluster } = require("zigbee-clusters");
const startUpOnOffCluster = require("../../lib/startUpOnOffSpecificCluster")

Cluster.addCluster(startUpOnOffCluster)



class Plug extends ZigBeeDevice {
  async onNodeInit({ zclNode }) {
    this.registerCapability("onoff", CLUSTER.ON_OFF);

    this.registerCapability('measure_power', CLUSTER.ELECTRICAL_MEASUREMENT, {
      reportParser: value => {
        // return (value * this.measureOffset)/100;
        return value / 10;
      },
      getOpts: {
        getOnStart: true,
        pollInterval: this.minReportPower
      }
    });
    // this.printNode();

    this.registerCapability('measure_current', CLUSTER.ELECTRICAL_MEASUREMENT, {
      reportParser: value => {
        return value / 1000;
      },
      getOpts: {
        getOnStart: true,
        pollInterval: this.minReportCurrent
      }
    });

    this.registerCapability('measure_voltage', CLUSTER.ELECTRICAL_MEASUREMENT, {
      reportParser: value => {
        return value / 10;
      },
      getOpts: {
        getOnStart: true,
        pollInterval: this.minReportVoltage
      }
    });

  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    if (changedKeys == "start_up_on_off") {
      if (newSettings[changedKeys] == "0") {
        this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 0 })
        console.log("Start Up On/Off is OFF")
      }
      else if (newSettings[changedKeys] == "1") {
        this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 1 })
        console.log("Start Up On/Off is ON")
      }
      else if (newSettings[changedKeys] == "2") {
        this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 2 })
        console.log("Start Up On/Off is TOGGLE")
      }
      else if (newSettings[changedKeys] == "255") {
        this.zclNode.endpoints[1].clusters["onOff"].writeAttributes({ startUpOnOff: 255 })
        console.log("Start Up On/Off is PREVIOUS")
      }
    }
  }
}


module.exports = Plug;
