# Integração com Google Sheets

O formulário salva primeiro no Firebase e, em seguida, envia uma cópia do lead para uma planilha. O ID gerado pelo Firebase também é enviado para evitar linhas duplicadas.

## 1. Criar e preparar a planilha

1. Crie uma planilha no Google Sheets com o nome `Leads Mentor Shanghai`.
2. Copie o ID da planilha. Ele é o trecho da URL entre `/d/` e `/edit`.
3. Na planilha, acesse **Extensões > Apps Script**.
4. Apague o código inicial e cole o conteúdo de `integrations/google-sheets/Code.gs`.
5. Troque `COLE_AQUI_O_ID_DA_PLANILHA` pelo ID copiado no passo 2.
6. Salve o projeto.

## 2. Publicar o Apps Script

1. Clique em **Implantar > Nova implantação**.
2. Em **Selecionar tipo**, escolha **App da Web**.
3. Em **Executar como**, selecione **Eu**.
4. Em **Quem pode acessar**, selecione **Qualquer pessoa**.
5. Clique em **Implantar** e autorize o acesso à planilha.
6. Copie a URL que termina em `/exec`. Não use a URL de teste terminada em `/dev`.

## 3. Conectar a landing page

Em `assets/js/config.js`, localize:

```js
export const googleSheetsWebAppUrl = '';
```

Cole a URL `/exec` entre as aspas. Depois publique novamente a landing page.

Sempre que `integrations/google-sheets/Code.gs` for alterado, salve o código no Apps Script e atualize a implantação escolhendo **Nova versão**.

## Colunas criadas automaticamente

- Data e hora
- ID do lead
- Nome
- WhatsApp
- Cidade / Estado
- Já vendeu pneus?
- Experiência no mercado
- Origem

O Firebase permanece como fonte principal. Se o Google Sheets estiver temporariamente indisponível, o cadastro não é perdido no Firebase.
