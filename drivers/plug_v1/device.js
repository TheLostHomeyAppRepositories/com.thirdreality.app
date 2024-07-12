'use strict';


const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER, Cluster } = require("zigbee-clusters");
const startUpOnOffCluster = require("../../lib/startUpOnOffSpecificCluster")

Cluster.addCluster(startUpOnOffCluster)

class Plug extends ZigBeeDevice {
  async onNodeInit({ zclNode }) {
    this.registerCapability("onoff", CLUSTER.ON_OFF);
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
