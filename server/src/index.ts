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
            try{
                await channel.assertQueue(topic);
                console.log(`Mensagem publicada com sucesso na fila: ${topic}.`);
                channel.sendToQueue(topic, Buffer.from(JSON.stringify(message)));
            }catch(error){
                console.log("error", error)
            }
        };

        const callbackFinish = async () => {
            console.log("Acabou de processar todos os tweets.");
        };


        processCSV({
            csvPath: "tweets_db.csv",
            callbackMessage,
            callbackFinish,
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

publishMessage();
