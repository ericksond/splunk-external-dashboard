var splunkBunyan = require("splunk-bunyan-logger");
var bunyan = require("bunyan");

var config = {
  token: "13EA3875-2879-4F44-AF0A-3ED336CB5BCA",
  url: "http://localhost:8088"
};
var splunkStream = splunkBunyan.createStream(config);

splunkStream.on("error", function(err, context) {
  console.log("Error", err, "Context", context)
});

var Logger = bunyan.createLogger({
    name: "logger",
    streams: [
        splunkStream
    ]
});

var payload = {
  event: "logging event #" + Math.random()
};

console.log("Sending payload", payload);
Logger.info(payload, "Posted successfully.")
