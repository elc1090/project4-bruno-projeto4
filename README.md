# Potrol

![Screenshot do projeto](https://controle-potreiros.herokuapp.com/print.png "Screenshot do projeto").


#### Descrição

Aplicativo para cadastro e controle de manejos de potreiros. Oferece função para cadastro de visitas e sugestões de manejos.

#### Deploy

https://controle-potreiros.herokuapp.com/

#### Testes

Cadastro de usuário
Cadastro de fazenda
Cadastro de visita
Cadastro de manejos
Cadastro de clientes

#### Desenvolvedor(es)
Bruno Frizzo Trojahn

#### Tecnologias

HTML, Tailwind, Javascript, Nodejs, Postgresql

#### Ambiente de desenvolvimento

Git, Vscode, Docker

#### Créditos

- https://devcenter.heroku.com/ 

#### Bastidores

A ideia do tema surgiu da necessidade de um familiar, que usava planilhas para preencher as informacoes que utilizada no dia a dia do trabalho de consultor. Ele relatou o desejo de transformar as planilhas em um aplicativo, o qual permitiria inserir os dados diretamente pelo celular. Pensando nisso, um dos requisitos do projeto é que ele fosse um PWA, permitindo
que o aplicativo seja instalado em dispositivos móveis. O desafio maior do projeto foi o deploy, pois a Vercel não possui suporte para backend, apenas front-end. Foi então que surgiu a necessidade de separar a aplicação em dois servidores, um para hospedar a API e outro para o frontend. A configuração do BD no NeonTech foi muito simples, sem maiores dificuldades.
Posteriormente, acabei unindo o back e o front somente na hospedagem do Heroku, o que facilitou bastante. Outro desafio foi a parte do cache do PWA, que acabou gerando alguns problemas de atualização. 
Link do projeto anterior: https://github.com/elc1090/project3-brunotrojahn

---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2023a) em 2023a