# TaskFlow — Frontend

Aplicativo móvel de gerenciamento de tarefas desenvolvido em **React Native + Expo**, integrado à API REST TaskFlow.

## Funcionalidades
- Cadastrar tarefas com título e descrição
- Listar tarefas salvas no MongoDB pela API
- Editar tarefas existentes
- Excluir tarefas com confirmação
- Marcar tarefas como concluídas ou pendentes
- Atualizar lista e visualizar contador de conclusão

## Requisitos
- Node.js 20.19+ (recomendado para Expo SDK 54)
- Expo Go no celular ou emulador Android/iOS
- Backend TaskFlow executando e acessível

## Como executar
```bash
npm install
cp .env.example .env
npx expo start
```
No PowerShell: `Copy-Item .env.example .env`.

### Configurar conexão
Edite `.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```
Substitua `192.168.1.100` pelo **IP IPv4 do computador que executa o backend**, encontrado via `ipconfig` (Windows) ou `ip addr` (Linux). O celular e o computador precisam estar na mesma rede Wi-Fi. A API deve estar rodando e a porta 3000 liberada no firewall. No emulador Android, normalmente é possível usar `http://10.0.2.2:3000`. No simulador iOS, `http://localhost:3000` pode funcionar.

Após alterar `.env`, reinicie o Expo. Abra o QR Code com Expo Go.

## Estrutura
- `App.js`: telas, formulário, listagem e ações CRUD
- `src/api.js`: chamadas HTTP com `fetch`
- `app.json`: configuração do Expo

## API utilizada
`GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id` e `DELETE /api/tasks/:id`.

**Importante:** não coloque segredos no `EXPO_PUBLIC_*`. Essa variável é incluída no app.
