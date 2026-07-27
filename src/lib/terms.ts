/**
 * Standard Terms of Use / service contract shown before checkout on /comecar.
 * This is a generic template, not legal advice - have a lawyer review it before
 * relying on it commercially. Bump TERMS_VERSION whenever the text changes so
 * existing acceptances stay tied to the version they actually agreed to.
 */
export const TERMS_VERSION = "2026-07-27-v1";

export const TERMS_SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Objeto",
    body: "A MeuCasamento disponibiliza, mediante pagamento único, um site personalizado de casamento com confirmação de presença (RSVP), lista de presentes com recebimento via Pix e cartão, mural de recados e um painel administrativo, pelo prazo de vigência descrito na cláusula 3.",
  },
  {
    title: "2. Pagamento",
    body: "O acesso é liberado após a confirmação do pagamento único de R$ 49,90, processado via Mercado Pago. Nos termos do art. 49 do Código de Defesa do Consumidor, o contratante pode desistir da contratação em até 7 (sete) dias corridos após o pagamento, mediante solicitação por e-mail, com reembolso integral.",
  },
  {
    title: "3. Vigência e renovação",
    body: "O acesso é válido por 12 (doze) meses a partir da confirmação do pagamento. O contratante receberá avisos por e-mail 2 (dois) meses e 1 (um) mês antes do vencimento. A vigência pode ser renovada por mais 12 meses a qualquer momento antes do vencimento, mediante novo pagamento único, preservando todos os dados já cadastrados.",
  },
  {
    title: "4. Encerramento por vencimento",
    body: "Caso a renovação não seja feita antes do fim da vigência, ao final do prazo a plataforma enviará ao e-mail cadastrado uma cópia de todos os dados registrados (convidados, presentes, recados e configurações do site) e, em seguida, excluirá permanentemente a conta e todos os dados associados. Após a exclusão, a única forma de voltar a usar a plataforma é realizar um novo cadastro, com novo pagamento, começando do zero.",
  },
  {
    title: "5. Presentes recebidos dos convidados",
    body: "Os valores enviados pelos convidados como presentes (Pix ou cartão) são processados via Mercado Pago. As condições de repasse desses valores ao casal contratante devem ser confirmadas diretamente com a MeuCasamento antes da contratação.",
  },
  {
    title: "6. Dados pessoais",
    body: "Os dados cadastrados (nomes de convidados, telefones, mensagens do mural e dados de pagamento processados pelo Mercado Pago) são tratados conforme a Lei Geral de Proteção de Dados (LGPD) e utilizados exclusivamente para a prestação deste serviço, sendo excluídos ao final da vigência não renovada, conforme cláusula 4.",
  },
  {
    title: "7. Limitação de responsabilidade",
    body: "A plataforma é fornecida \"como está\". A MeuCasamento não se responsabiliza por indisponibilidades de terceiros (Mercado Pago, Supabase, provedores de hospedagem) nem por perdas decorrentes de uso indevido das credenciais de acesso pelo contratante.",
  },
  {
    title: "8. Disposições gerais",
    body: "Este é um modelo padrão de contrato, sujeito a alterações mediante aviso prévio. Dúvidas sobre estes termos podem ser esclarecidas antes da contratação através dos canais de suporte da plataforma.",
  },
];
