import * as fs from "fs";
import { checkMessage, rabbitMQTopics } from "../handler/topic_classifier";
import { IMessage } from "..";
const csv = require("csv-parser");

interface IProcessCSV {
    csvPath: string;
    callbackMessage:  (topic: string, msg: IMessage) => Promise<void>;
    callbackFinish: () => void;
}

export const processCSV = ({
    csvPath,
    callbackMessage,
    callbackFinish,
}: IProcessCSV) => {
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", async (row) => {
            const text = row.text;
            const name = row.name;
            const topics = Object.keys(rabbitMQTopics);
            let bestGuess = null;
            let valueBestGuess = null;
            let keywordsFounds = [];

            topics.forEach((topic) => {
                const matches = checkMessage(topic, text);

                if (matches) {
                    const message = {
                        text,
                        name,
                    };

                    if (matches.length > keywordsFounds.length) {
                        keywordsFounds = matches;
                        bestGuess = topic;
                        valueBestGuess = message;
                    }
                }
            });

            if (bestGuess) {
                await callbackMessage(bestGuess, valueBestGuess);
            }
        })
        .on("end", () => {
            callbackFinish();
        });
};
