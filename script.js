const fs = require('fs');
const path = require('path');
const { parse } = require('fast-csv');
const {v4:uuid} = require('uuid');
var https = require('follow-redirects').https;
const converter = require('json-2-csv');

let rows = [];


//Reading the CSV file
fs.createReadStream(path.resolve(__dirname, 'message.csv'))
  .pipe(parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {

//messageId generator
row.messageId = uuid();


//HTTP Post request to infobip
const username = 'shobayos'; 
const password = '1qaz!QAZ1qaz'; 
const encodedBase64Token = Buffer.from(`${username}:${password}`).toString('base64'); 
const authorization = `Basic ${encodedBase64Token}`;

var options = {
    'method': 'POST',
    'hostname': '5vj26j.api.infobip.com',
    'path': '/sms/1/text/advanced',
    'headers': {
        'Authorization': authorization,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    'maxRedirects': 20
};

var req = https.request(options, function (res) {
    var chunks = [];
    //var description;

    res.on("data", function (chunk) {
        chunks.push(chunk);
        var items = JSON.parse(chunk).messages;
        items.forEach(function (item) {
            item.description
            var description = item.status.description;
            row.description = description;
        });
        
        
    });

    res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);

        //displaying the all the rows
        console.log(row);

        //convert row back to CSV.

       
    });


    res.on("error", function (error) {
        console.error(error);
    });
});
var data = {
    "bulkId": "june-campaign",
    "messages": [
      {
        "from": row.SenderId,
        "destinations": [
          {
            "to": row.MSISDN,
            "messageId": row.messageId
          }
        ],
        "text": "Check out our newest collection available NOW in your local store.",
        "notifyUrl": "http://www.example.com/sms/campaigns",
        "notifyContentType": "application/json",
        "callbackData": "For example, this field can store tracking ID for analytics"
      }
    ]
  };

var postData = JSON.stringify(data);

req.write(postData);
req.end();

rows.push(row);

})
  .on('end', rowCount => {
      console.log(`Parsed ${rowCount} rows`);

  });
