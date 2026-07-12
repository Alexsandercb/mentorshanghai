# Auditoria de segurança

Data: 12 de julho de 2026

## Escopo

- HTML, CSS e JavaScript da landing page
- regras do Cloud Firestore
- integração pública com Google Apps Script
- arquivos publicados no GitHub Pages
- exposição de credenciais e dependências
- cabeçalhos HTTP e política de conteúdo

## Controles implementados

- leitura, atualização e exclusão de leads continuam negadas no Firestore;
- criação de leads limitada a campos, tipos, tamanhos, enumerações, formato de telefone, timestamp do servidor e origem esperada;
- Content Security Policy restritiva adicionada ao HTML;
- JavaScript, CSS e configurações separados por responsabilidade;
- nenhum dado do usuário é inserido no DOM como HTML;
- honeypot contra robôs e limites equivalentes no formulário;
- botão bloqueado durante o envio para evitar repetição acidental;
- timeout na sincronização com o Sheets, preservando o Firebase como fonte principal;
- deduplicação por ID e proteção contra fórmulas na planilha;
- validação de origem, data, identificador e telefone no código do Apps Script;
- limitação de repetição do mesmo telefone por 60 segundos no Apps Script;
- HTTPS e HSTS fornecidos pelo GitHub Pages;
- fontes de design e intermediários removidos do conteúdo publicado;
- nenhum pacote de runtime ou segredo privado armazenado no repositório.

## Riscos residuais e ações externas

### Alta prioridade: Firebase App Check

O formulário é público e o Firestore aceita criação anônima. As regras impedem leitura e alteração, mas não oferecem rate limiting. Configure o Firebase App Check com reCAPTCHA Enterprise, monitore as métricas e depois habilite a aplicação para o Cloud Firestore.

### Média prioridade: endpoint público do Google Apps Script

A URL do App da Web precisa ser pública para receber dados do navegador e pode ser descoberta. As validações reduzem abuso simples, mas não substituem um backend autenticado. Para maior garantia, mova a sincronização para uma Cloud Function acionada pela criação do documento no Firestore.

### Média prioridade: limitações do GitHub Pages

O GitHub Pages fornece HTTPS e HSTS, mas não permite configurar todos os cabeçalhos de resposta por projeto. A CSP foi aplicada por `meta`, porém diretivas como `frame-ancestors` precisam de cabeçalho HTTP. Firebase Hosting, Cloudflare Pages ou outro host com headers configuráveis permite proteção adicional contra framing e políticas de permissões.

### Média prioridade: privacidade e LGPD

Antes de campanhas pagas, publique uma política de privacidade com controlador, finalidade, retenção, compartilhamento e canal para exercício dos direitos do titular. A frase curta abaixo do formulário não substitui uma política completa.

### Verificações no console

- restringir a chave web do Firebase aos serviços Firebase necessários e aos referenciadores de produção;
- configurar alertas de orçamento e uso no Google Cloud;
- revisar periodicamente os acessos à planilha e ao projeto Firebase;
- publicar a versão reforçada de `firebase/firestore.rules`;
- atualizar a implantação do Apps Script após mudanças em `integrations/google-sheets/Code.gs`.

## Dependências

O site não exige `npm install`. Manter zero dependências locais reduz risco de supply chain. O SDK do Firebase está fixado na versão `12.15.0` e é carregado do domínio oficial `gstatic.com`, limitado pela CSP.

## Observação

Nenhum sistema conectado à internet pode ser considerado 100% seguro. Esta auditoria reduz riscos conhecidos no escopo do repositório e registra os controles que dependem dos consoles externos.
