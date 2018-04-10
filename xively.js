module.exports = function(RED) {
  var request = require('request');

  function sendXively(api_key, feed_id, id_data, value, timestamp){
    id_data = id_data.split(' ').join('_');
    id_data = id_data.split('\'').join('_');

    var date = CreateDate(timestamp);
    var msg = `<?xml version="1.0" encoding="UTF-8"?><eeml><environment><data id="${id_data}"><datapoints><value at="${date}">${value}</value></datapoints></data></environment></eeml>`;
    var myUrl = `https://api.xively.com/v2/feeds/${feed_id}.xml`;

    request.put({
      headers: {
        "X-ApiKey": api_key
      },
      url: myUrl,
      body: msg
    }, function(error, response, body) {
      if(error) {
        console.log("[Xively] Error sending data");
      }
    });
  }

  function CreateDate(timestamp){
    var date = new Date(timestamp);
    var date_ISO = date.toISOString();
    return (date_ISO.substring(0,19) + date_ISO.substring(23));
  }

  function XivelyNode(n) {
    RED.nodes.createNode(this,n);
    this.feed_id = n.feed_id;
    this.api_key = n.api_key;
    this.id_data = n.id_data;
    var node = this;

    this.on("input", function(msg) {
      var feed_id = msg.feed_id ||node.feed_id;
      var api_key = msg.api_key||node.api_key;
      var id_data = msg.id_data||node.id_data;
      var value = msg.payload;
      var timestamp = msg.timestamp || Date.now();
      sendXively(api_key, feed_id, id_data, value, timestamp);
    });
  }
  RED.nodes.registerType("xively", XivelyNode);
}
