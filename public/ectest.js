// public/ectest.js
var ecToken = '13EA3875-2879-4F44-AF0A-3ED336CB5BCA'

function splunkIt(object, clickEvent) {
  console.log(object, event);
  var xhr = new XMLHttpRequest();

  xhr.open('POST', 'http://localhost:8088/services/collector', true);
  xhr.setRequestHeader('Authorization', 'Splunk ' + ecToken);
  xhr.withCredentials = true;
  xhr.onload = function() {
    if (xhr.status === 200) {
      var userInfo = JSON.parse(xhr.responseText);
    }
  };
  xhr.send(JSON.stringify({
    event: clickEvent
  }));
};
