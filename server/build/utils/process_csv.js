"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCSV = void 0;
var fs = require("fs");
var topic_classifier_1 = require("../handler/topic_classifier");
var csv = require('csv-parser');
var processCSV = function (_a) {
    var csvPath = _a.csvPath, callbackMessage = _a.callbackMessage, callbackFinish = _a.callbackFinish;
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', function (row) {
        var text = row.text;
        var name = row.name;
        var topics = Object.keys(topic_classifier_1.rabbitMQTopics);
        topics.forEach(function (topic) {
            var matches = (0, topic_classifier_1.checkMessage)(topic, text);
            if (matches) {
                var message = {
                    text: text,
                    name: name
                };
                callbackMessage(topic, message);
            }
        });
    })
        .on('end', function () {
        callbackFinish();
    });
};
exports.processCSV = processCSV;
//# sourceMappingURL=process_csv.js.map