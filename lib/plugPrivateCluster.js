'use strict';

const { ZCLDataTypes, Cluster } = require('zigbee-clusters');


const ATTRIBUTES = {
  reset_summation_delivered: { id: 0, type: ZCLDataTypes.uint8 },
  count_down_time: { id: 1, type: ZCLDataTypes.uint16 }
};

const COMMANDS = {};


class PlugPrivateCluster extends Cluster {

  static get ID() {
    return 65283;
  }

  static get NAME() {
    return 'plugPrivateCluster';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(PlugPrivateCluster);

module.exports = PlugPrivateCluster;
