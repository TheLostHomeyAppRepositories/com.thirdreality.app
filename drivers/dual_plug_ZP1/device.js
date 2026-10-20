"use strict";

const { ZigBeeDevice } = require("homey-zigbeedriver");
const { CLUSTER, Cluster } = require("zigbee-clusters");
const PlugOnOffCluster = require("../../lib/startUpOnOffSpecificCluster");
const PlugPrivateCluster = require("../../lib/plugPrivateCluster");

Cluster.addCluster(PlugOnOffCluster);
Cluster.addCluster(PlugPrivateCluster);

const LEGACY_CAPABILITY_MIGRATION_MAP = {
  third_reality_dual_plug_left_switch_capability: "onoff.1",
  third_reality_dual_plug_right_switch_capability: "onoff.2",
  measure_current_of_left_dual_plug: "measure_current.1",
  measure_current_of_right_dual_plug: "measure_current.2",
  measure_power_of_left_dual_plug: "measure_power.1",
  measure_power_of_right_dual_plug: "measure_power.2",
  measure_voltage_of_left_dual_plug: "measure_voltage.1",
  measure_voltage_of_right_dual_plug: "measure_voltage.2",
  meter_power_of_left_dual_plug: "meter_power.1",
  meter_power_of_right_dual_plug: "meter_power.2",
};

class Dual_Plug extends ZigBeeDevice {
  async onNodeInit({ zclNode }) {
    try {
      await this.migrateLegacyCapabilities();

      this.registerCapabilityListener(
        "onoff.1",
        async (value) => {
          if (value === true) {
            await this.zclNode.endpoints[1].clusters["onOff"]
              .setOn()
              .catch((err) => {
                this.error(err);
              });
          } else {
            await this.zclNode.endpoints[1].clusters["onOff"]
              .setOff()
              .catch((err) => {
                this.error(err);
              });
          }
        },
      );

      this.registerCapabilityListener(
        "onoff.2",
        async (value) => {
          if (value === true) {
            await this.zclNode.endpoints[2].clusters["onOff"]
              .setOn()
              .catch((err) => {
                this.error(err);
              });
          } else {
            await this.zclNode.endpoints[2].clusters["onOff"]
              .setOff()
              .catch((err) => {
                this.error(err);
              });
          }
        },
      );

      this.registerCapabilityListener(
        "reset_left_summation_delivered_capability",
        async (value) => {
          if (value === true) {
            await this.zclNode.endpoints[1].clusters["plugPrivateCluster"]
              .writeAttributes({ reset_summation_delivered: 1 })
              .catch((err) => {
                this.error(err);
              });
          }
        },
      );

      this.registerCapabilityListener(
        "reset_right_summation_delivered_capability",
        async (value) => {
          if (value === true) {
            await this.zclNode.endpoints[2].clusters["plugPrivateCluster"]
              .writeAttributes({ reset_summation_delivered: 1 })
              .catch((err) => {
                this.error(err);
              });
          }
        },
      );

      try {
        await this.configAttributeReport(1);
        await this.configAttributeReport(2);

        await this.readEndpointOnOffState(1);
        await this.readEndpointOnOffState(2);

        await this.updatePowerCapabilitiesValue(1);
        await this.updatePowerCapabilitiesValue(2);

      }catch(error){
        this.error("Failed to initialize some attributes, but continuing...", error);
      }
    } catch (err) {
      this.log(err);
    }
  }

  async configAttributeReport(ep) {
    await this.zclNode.endpoints[ep].clusters[
      CLUSTER.ON_OFF.NAME
    ].configureReporting({
      onOff: {
        minInterval: 0,
        maxInterval: 300,
      },
    });
    await this.zclNode.endpoints[ep].clusters[
      CLUSTER.ELECTRICAL_MEASUREMENT.NAME
    ]
      .configureReporting({
        rmsCurrent: {
          minInterval: 5,
          maxInterval: 1800,
          minChange: 1,
        },
        rmsVoltage: {
          minInterval: 5,
          maxInterval: 1800,
          minChange: 1,
        },
        activePower: {
          minInterval: 5,
          maxInterval: 1800,
          minChange: 1,
        },
      })
      .catch((err) => {
        this.error(err);
      });

    await this.zclNode.endpoints[ep].clusters[CLUSTER.METERING.NAME]
      .configureReporting({
        currentSummationDelivered: {
          minInterval: 5,
          maxInterval: 1800,
          minChange: 1,
        },
      })
      .catch((err) => {
        this.error(err);
      });
  }

