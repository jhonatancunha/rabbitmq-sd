// Descrição: Funcões para processar arquivo .csv
// Autor: Jhonatan Cunha e Jessé Pires
// Data de criação: 21/06/2023
// Última atualização: 22/06/2023

import * as fs from "fs";
import { checkMessage, rabbitMQTopics } from "../handler/topic_classifier";
import { IMessage } from "..";
const csv = require("csv-parser");

interface IProcessCSV {
    csvPath: string;
    callbackMessage:  (topic: string, msg: IMessage) => Promise<void>;
    callbackFinish: () => void;
}

/**
 * Processa um arquivo CSV e realiza ações com base nos dados do arquivo.
 * @param {string} csvPath - O caminho para o arquivo CSV.
 * @param {function} callbackMessage - Função de retorno de chamada para mensagens encontradas.
 * @param {function} callbackFinish - Função de retorno de chamada para indicar o término do processamento.
 */
export const processCSV = ({
    csvPath,
    callbackMessage,
    callbackFinish,
}: IProcessCSV) => {
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", async (row) => {
            // Obtêm informações sobre a linha
            const text = row.text;
            const name = row.name;
            // Possiveis tópicos da mensagem
            const topics = Object.keys(rabbitMQTopics);
            // Variáveis auxiliares para a classificação
            let bestGuess = null;
            let valueBestGuess = null;
            let keywordsFounds = [];

            // Realizamos a classificação da mensagem para cada possível tópico
            // No fim da iteração, teremos o melhor palpite para a mensagem
            // Ou seja, aquele tópico que resultou em um número maior de
            // palavras-chave
            topics.forEach((topic) => {
                const matches = checkMessage(topic, text);

                if (matches) {
                    const message = {
                        text,
                        name,
                    };

                    // Caso a quantidade de palavras-chave for maior que o melhor palpite
                    // O atual palpite será o novo melhor palpite
                    if (matches.length > keywordsFounds.length) {
                        keywordsFounds = matches;
                        bestGuess = topic;
                        valueBestGuess = message;
                    }
                }
            });

            // Caso for encontrado algum palpite, envia o mesmo para a fila
            if (bestGuess) {
                await callbackMessage(bestGuess, valueBestGuess);
            }
        })
        .on("end", () => {
            callbackFinish();
        });
};
