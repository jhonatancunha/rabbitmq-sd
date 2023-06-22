import * as amqp from "amqplib";
import { processCSV } from "./utils/process_csv";

export interface IMessage {
    text: string;
    name: string;
}

async function publishMessage() {
    try {
        const connection = await amqp.connect(
            "amqp://utfpr:sistemas_distribuidos@localhost:5672"
        );
        const channel = await connection.createChannel();

        const callbackMessage = async (topic, message: IMessage) => {
            await channel.assertQueue(topic);
            console.log(`Mensagem publicada com sucesso na fila: ${topic}.`);
            channel.sendToQueue(topic, Buffer.from(JSON.stringify(message)));
        };

        const callbackFinish = async () => {
            // await channel.close();
            // await connection.close();
            console.log("Acabou de processar todos os tweets.");
        };

        processCSV({
            csvPath: "tweets.csv",
            callbackMessage,
            callbackFinish,
        });

        // processCSV({
        //     csvPath: "tweets_db2.csv",
        //     callbackMessage,
        //     callbackFinish,
        // });
    } catch (error) {
        console.error("Error:", error);
    }
}

publishMessage();
