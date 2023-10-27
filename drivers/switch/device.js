'use strict';

const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER } = require("zigbee-clusters");

class Switch extends ZigBeeDevice {
    async onNodeInit({ zclNode }) {
        await this.registerCapability("onoff", CLUSTER.ON_OFF);
        // await this.registerCapability("measure_battery", CLUSTER.POWER_CONFIGURATION);

        const device_ieee = this.getSettings()["zb_ieee_address"]
        const modeNum = this.getSettings()["zb_product_id"]
        // if the switch modeNum is 3RSS007Z or 3RSS008Z, the switch is v1 or v2, it is report batteryVoltage
        if (modeNum == "3RSS007Z" || modeNum == "3RSS008Z") {
            try {
                const currentBatteryVoltageValue = await zclNode.endpoints[1].clusters.powerConfiguration.readAttributes(["batteryVoltage"])
                this.onBatteryVoltageAttributeReport(currentBatteryVoltageValue["batteryVoltage"])
            } catch (err) {
                this.log("Switch ", device_ieee, " can not get BatteryVoltage, ",err)
            }
        // if the switch modeNum is 3RSS009Z, the switch is v3, it is report batteryPercentageRemaining
        } else {
            // zclNode.endpoints[1].clusters["powerConfiguration"]
            //     .on('attr.batteryPercentageRemaining', this.onBatteryPercentageRemainingAttributeReport.bind(this));
            zclNode.endpoints[1].clusters["powerConfiguration"]
                .on('attr.batteryPercentageRemaining', (batteryPercentageRemaining) =>{this.onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining)});
        }
    }

    onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining) {
        const batteryThreshold = this.getSetting('batteryThreshold') || 20;
        this.log("measure_battery | powerConfiguration - batteryPercentageRemaining (%): ", batteryPercentageRemaining / 2);
        this.setCapabilityValue('measure_battery', batteryPercentageRemaining / 2).catch(this.error);
    }

    onBatteryVoltageAttributeReport(voltage) {
        this.log("current voltage is: ", voltage)
        var PercentageRemaining = 0
        if (voltage <= 21) {
            PercentageRemaining = 0
        }
        else if (voltage >= 31) {
            PercentageRemaining = 100
        }
        else {
            PercentageRemaining = Math.round((voltage - 21) / 9 * 100)

        }

        this.log("current percentage remaining is: ", PercentageRemaining)
        this.setCapabilityValue('measure_battery', PercentageRemaining).catch(this.error);
    }
}



// async onRenamed(){
//   const node = await this.homey.zigbee.getNode(this);
//   await node.sendFrame(
//     1, // endpoint id
//     1, // cluster id
//     Buffer.from([
//       0, // frame control
//       0, // transaction sequence number
//       10, // command id ('on')
//     ])
//   );
// }



module.exports = Switch;
