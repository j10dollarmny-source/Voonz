# voos-saas
Buscador de voos (ida e volta) com filtro por companhia, escalas e preço.

## Rodar
    npm install
    cp .env.example .env     # DUFFEL_TOKEN vazio = dados fictícios
    npm start                # http://localhost:3000

## Provedor
`providers/duffel.js` (Duffel). Amadeus Self-Service foi desativado em 17/07/2026.
Para trocar de provedor, devolva o mesmo formato normalizado (ver topo do arquivo).

## Não implementado
Reserva/pagamento, contas de usuário, alertas de preço, banco de dados.
