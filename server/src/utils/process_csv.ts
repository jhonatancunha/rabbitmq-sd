import * as fs from 'fs'
import { checkMessage, rabbitMQTopics } from '../handler/topic_classifier';
import { IMessage } from '..';
const csv = require('csv-parser')


interface IProcessCSV {
    csvPath: string;
    callbackMessage: (topic: string, msg: IMessage) => void;
    callbackFinish: () => void;
}

export const processCSV = ({csvPath, callbackMessage, callbackFinish}: IProcessCSV) => {
    fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
        const text = row.text;
        const name = row.name;
        const topics = Object.keys(rabbitMQTopics);

        topics.forEach(topic => {
            const matches = checkMessage(topic, text);

            if (matches) {
                const message = {
                    text,
                    name
                }
                callbackMessage(topic, message)
            }
        })

    })
    .on('end', () => {
        callbackFinish();
    });
}
