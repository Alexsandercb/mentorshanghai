# Mentor Shanghai

Landing page estática da Shanghai Pneus para captação de leads. Os dados são persistidos no Cloud Firestore e sincronizados com uma planilha Google por um App da Web do Google Apps Script.

## Estrutura

```text
.
├── index.html
├── assets/
│   ├── css/                 # Estilos da landing page
│   ├── js/                  # Aplicação e configurações públicas
│   ├── icons/               # Favicon e ícone para dispositivos Apple
│   ├── images/              # Marca, conteúdo, SEO e prova social
│   ├── graphics/            # Elementos vetoriais
│   └── textures/            # Texturas visuais
├── firebase/
│   └── firestore.rules      # Regras de acesso e validação dos leads
├── integrations/
│   └── google-sheets/Code.gs
├── docs/
│   ├── google-sheets-setup.md
│   └── security-audit.md
├── firebase.json
├── robots.txt
└── sitemap.xml
```

Os arquivos-fonte pesados usados no processo de design ficam em `design-sources/`, que não é versionado nem publicado.

## Desenvolvimento local

O projeto não possui dependências de runtime ou etapa de build. Na raiz, execute:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000`.

Para verificar referências, separação de arquivos e presença da CSP:

```bash
node scripts/check-project.mjs
```

## Publicação

O site é publicado pelo GitHub Pages a partir da branch `main`. Antes de publicar alterações na integração, valide:

- regras do Firestore;
- resposta do App da Web do Sheets;
- envio completo do formulário;
- caminhos dos assets e metadados sociais.

## Segurança

Consulte [docs/security-audit.md](docs/security-audit.md). A configuração do Firebase presente no navegador é pública por design; a autorização depende das regras do Firestore e do App Check.
