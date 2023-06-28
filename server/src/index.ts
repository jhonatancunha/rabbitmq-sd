// Descrição: Servidor RabbitMQ para classificação de tweets
// Autor: Jhonatan Cunha e Jessé Pires
// Data de criação: 21/06/2023
// Última atualização: 22/06/2023


import * as amqp from "amqplib";
import { processCSV } from "./utils/process_csv";

export interface IMessage {
    text: string;
    name: string;
}

/**
 * Publica uma mensagem no RabbitMQ com base nos dados de um arquivo CSV.
 * @returns {Promise<void>} Uma Promise vazia.
 */
async function publishMessage() {
    try {
        const connection = await amqp.connect(
            "amqp://utfpr:sistemas_distribuidos@localhost:5672"
        );
        const channel = await connection.createChannel();

        // Função que será invocada quando uma mensagem for classificada
        const callbackMessage = async (topic, message: IMessage) => {
            try{
                var exchange = 'topic_logs';
                const msg = Buffer.from(JSON.stringify(message));

                channel.assertExchange(exchange, 'topic', {
                    durable: false
                });

                channel.publish(exchange, topic, msg);

                console.log(`Mensagem publicada com sucesso na fila: ${topic}.`);
            }catch(error){
                console.log("error", error)
            }
        };

        // Função que será invocada quando terminar de processar o .csv
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
