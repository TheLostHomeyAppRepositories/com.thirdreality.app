'use strict';


const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER } = require("zigbee-clusters");



class Plug extends ZigBeeDevice {
  async onNodeInit({ zclNode }) {
    this.registerCapability("onoff", CLUSTER.ON_OFF);
  }
}


module.exports = Plug;