  async updatePowerCapabilitiesValue(ep) {
    if (ep === 1) {
      await this.zclNode.endpoints[ep].clusters[
        CLUSTER.ELECTRICAL_MEASUREMENT.NAME
      ].on("attr.rmsCurrent", (value) => {
        const currentValue = value / 1000;
        this.log(`left_current_value: ${currentValue} A`);
        this.setCapabilityValue("measure_current.1", currentValue).catch((err) => {
          this.error(err);
        });
      });

      await this.zclNode.endpoints[ep].clusters[
        CLUSTER.ELECTRICAL_MEASUREMENT.NAME
      ].on("attr.rmsVoltage", (value) => {
        const voltageValue = value / 10;
        this.log(`left_voltage_value: ${voltageValue} V`);
        this.setCapabilityValue("measure_voltage.1", voltageValue).catch((err) => {
          this.error(err);
        });
      });

      await this.zclNode.endpoints[ep].clusters[
        CLUSTER.ELECTRICAL_MEASUREMENT.NAME
      ].on("attr.activePower", (value) => {
        const powerValue = value / 10;
        this.log(`left_power_value: ${powerValue} W`);
        this.setCapabilityValue("measure_power.1", powerValue).catch((err) => {
          this.error(err);
        });
      });

      await this.zclNode.endpoints[ep].clusters[CLUSTER.METERING.NAME].on(
        "attr.currentSummationDelivered",
        (value) => {
          const meteringValue = value / 1000;
          this.log(`left_metering_value: ${meteringValue} kWh`);
          this.setCapabilityValue("meter_power.1", meteringValue).catch((err) => {
            this.error(err);
          });
        },
      );
    } else if (ep === 2) {
      await this.zclNode.endpoints[ep].clusters[
        CLUSTER.ELECTRICAL_MEASUREMENT.NAME
      ].on("attr.rmsCurrent", (value) => {
        const currentValue = value / 1000;
        this.log(`right_current_value: ${currentValue} A`);
        this.setCapabilityValue("measure_current.2", currentValue).catch((err) => {
          this.error(err);
        });
      });

      await this.zclNode.endpoints[ep].clusters[
        CLUSTER.ELECTRICAL_MEASUREMENT.NAME
      ].on("attr.rmsVoltage", (value) => {
        const voltageValue = value / 10;
        this.log(`right_voltage_value: ${voltageValue} V`);
        this.setCapabilityValue("measure_voltage.2", voltageValue).catch((err) => {
          this.error(err);
        });
      });

      await this.zclNode.endpoints[ep].clusters[
        CLUSTER.ELECTRICAL_MEASUREMENT.NAME
      ].on("attr.activePower", (value) => {
        const powerValue = value / 10;
        this.log(`right_power_value: ${powerValue} W`);
        this.setCapabilityValue("measure_power.2", powerValue).catch((err) => {
          this.error(err);
        });
      });

      await this.zclNode.endpoints[ep].clusters[CLUSTER.METERING.NAME].on(
        "attr.currentSummationDelivered",
        (value) => {
          const meteringValue = value / 1000;
          this.log(`right_metering_value: ${meteringValue} kWh`);
          this.setCapabilityValue("meter_power.2", meteringValue).catch((err) => {
            this.error(err);
          });
        },
      );
    }
  }

  async readEndpointOnOffState(ep) {
    await this.zclNode.endpoints[ep].clusters["onOff"].on(
      "attr.onOff",
      (onOffState) => {
        this.log(`on_off_state_${ep}: `, onOffState);
        if (ep === 1) {
          this.setCapabilityValue("onoff.1", onOffState).catch((err) => {
            this.error(err);
          });
          if (onOffState === true) {
            this.driver.triggerTurnOnLeft(this);
          } else {
            this.driver.triggerTurnOffLeft(this);
          }
        } else if (ep === 2) {
          this.setCapabilityValue("onoff.2", onOffState).catch((err) => {
            this.error(err);
          });
          if (onOffState === true) {
            this.driver.triggerTurnOnRight(this);
          } else {
            this.driver.triggerTurnOffRight(this);
          }
        }
      },
    );
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
    this.log("changedKeys: ", changedKeys);
    this.log("newSettings: ", newSettings);
    this.log("oldSettings: ", oldSettings);
    for (let changedKey of changedKeys) {
      this.log(`changedKey: ${changedKey}`);
      if (changedKey == "start_up_on_off_left") {
        if (newSettings[changedKey] == "0") {
          await this.zclNode.endpoints[1].clusters["onOff"]
            .writeAttributes({ startUpOnOff: 0 })
            .catch((err) => {
              this.error(err);
            });
          console.log("Startup ON/OFF(Left) is OFF");
        } else if (newSettings[changedKey] == "1") {
          await this.zclNode.endpoints[1].clusters["onOff"]
            .writeAttributes({ startUpOnOff: 1 })
            .catch((err) => {
              this.error(err);
            });
          console.log("Startup ON/OFF(Left) is ON");
        } else if (newSettings[changedKey] == "2") {
          await this.zclNode.endpoints[1].clusters["onOff"]
            .writeAttributes({ startUpOnOff: 2 })
            .catch((err) => {
              this.error(err);
            });
          console.log("Startup ON/OFF(Left) is TOGGLE");
        } else if (newSettings[changedKey] == "255") {
          await this.zclNode.endpoints[1].clusters["onOff"]
            .writeAttributes({ startUpOnOff: 255 })
            .catch((err) => {
              this.error(err);
            });
          console.log("Startup ON/OFF(Left) is PREVIOUS");
        }
      } else if (changedKey == "start_up_on_off_right") {
        if (newSettings[changedKey] == "0") {
          await this.zclNode.endpoints[2].clusters["onOff"]
            .writeAttributes({ startUpOnOff: 0 })
            .catch((err) => {
              this.error(err);
            });
          console.log("Startup ON/OFF(Right) is OFF");
        } else if (newSettings[changedKey] == "1") {
          await this.zclNode.endpoints[2].clusters["onOff"]
            .writeAttributes({ startUpOnOff: 1 })
            .catch((err) => {
              this.error(err);
            });
          console.log("Startup ON/OFF(Right) is ON");
        } else if (newSettings[changedKey] == "2") {
          await this.zclNode.endpoints[2].clusters["onOff"]
            .writeAttributes({ startUpOnOff: 2 })
            .catch((err) => {
              this.error(err);
            });
          console.log("Startup ON/OFF(Right) is TOGGLE");
        } else if (newSettings[changedKey] == "255") {
          await this.zclNode.endpoints[2].clusters["onOff"]
            .writeAttributes({ startUpOnOff: 255 })
            .catch((err) => {
              this.error(err);
            });
          console.log("Startup ON/OFF(Right) is PREVIOUS");
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

module.exports = Dual_Plug;
