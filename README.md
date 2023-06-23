# Como executar o servidor?

Siga os comandos abaixo:

```bash
cd server
docker-compose up -d
yarn
yarn start
```

# Como executar o cliente?

Siga os comandos abaixo:

```bash
cd client
pip install pipenv
pipenv install -r requirements.txt
pipenv shell
python client.py
```

# Como acessar GUI RabbitMQ

Acesso a URL `http://localhost:15672/` e informe as credenciais:

- **Username:** `utfpr`
- **Password:** `sistemas_distribuidos`