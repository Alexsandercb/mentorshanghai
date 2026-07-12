/**
 * Integração Mentor Shanghai -> Google Sheets
 *
 * 1. Crie uma planilha no Google Sheets.
 * 2. Copie o ID da URL e substitua PLANILHA_ID abaixo.
 * 3. Cole este arquivo em Extensões > Apps Script.
 * 4. Implante como app da Web, executando como você e permitindo acesso a qualquer pessoa.
 */

const PLANILHA_ID = 'COLE_AQUI_O_ID_DA_PLANILHA';
const NOME_DA_ABA = 'Leads';
const ORIGENS_PERMITIDAS = [
  'https://alexsandercb.github.io/mentorshanghai/'
];

const CABECALHOS = [
  'Data e hora',
  'ID do lead',
  'Nome',
  'WhatsApp',
  'Cidade / Estado',
  'Já vendeu pneus?',
  'Experiência no mercado',
  'Origem'
];

const EXPERIENCIA = {
  iniciante: 'Está começando agora',
  conheco: 'Já conhece o mercado',
  atuo: 'Já trabalha no setor',
  empresa: 'Tem loja ou distribuidora'
};

function doGet() {
  return respostaJson_({ ok: true, servico: 'Mentor Shanghai Leads' });
}

function doPost(evento) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const dados = JSON.parse(evento.postData.contents || '{}');
    validarLead_(dados);

    const planilha = SpreadsheetApp.openById(PLANILHA_ID);
    const aba = prepararAba_(planilha);
    const cache = CacheService.getScriptCache();
    const chaveTelefone = 'telefone:' + hash_(dados.whatsapp);

    if (leadJaExiste_(aba, dados.lead_id) || cache.get(chaveTelefone)) {
      return respostaJson_({ ok: true, duplicado: true });
    }

    aba.appendRow([
      new Date(dados.created_at),
      textoSeguro_(dados.lead_id),
      textoSeguro_(dados.name),
      textoSeguro_(dados.whatsapp),
      textoSeguro_(dados.city),
      dados.sold_before === 'sim' ? 'Sim' : 'Não',
      EXPERIENCIA[dados.market_level],
      textoSeguro_(dados.source)
    ]);

    const ultimaLinha = aba.getLastRow();
    aba.getRange(ultimaLinha, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
    cache.put(chaveTelefone, '1', 60);

    return respostaJson_({ ok: true });
  } catch (erro) {
    console.error(erro);
    return respostaJson_({ ok: false, erro: String(erro.message || erro) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function prepararAba_(planilha) {
  let aba = planilha.getSheetByName(NOME_DA_ABA);
  if (!aba) aba = planilha.insertSheet(NOME_DA_ABA);

  if (aba.getLastRow() === 0) {
    aba.getRange(1, 1, 1, CABECALHOS.length).setValues([CABECALHOS]);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, CABECALHOS.length)
      .setBackground('#101010')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    aba.setColumnWidth(1, 155);
    aba.setColumnWidth(2, 190);
    aba.setColumnWidth(3, 210);
    aba.setColumnWidth(4, 150);
    aba.setColumnWidth(5, 180);
    aba.setColumnWidth(6, 150);
    aba.setColumnWidth(7, 210);
    aba.setColumnWidth(8, 280);
  }

  return aba;
}

function leadJaExiste_(aba, leadId) {
  if (aba.getLastRow() < 2) return false;
  return Boolean(
    aba.getRange(2, 2, aba.getLastRow() - 1, 1)
      .createTextFinder(String(leadId))
      .matchEntireCell(true)
      .findNext()
  );
}

function validarLead_(dados) {
  const camposTexto = ['lead_id', 'name', 'whatsapp', 'city', 'created_at', 'source'];
  camposTexto.forEach((campo) => {
    if (typeof dados[campo] !== 'string' || !dados[campo].trim()) {
      throw new Error('Campo inválido: ' + campo);
    }
  });

  if (!['sim', 'nao'].includes(dados.sold_before)) {
    throw new Error('Resposta de venda inválida.');
  }

  if (!Object.prototype.hasOwnProperty.call(EXPERIENCIA, dados.market_level)) {
    throw new Error('Experiência de mercado inválida.');
  }

  if (!/^[A-Za-z0-9_-]{10,150}$/.test(dados.lead_id)) {
    throw new Error('ID do lead inválido.');
  }

  if (!/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/.test(dados.whatsapp)) {
    throw new Error('WhatsApp inválido.');
  }

  const dataCriacao = new Date(dados.created_at);
  if (isNaN(dataCriacao.getTime()) || Math.abs(Date.now() - dataCriacao.getTime()) > 86400000) {
    throw new Error('Data do lead inválida.');
  }

  if (!ORIGENS_PERMITIDAS.some((origem) => dados.source.startsWith(origem))) {
    throw new Error('Origem não permitida.');
  }

  if (dados.name.length < 2 || dados.name.length > 120 || dados.city.length < 2 || dados.city.length > 120 || dados.source.length > 500) {
    throw new Error('Um ou mais campos excedem o limite permitido.');
  }
}

function hash_(valor) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(valor))
    .map((byte) => ('0' + (byte & 255).toString(16)).slice(-2))
    .join('');
}

function textoSeguro_(valor) {
  const texto = String(valor || '').trim();
  return /^[=+\-@]/.test(texto) ? "'" + texto : texto;
}

function respostaJson_(conteudo) {
  return ContentService
    .createTextOutput(JSON.stringify(conteudo))
    .setMimeType(ContentService.MimeType.JSON);
}
