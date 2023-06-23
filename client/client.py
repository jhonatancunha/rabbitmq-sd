"""
Descrição: Cliente RabbitMQ que consumirá tweets classificados
Autor: Jhonatan Cunha e Jessé Pires
Data de criação: 21/06/2023
Última atualização: 22/06/2023
"""

import questionary
import pika
import json
import time
import os

from rich import print

def main():
    """
    Função principal que recebe as opções do usuário e aguarda mensagens no RabbitMQ.
    """
    topics = ['sports', 'health', 'programming']

    # Exibe uma caixa de seleção interativa para que o usuário escolha os tópicos desejados
    choices = questionary.checkbox(
        "Quais tópicos você deseja receber informações?", 
        choices=topics
    ).ask()

    # Estabelece uma conexão com o RabbitMQ
    connection = pika.BlockingConnection(pika.URLParameters("amqp://utfpr:sistemas_distribuidos@localhost:5672"))
    channel = connection.channel()



    def callback(ch, method, properties, body):
        """
        Função de retorno de chamada para processar mensagens recebidas.
        Imprime as informações da mensagem no console.
        """

        # Obtém informações da mensagem recebida
        queue = method.routing_key
        data = json.loads(body)
        name = data["name"]
        text = data["text"]

        # Imprime as informações da mensagem no console
        print(f"# [red]{queue}[/red] -> [blue]@{name}[/blue]: {text}")

    for queue in choices:
        # Configura o consumo da fila, usando a função de retorno de chamada definida acima
        # O parâmetro auto_ack=True indica que as mensagens serão automaticamente reconhecidas pelo consumidor.
        # com isso automaticamente a mensagem é removida da fila
        channel.basic_consume(queue=queue, on_message_callback=callback, auto_ack=True)

    # Inicia o consumo
    channel.start_consuming()


if __name__ == "__main__":
    main()
