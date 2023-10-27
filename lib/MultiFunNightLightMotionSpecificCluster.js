'use strict';

const { ZCLDataTypes, IASZoneCluster, Cluster } = require('zigbee-clusters');
const ZONE_STATUS_DATA_TYPE = ZCLDataTypes.map16('alarm1', 'alarm2', 'tamper', 'battery', 'supervisionReports', 'restoreReports', 'trouble', 'acMains', 'test', 'batteryDefect');


const COMMANDS = {
    zoneStatusChangeNotification: {
        id: 0x00,
        // Add direction property as "zoneEnrollResponse" has same command id.
        direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
        args: {
            zoneStatus: ZONE_STATUS_DATA_TYPE
        },
    },
};

class MultiFunNightLightMotionCluster extends Cluster {
    static get ID() {
        return 64512; // The cluster id
    }

    static get NAME() {
        return "mFunNightLightMotion";
    }

    static get ATTRIBUTES() {
        return {
            ...super.ATTRIBUTES,
            zoneStatus: {
                id: 2,
                type: ZONE_STATUS_DATA_TYPE,
            }
        };
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(MultiFunNightLightMotionCluster);

module.exports = MultiFunNightLightMotionCluster;