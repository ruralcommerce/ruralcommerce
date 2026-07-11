export type ProjectAgreementLocaleKey = 'es' | 'pt-BR' | 'en';

export type ProjectAgreementCopy = {
  title: string;
  intro: string;
  agreementHeading: string;
  agreementParagraphs: string[];
  networkHeading: string;
  networkText: string;
  benefitsHeading: string;
  benefitsText: string;
  imageRightsHeading: string;
  imageRightsText: string;
  commitmentHeading: string;
  commitmentText: string;
  communicationsHeading: string;
  communicationsText: string;
  networkCheckbox: string;
  imageRightsCheckbox: string;
  commitmentCheckbox: string;
  communicationsCheckbox: string;
};

/**
 * Legal text for the participation agreement (convenio).
 * Review with legal counsel before production use.
 */
export const projectAgreementCopy: Record<ProjectAgreementLocaleKey, ProjectAgreementCopy> = {
  es: {
    title: 'Convenio de Participación y Compromiso: Proyecto Impulso MiPyMEs: digitaliza Los Santos',
    intro:
      'Este documento formaliza tu ingreso al Proyecto "Impulso MiPyMEs: digitaliza Los Santos", ejecutado por Rural Commerce. Léelo con atención: acceder a los beneficios del programa requiere aceptar estos términos y comprometerse activamente con las metas del proyecto.',
    agreementHeading: '1. Objeto y naturaleza de la participación',
    agreementParagraphs: [
      'El presente convenio regula la participación de la organización o MiPyME en el proyecto "Impulso MiPyMEs: digitaliza Los Santos", ejecutado por Rural Commerce y sus aliados estratégicos. Al firmarlo electrónicamente, la persona representante declara contar con facultades para obligar a su organización, que la información entregada es veraz y que la participación es voluntaria.',
      'El programa tiene como fin el fortalecimiento productivo, la adopción de tecnologías de bajo costo, la economía circular a través de una biorrefinería/maquila compartida y la preparación para la exportación. La participación no constituye una relación laboral, de sociedad mercantil ni de mandato comercial exclusivo.',
      'Propiedad y confidencialidad de datos: el beneficiario mantendrá la propiedad sobre su información operativa y técnica. Rural Commerce podrá utilizar datos del diagnóstico y del acompañamiento de manera estrictamente agregada, anonimizada o no sensible para informes de impacto, lecciones aprendidas y reportes a aliados, garantizando que no se divulgue información comercial privada.',
    ],
    networkHeading: '2. Actividades del proyecto e ingreso a la red',
    networkText:
      'Al firmar este convenio, la organización se integra a la red que será desarrollada. Esta participación implica involucrarse activamente en las actividades núcleo: completar el diagnóstico de línea base, cumplir con las horas de capacitación técnica, adoptar herramientas digitales y sensores (nodos de automatización), elaborar planes de exportación e integrarse al mecanismo de comercialización colaborativa. Se entiende que podrán surgir actividades derivadas o complementarias durante la ejecución.',
    benefitsHeading: '3. Beneficios del programa y condición de participación activa',
    benefitsText:
      'Los beneficios asociados —que incluyen capacitación, articulación comercial como red y acceso a la maquila compartida— están condicionados a una asistencia constante. Rural Commerce podrá suspender, diferir o finalizar el acceso a los beneficios si se verifica inasistencia reiterada, falta de compromiso en la adopción tecnológica, incumplimiento de plazos o una conducta incompatible con la red.',
    imageRightsHeading: '4. Derechos de imagen, voz y testimonio',
    imageRightsText:
      'Autorizo el uso de la imagen, voz, nombre, organización y testimonio de la persona firmante y de la organización representada, así como de material audiovisual captado durante las actividades del proyecto (sesiones, visitas de campo, ferias), con fines educativos, de comunicación institucional y reportes de impacto del programa, en medios digitales o impresos, sin límite de tiempo y sin contraprestación económica adicional.',
    commitmentHeading: '5. Compromiso operativo y de sostenibilidad',
    commitmentText:
      'Me comprometo, en nombre propio y de la organización, a participar activamente: asistir a las capacitaciones, facilitar la instalación de equipos, aplicar las prácticas de gestión empresarial recomendadas, colaborar en el modelo de ventas conjuntas, mantener las normativas de calidad (ej. trazabilidad básica) y actuar con transparencia. Entiendo que mi esfuerzo es clave para lograr la autonomía técnica tras el cierre del proyecto.',
    communicationsHeading: '6. Autorización de comunicaciones',
    communicationsText:
      'Autorizo expresamente al equipo del proyecto "Impulso MiPyMEs: digitaliza Los Santos" a contactarme y enviarme información, convocatorias, recordatorios, material de capacitación y cualquier otra comunicación oficial relacionada con la ejecución del programa. Acepto que estas comunicaciones se realicen a través de correo electrónico, llamadas telefónicas, WhatsApp y notificaciones push en mi teléfono celular o dispositivos móviles.',
    networkCheckbox: 'Acepto integrar la red y comprometerme con sus actividades clave.',
    imageRightsCheckbox:
      'Acepto la cesión de derechos de imagen, voz y testimonio descrita en la sección 4 para la documentación del proyecto.',
    commitmentCheckbox:
      'Acepto el compromiso operativo, la confidencialidad de datos y los objetivos de sostenibilidad descritos en la sección 5.',
    communicationsCheckbox:
      'Acepto recibir comunicaciones oficiales del proyecto a través de correo electrónico, llamadas, WhatsApp y notificaciones push en mi teléfono celular.',
  },
  'pt-BR': {
    title: 'Convênio de Participação e Compromisso: Projeto Impulso MiPyMEs: digitaliza Los Santos',
    intro:
      'Este documento formaliza sua entrada no Projeto "Impulso MiPyMEs: digitaliza Los Santos", executado pela Rural Commerce. Leia com atenção: acessar os benefícios do programa exige aceitar estes termos e comprometer-se ativamente com as metas do projeto.',
    agreementHeading: '1. Objeto e natureza da participação',
    agreementParagraphs: [
      'Este convênio regula a participação da organização ou MPME no projeto "Impulso MiPyMEs: digitaliza Los Santos", executado pela Rural Commerce e seus aliados estratégicos. Ao assiná-lo eletronicamente, a pessoa representante declara ter poderes para vincular sua organização, que as informações fornecidas são verdadeiras e que a participação é voluntária.',
      'O programa tem como finalidade o fortalecimento produtivo, a adoção de tecnologias de baixo custo, a economia circular por meio de uma biorrefinaria/maquila compartilhada e a preparação para exportação. A participação não constitui relação de emprego, sociedade comercial ou mandato comercial exclusivo.',
      'Propriedade e confidencialidade de dados: o beneficiário manterá a propriedade sobre suas informações operacionais e técnicas. A Rural Commerce poderá utilizar dados do diagnóstico e do acompanhamento de forma estritamente agregada, anonimizada ou não sensível para relatórios de impacto, lições aprendidas e reportes a aliados, garantindo que informações comerciais privadas não sejam divulgadas.',
    ],
    networkHeading: '2. Atividades do projeto e ingresso na rede',
    networkText:
      'Ao assinar este convênio, a organização integra-se à rede que será desenvolvida. Essa participação implica envolvimento ativo nas atividades centrais: concluir o diagnóstico de linha de base, cumprir as horas de capacitação técnica, adotar ferramentas digitais e sensores (nós de automação), elaborar planos de exportação e integrar-se ao mecanismo de comercialização colaborativa. Entende-se que poderão surgir atividades derivadas ou complementares durante a execução.',
    benefitsHeading: '3. Benefícios do programa e condição de participação ativa',
    benefitsText:
      'Os benefícios associados — incluindo capacitação, articulação comercial como rede e acesso à maquila compartilhada — estão condicionados à assiduidade constante. A Rural Commerce poderá suspender, diferir ou encerrar o acesso aos benefícios se houver ausência reiterada, falta de compromisso na adoção tecnológica, descumprimento de prazos ou conduta incompatível com a rede.',
    imageRightsHeading: '4. Direitos de imagem, voz e depoimento',
    imageRightsText:
      'Autorizo o uso da imagem, voz, nome, organização e depoimento da pessoa signatária e da organização representada, bem como de material audiovisual captado durante as atividades do projeto (sessões, visitas de campo, feiras), para fins educativos, de comunicação institucional e relatórios de impacto do programa, em mídias digitais ou impressas, por prazo indeterminado e sem contrapartida financeira adicional.',
    commitmentHeading: '5. Compromisso operacional e de sustentabilidade',
    commitmentText:
      'Comprometo-me, em nome próprio e da organização, a participar ativamente: comparecer às capacitações, facilitar a instalação de equipamentos, aplicar as práticas de gestão empresarial recomendadas, colaborar no modelo de vendas conjuntas, manter as normas de qualidade (ex.: rastreabilidade básica) e agir com transparência. Entendo que meu esforço é fundamental para alcançar a autonomia técnica após o encerramento do projeto.',
    communicationsHeading: '6. Autorização de comunicações',
    communicationsText:
      'Autorizo expressamente a equipe do projeto "Impulso MiPyMEs: digitaliza Los Santos" a entrar em contato comigo e enviar informações, convocações, lembretes, material de capacitação e qualquer outra comunicação oficial relacionada à execução do programa. Aceito que essas comunicações sejam realizadas por e-mail, ligações telefônicas, WhatsApp e notificações push no meu celular ou dispositivos móveis.',
    networkCheckbox: 'Aceito integrar a rede e comprometer-me com suas atividades-chave.',
    imageRightsCheckbox:
      'Aceito a cessão de direitos de imagem, voz e depoimento descrita na seção 4 para a documentação do projeto.',
    commitmentCheckbox:
      'Aceito o compromisso operacional, a confidencialidade de dados e os objetivos de sustentabilidade descritos na seção 5.',
    communicationsCheckbox:
      'Aceito receber comunicações oficiais do projeto por e-mail, ligações, WhatsApp e notificações push no meu celular.',
  },
  en: {
    title: 'Participation and Commitment Agreement: Impulso MiPyMEs: digitaliza Los Santos Project',
    intro:
      'This document formalizes your entry into the "Impulso MiPyMEs: digitaliza Los Santos" Project, executed by Rural Commerce. Read it carefully: accessing program benefits requires accepting these terms and actively committing to the project goals.',
    agreementHeading: '1. Purpose and nature of participation',
    agreementParagraphs: [
      'This agreement governs the participation of the organization or MSME in the "Impulso MiPyMEs: digitaliza Los Santos" project, executed by Rural Commerce and its strategic partners. By signing electronically, the representative declares authority to bind their organization, that the information provided is truthful and that participation is voluntary.',
      'The program aims to strengthen productive capacity, adopt low-cost technologies, promote circular economy through a shared biorefinery/maquila, and prepare for export. Participation does not create an employment, commercial partnership or exclusive commercial agency relationship.',
      'Data ownership and confidentiality: the beneficiary will retain ownership of their operational and technical information. Rural Commerce may use diagnosis and support data in a strictly aggregated, anonymized or non-sensitive manner for impact reports, lessons learned and partner reporting, ensuring that private commercial information is not disclosed.',
    ],
    networkHeading: '2. Project activities and network membership',
    networkText:
      'By signing this agreement, the organization joins the network to be developed. Participation implies active involvement in core activities: completing the baseline diagnosis, fulfilling technical training hours, adopting digital tools and sensors (automation nodes), developing export plans and integrating into the collaborative commercialization mechanism. Derived or complementary activities may arise during implementation.',
    benefitsHeading: '3. Program benefits and active participation requirement',
    benefitsText:
      'Associated benefits — including training, commercial articulation as a network and access to the shared maquila — are conditional on consistent attendance. Rural Commerce may suspend, defer or end access to benefits if repeated absence, lack of commitment to technology adoption, failure to meet deadlines or conduct incompatible with the network is verified.',
    imageRightsHeading: '4. Image, voice and testimony rights',
    imageRightsText:
      'I authorize the use of the image, voice, name, organization and testimony of the signatory and the represented organization, as well as audiovisual material captured during project activities (sessions, field visits, fairs), for educational purposes, institutional communication and program impact reports, in digital or print media, with no time limit and no additional financial compensation.',
    commitmentHeading: '5. Operational and sustainability commitment',
    commitmentText:
      'I commit, on my own behalf and on behalf of the organization, to participate actively: attend training sessions, facilitate equipment installation, apply recommended business management practices, collaborate in the joint sales model, maintain quality standards (e.g. basic traceability) and act transparently. I understand that my effort is key to achieving technical autonomy after project closure.',
    communicationsHeading: '6. Communications authorization',
    communicationsText:
      'I expressly authorize the "Impulso MiPyMEs: digitaliza Los Santos" project team to contact me and send information, invitations, reminders, training materials and any other official communication related to program implementation. I accept that these communications may be sent by email, phone calls, WhatsApp and push notifications to my mobile phone or devices.',
    networkCheckbox: 'I accept joining the network and committing to its key activities.',
    imageRightsCheckbox:
      'I accept the image, voice and testimony assignment described in section 4 for project documentation.',
    commitmentCheckbox:
      'I accept the operational commitment, data confidentiality and sustainability objectives described in section 5.',
    communicationsCheckbox:
      'I accept receiving official project communications by email, phone calls, WhatsApp and push notifications on my mobile phone.',
  },
};

export function getProjectAgreementCopy(locale?: string): ProjectAgreementCopy {
  const key: ProjectAgreementLocaleKey =
    locale === 'pt-BR' || locale === 'en' ? locale : 'es';
  return projectAgreementCopy[key];
}
