import questionary


def main():

    topics = ['sports', 'health', 'programming']

    choices = questionary.checkbox(
        "Quais tópicos você deseja receber informações?", 
        choices=topics
    ).ask()


if __name__ == "__main__":
    main()
