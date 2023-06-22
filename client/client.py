import questionary
import pika
import json
import time
import os

from rich import print

def main():
    topics = ['sports', 'health', 'programming']

    choices = questionary.checkbox(
        "Quais tópicos você deseja receber informações?", 
        choices=topics
    ).ask()

    connection = pika.BlockingConnection(pika.URLParameters("amqp://utfpr:sistemas_distribuidos@localhost:5672"))
    channel = connection.channel()



    def callback(ch, method, properties, body):
        queue = method.routing_key
        data = json.loads(body)
        name = data["name"]
        text = data["text"]
        print(f"# [red]{queue}[/red] -> [blue]@{name}[/blue]: {text}")

    for queue in choices:
        channel.basic_consume(queue=queue, on_message_callback=callback, auto_ack=True)

    print("Waiting for messages...")
    channel.start_consuming()


if __name__ == "__main__":
    main()
