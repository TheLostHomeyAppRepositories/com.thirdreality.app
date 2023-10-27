const Homey = require("homey");

class Driver extends Homey.Driver {
  // this method is called when the app is started and the Driver is inited
  async onInit() {
    this.log("driver has been initialized")
  }
  
  // This method is called when a user is adding a device
  // and the 'list_devices' view is called
  async onPairListDevices() {
    return [
      {
        name: "Switch Device",
        data: {
          id: "abcd1234",
        },
      },
    ];
  }
}

module.exports = Driver;