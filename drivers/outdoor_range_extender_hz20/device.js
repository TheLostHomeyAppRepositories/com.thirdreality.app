'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

module.exports = class OutdoorRangeExtenderHZ20 extends ZigBeeDevice {

  /**
   * onNodeInit is called when the Zigbee node is initialized.
   */
  async onNodeInit({ zclNode }) {
    // onoff: get and report are handled by registerCapability.
    // HZ20 does not send a default response for setOn/setOff, so the default capability
    // listener blocks until timeout ("Could not reach device") and Homey retries the same
    // command repeatedly. Override the set listener to fire the command without waiting.
    if (this.hasCapability('onoff')) {
      this.registerCapability('onoff', CLUSTER.ON_OFF, {
        getOpts: {
          getOnStart: true,
          pollInterval: 600000,
        },
        reportOpts: {
          configureAttributeReporting: {
            minInterval: 0,
            maxInterval: 3600,
            minChange: 1,
          },
        },
      });

      this.registerCapabilityListener('onoff', async (value) => {
        const onOffCluster = this.zclNode.endpoints[1].clusters.onOff;
        const opts = { waitForResponse: false, disableDefaultResponse: true };
        if (value) {
          await onOffCluster.setOn(undefined, opts);
        } else {
          await onOffCluster.setOff(undefined, opts);
        }
      });
    }

    // measure_battery: same convention as the other battery devices in this app (value / 2)
    if (this.hasCapability('measure_battery')) {
      const powerConfigurationCluster = zclNode.endpoints[1].clusters.powerConfiguration;
      if (powerConfigurationCluster) {
        powerConfigurationCluster.on(
          'attr.batteryPercentageRemaining',
          this.onBatteryPercentageRemainingAttributeReport.bind(this),
        );

        await this.configureAttributeReporting([
          {
            endpointId: 1,
            cluster: CLUSTER.POWER_CONFIGURATION,
            attributeName: 'batteryPercentageRemaining',
            minInterval: 3600,
            maxInterval: 43200,
            minChange: 2,
          },
        ]).catch(err => this.log('Could not configure battery reporting', err));

        powerConfigurationCluster.readAttributes(['batteryPercentageRemaining'])
          .then(({ batteryPercentageRemaining }) => {
            if (typeof batteryPercentageRemaining === 'number') {
              this.onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining);
            }
          })
          .catch(err => this.log('Could not read batteryPercentageRemaining', err));
      }
    }

    this.log('OutdoorRangeExtenderHZ20 has been initialized');
  }

  onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining) {
    const percentage = Math.min(Math.max(batteryPercentageRemaining / 2, 0), 100);
    this.log('measure_battery | powerConfiguration - batteryPercentageRemaining (%):', percentage);
    this.setCapabilityValue('measure_battery', percentage).catch(this.error);
  }

};
