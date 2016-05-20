

// require packages
var CronJob = require('cron').CronJob
var splunkjs = require('splunk-sdk')
var fs = require('fs')

// cron job runs every 30 secs
new CronJob('*/30 * * * * *', function() {
  // fetch the saved searchName
  fetchSavedSearch(renderResults, 'sdk_status_codes')
}, function() {}, true)

// define the splunk service
var service = new splunkjs.Service({
  username:"admin",
  password:"changed", // Use your own admin password
  scheme:"https",
  host:"localhost",
  port:"8089",
  version:"6.4"
});

// render the results of the saved search as part of the callback
// and write the payload to a JSON file
function renderResults(data, searchName) {
  console.log(data)  // print out the result in the console
  // generate the json file
  fs.writeFile(__dirname + '/public/'+searchName+'.json', JSON.stringify(data),
  function (err) {
    if (err) throw err
    console.log(new Date() + ' Written ' + searchName + '.json')
  })
}

// fetch saved searches function
function fetchSavedSearch(callback, searchName) {
  var savedSearches = service.savedSearches({
      owner: "admin",
      app: "destinations"
  });
  savedSearches.fetch(function (err, savedSearches) {
    if (err) {
      console.log(err)
      callback('error', searchName)
    } else {
      if (savedSearches.item(searchName) != null) {
        var savedSearch = savedSearches.item(searchName)
        savedSearch.dispatch({
            force_dispatch: false,
          }, function(e, job) {
          if (e) {
            console.log(e)
            callback('error', searchName)
          } else {
            job.setTTL(60, function(err, job) {});
            job.track({
              period: 200
            }, {
              done: function(job) {
                job.results({
                  count: 0
                }, function(err, results, job) {
                  console.log('Job Succeeded: ' + searchName)
                  callback({
                    fields: results.fields,
                    rows: results.rows
                  }, searchName)
                });
              },
              failed: function(job) {
                console.log("Job failed")
                callback('failed', searchName)
              },
              error: function(err) {
                console.log(err);
                callback('error', searchName)
              }
            })
          }
        })
      }
    }
  })
}
