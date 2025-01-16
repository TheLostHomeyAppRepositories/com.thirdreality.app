'use strict';

const { ZCLDataTypes, Cluster } = require('zigbee-clusters');


const ATTRIBUTES = {
    coolDownTime: { id: 1, type: ZCLDataTypes.uint16 },
};

const COMMANDS = {};


class motionCooldownTimeCluster extends Cluster {

    static get ID() {
        return 65281;
    }

    static get NAME() {
        return 'coolDownTime';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }

}

Cluster.addCluster(motionCooldownTimeCluster);

module.exports = motionCooldownTimeCluster;
