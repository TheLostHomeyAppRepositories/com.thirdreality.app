'use strict';


const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER } = require("zigbee-clusters");



class Plug extends ZigBeeDevice {
  async onNodeInit({ zclNode }) {
    this.registerCapability("onoff", CLUSTER.ON_OFF);

    this.registerCapability('measure_power', CLUSTER.ELECTRICAL_MEASUREMENT, {
      reportParser: value => {
        // return (value * this.measureOffset)/100;
        return value/10;
      },
      getOpts: {
        getOnStart: true,
        pollInterval: this.minReportPower
	    }
    });
    // this.printNode();

    this.registerCapability('measure_current', CLUSTER.ELECTRICAL_MEASUREMENT, {
      reportParser: value => {
        return value/1000;
      },
      getOpts: {
        getOnStart: true,
        pollInterval: this.minReportCurrent
      }
    });

    this.registerCapability('measure_voltage', CLUSTER.ELECTRICAL_MEASUREMENT, {
      reportParser: value => {
        return value/10;
      },
      getOpts: {
        getOnStart: true,
        pollInterval: this.minReportVoltage
      }
    });


    
  }
}


module.exports = Plug;
