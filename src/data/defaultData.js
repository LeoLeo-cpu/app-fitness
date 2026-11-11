export const DEFAULT_WORKOUT_PLAN = {
  Push: [
    { id: 'p1', name: 'Supino Reto com Halteres', sets: 3, repRange: '8-12', suggestedLoad: '15', attentionShoulder: true },
    { id: 'p2', name: 'Desenvolvimento com Halteres', sets: 3, repRange: '8-12', suggestedLoad: '10', attentionShoulder: true },
    { id: 'p3', name: 'Elevação Lateral', sets: 3, repRange: '12-15', suggestedLoad: '8', attentionShoulder: false },
    { id: 'p4', name: 'Tríceps na Polia', sets: 3, repRange: '10-15', suggestedLoad: '20', attentionShoulder: false }
  ],
  Pull: [
    { id: 'pu1', name: 'Puxada Alta', sets: 3, repRange: '8-12', suggestedLoad: '40', attentionShoulder: true },
    { id: 'pu2', name: 'Remada Curvada', sets: 3, repRange: '8-12', suggestedLoad: '30', attentionShoulder: false },
    { id: 'pu3', name: 'Crucifixo Inverso', sets: 3, repRange: '12-15', suggestedLoad: '5', attentionShoulder: false },
    { id: 'pu4', name: 'Rosca Direta', sets: 3, repRange: '10-15', suggestedLoad: '12', attentionShoulder: false }
  ],
  Legs: [
    { id: 'l1', name: 'Agachamento', sets: 3, repRange: '8-12', suggestedLoad: '40', attentionShoulder: false },
    { id: 'l2', name: 'Leg Press', sets: 3, repRange: '10-15', suggestedLoad: '100', attentionShoulder: false },
    { id: 'l3', name: 'Cadeira Extensora', sets: 3, repRange: '12-15', suggestedLoad: '30', attentionShoulder: false },
    { id: 'l4', name: 'Mesa Flexora', sets: 3, repRange: '12-15', suggestedLoad: '30', attentionShoulder: false },
    { id: 'l5', name: 'Panturrilha', sets: 4, repRange: '15-20', suggestedLoad: '20', attentionShoulder: false }
  ]
};

export const DEFAULT_USER_PROFILE = {
  name: 'Alex',
  weight: '',
  height: '',
  age: '',
  gender: 'M',
  activityLevel: 1.2,
  tmb: 0,
  calTarget: 0,
  macros: { protein: 0, carbs: 0, fat: 0 },
  restTimer: 60
};

export const WORKOUT_CYCLE = ['Push', 'Pull', 'Legs', 'Rest'];

// Rotinas pré-definidas baseadas no Guia de Divisões de Treino
export const PRESET_ROUTINES = [
  {
    id: 'ppl_classic',
    title: 'PPL Clássico (Push / Pull / Legs)',
    category: 'PPL',
    frequency: '3 a 6 dias/sem',
    duration: '45-55 min',
    intensity: 'Intermediário',
    desc: 'Organização biomecânica clássica agrupando músculos empurrar, puxar e pernas com máxima recuperação.',
    cycle: ['Push', 'Pull', 'Legs', 'Descanso'],
    plan: {
      Push: [
        { id: 'ppl_p1', name: 'Supino Reto com Halteres', sets: 4, repRange: '8-10', suggestedLoad: '20', attentionShoulder: true },
        { id: 'ppl_p2', name: 'Desenvolvimento Militar', sets: 3, repRange: '8-12', suggestedLoad: '12', attentionShoulder: true },
        { id: 'ppl_p3', name: 'Elevação Lateral', sets: 4, repRange: '12-15', suggestedLoad: '8', attentionShoulder: false },
        { id: 'ppl_p4', name: 'Tríceps Corda na Polia', sets: 3, repRange: '10-12', suggestedLoad: '25', attentionShoulder: false }
      ],
      Pull: [
        { id: 'ppl_pu1', name: 'Puxada Frontal Aberta', sets: 4, repRange: '8-10', suggestedLoad: '45', attentionShoulder: false },
        { id: 'ppl_pu2', name: 'Remada Baixa Triângulo', sets: 3, repRange: '10-12', suggestedLoad: '40', attentionShoulder: false },
        { id: 'ppl_pu3', name: 'Crucifixo Inverso', sets: 3, repRange: '12-15', suggestedLoad: '7', attentionShoulder: false },
        { id: 'ppl_pu4', name: 'Rosca Martelo', sets: 3, repRange: '10-12', suggestedLoad: '12', attentionShoulder: false }
      ],
      Legs: [
        { id: 'ppl_l1', name: 'Agachamento Livre com Barra', sets: 4, repRange: '8-10', suggestedLoad: '50', attentionShoulder: false },
        { id: 'ppl_l2', name: 'Leg Press 45°', sets: 3, repRange: '10-12', suggestedLoad: '120', attentionShoulder: false },
        { id: 'ppl_l3', name: 'Cadeira Extensora', sets: 3, repRange: '12-15', suggestedLoad: '35', attentionShoulder: false },
        { id: 'ppl_l4', name: 'Mesa Flexora', sets: 3, repRange: '10-12', suggestedLoad: '30', attentionShoulder: false },
        { id: 'ppl_l5', name: 'Panturrilha em Pé', sets: 4, repRange: '15-20', suggestedLoad: '40', attentionShoulder: false }
      ]
    }
  },
  {
    id: 'upper_lower',
    title: 'Upper / Lower (Superior & Inferior)',
    category: 'Upper/Lower',
    frequency: '4 dias/sem',
    duration: '50 min',
    intensity: 'Intermediário',
    desc: 'Equilíbrio ideal entre frequência semanal de 2x por músculo e tempo de recuperação para hipertrofia.',
    cycle: ['Superior A', 'Inferior A', 'Descanso', 'Superior B', 'Inferior B', 'Descanso'],
    plan: {
      'Superior A': [
        { id: 'ul_s1', name: 'Supino Inclinado com Halteres', sets: 4, repRange: '8-10', suggestedLoad: '18', attentionShoulder: true },
        { id: 'ul_s2', name: 'Puxada Alta Neutra', sets: 4, repRange: '8-10', suggestedLoad: '45', attentionShoulder: false },
        { id: 'ul_s3', name: 'Elevação Lateral', sets: 3, repRange: '12-15', suggestedLoad: '8', attentionShoulder: false },
        { id: 'ul_s4', name: 'Tríceps Testa', sets: 3, repRange: '10-12', suggestedLoad: '12', attentionShoulder: false },
        { id: 'ul_s5', name: 'Rosca Scott', sets: 3, repRange: '10-12', suggestedLoad: '14', attentionShoulder: false }
      ],
      'Inferior A': [
        { id: 'ul_i1', name: 'Agachamento Livre', sets: 4, repRange: '8-10', suggestedLoad: '50', attentionShoulder: false },
        { id: 'ul_i2', name: 'RDL / Stiff com Barra', sets: 4, repRange: '8-10', suggestedLoad: '40', attentionShoulder: false },
        { id: 'ul_i3', name: 'Leg Press 45°', sets: 3, repRange: '10-12', suggestedLoad: '100', attentionShoulder: false },
        { id: 'ul_i4', name: 'Cadeira Flexora', sets: 3, repRange: '12-15', suggestedLoad: '30', attentionShoulder: false },
        { id: 'ul_i5', name: 'Panturrilha Sentado', sets: 4, repRange: '15-20', suggestedLoad: '30', attentionShoulder: false }
      ],
      'Superior B': [
        { id: 'ul_s6', name: 'Desenvolvimento com Halteres', sets: 4, repRange: '8-10', suggestedLoad: '14', attentionShoulder: true },
        { id: 'ul_s7', name: 'Remada Curvada com Barra', sets: 4, repRange: '8-10', suggestedLoad: '35', attentionShoulder: false },
        { id: 'ul_s8', name: 'Crucifixo Máquina', sets: 3, repRange: '10-12', suggestedLoad: '30', attentionShoulder: false },
        { id: 'ul_s9', name: 'Rosca Direta com Barra W', sets: 3, repRange: '10-12', suggestedLoad: '16', attentionShoulder: false },
        { id: 'ul_s10', name: 'Tríceps Francês com Halter', sets: 3, repRange: '10-12', suggestedLoad: '14', attentionShoulder: false }
      ],
      'Inferior B': [
        { id: 'ul_i6', name: 'Levantamento Terra Romeno', sets: 4, repRange: '8-10', suggestedLoad: '45', attentionShoulder: false },
        { id: 'ul_i7', name: 'Búlgaro com Halteres', sets: 3, repRange: '10-12', suggestedLoad: '12', attentionShoulder: false },
        { id: 'ul_i8', name: 'Cadeira Extensora', sets: 3, repRange: '12-15', suggestedLoad: '35', attentionShoulder: false },
        { id: 'ul_i9', name: 'Elevação Pélvica', sets: 4, repRange: '10-12', suggestedLoad: '50', attentionShoulder: false },
        { id: 'ul_i10', name: 'Panturrilha em Pé', sets: 4, repRange: '15-20', suggestedLoad: '40', attentionShoulder: false }
      ]
    }
  },
  {
    id: 'full_body',
    title: 'Full Body 3x (Corpo Inteiro)',
    category: 'Full Body',
    frequency: '3 dias/sem',
    duration: '50 min',
    intensity: 'Iniciante / Eficiente',
    desc: 'Estímulo completo do corpo 3 vezes na semana com exercícios compostos, ideal para quem tem pouco tempo.',
    cycle: ['Full Body A', 'Descanso', 'Full Body B', 'Descanso', 'Full Body C', 'Descanso'],
    plan: {
      'Full Body A': [
        { id: 'fb_1', name: 'Agachamento Livre', sets: 3, repRange: '8-10', suggestedLoad: '40', attentionShoulder: false },
        { id: 'fb_2', name: 'Supino Reto com Halteres', sets: 3, repRange: '8-10', suggestedLoad: '16', attentionShoulder: true },
        { id: 'fb_3', name: 'Puxada Frontal', sets: 3, repRange: '8-10', suggestedLoad: '40', attentionShoulder: false },
        { id: 'fb_4', name: 'Desenvolvimento com Halteres', sets: 3, repRange: '10-12', suggestedLoad: '10', attentionShoulder: true },
        { id: 'fb_5', name: 'Prancha Abdominal', sets: 3, repRange: '45-60s', suggestedLoad: '0', attentionShoulder: false }
      ],
      'Full Body B': [
        { id: 'fb_6', name: 'Levantamento Terra', sets: 3, repRange: '6-8', suggestedLoad: '50', attentionShoulder: false },
        { id: 'fb_7', name: 'Supino Inclinado com Halteres', sets: 3, repRange: '8-10', suggestedLoad: '14', attentionShoulder: true },
        { id: 'fb_8', name: 'Remada Baixa', sets: 3, repRange: '10-12', suggestedLoad: '35', attentionShoulder: false },
        { id: 'fb_9', name: 'Elevação Lateral', sets: 3, repRange: '12-15', suggestedLoad: '7', attentionShoulder: false },
        { id: 'fb_10', name: 'Panturrilha em Pé', sets: 4, repRange: '15-20', suggestedLoad: '30', attentionShoulder: false }
      ],
      'Full Body C': [
        { id: 'fb_11', name: 'Leg Press 45°', sets: 3, repRange: '10-12', suggestedLoad: '100', attentionShoulder: false },
        { id: 'fb_12', name: 'Mesa Flexora', sets: 3, repRange: '10-12', suggestedLoad: '25', attentionShoulder: false },
        { id: 'fb_13', name: 'Dips / Paralelas ou Supino Máquina', sets: 3, repRange: '8-10', suggestedLoad: '0', attentionShoulder: true },
        { id: 'fb_14', name: 'Puxada Triângulo', sets: 3, repRange: '10-12', suggestedLoad: '35', attentionShoulder: false },
        { id: 'fb_15', name: 'Rosca Direta + Tríceps Polia', sets: 3, repRange: '12', suggestedLoad: '10', attentionShoulder: false }
      ]
    }
  },
  {
    id: 'arnold_split',
    title: 'Arnold Split (Antagonistas)',
    category: 'Arnold',
    frequency: '6 dias/sem',
    duration: '55-60 min',
    intensity: 'Avançado',
    desc: 'O split lendário de Arnold Schwarzenegger combinando músculos opostos (Peito+Costas, Ombros+Braços e Pernas).',
    cycle: ['Peito & Costas', 'Ombros & Braços', 'Pernas', 'Descanso'],
    plan: {
      'Peito & Costas': [
        { id: 'arn_1', name: 'Supino Reto com Barra', sets: 4, repRange: '8-10', suggestedLoad: '30', attentionShoulder: true },
        { id: 'arn_2', name: 'Barra Fixa / Puxada Alta', sets: 4, repRange: '8-10', suggestedLoad: '40', attentionShoulder: false },
        { id: 'arn_3', name: 'Supino Inclinado com Halteres', sets: 3, repRange: '10-12', suggestedLoad: '16', attentionShoulder: true },
        { id: 'arn_4', name: 'Remada Cavalinho / Curvada', sets: 3, repRange: '10-12', suggestedLoad: '35', attentionShoulder: false },
        { id: 'arn_5', name: 'Pullover com Halter', sets: 3, repRange: '12-15', suggestedLoad: '14', attentionShoulder: true }
      ],
      'Ombros & Braços': [
        { id: 'arn_6', name: 'Desenvolvimento Arnold', sets: 4, repRange: '8-10', suggestedLoad: '12', attentionShoulder: true },
        { id: 'arn_7', name: 'Elevação Lateral na Polia', sets: 4, repRange: '12-15', suggestedLoad: '6', attentionShoulder: false },
        { id: 'arn_8', name: 'Crucifixo Inverso com Halteres', sets: 3, repRange: '12-15', suggestedLoad: '6', attentionShoulder: false },
        { id: 'arn_9', name: 'Rosca Direta Barra W', sets: 3, repRange: '10-12', suggestedLoad: '15', attentionShoulder: false },
        { id: 'arn_10', name: 'Tríceps Testa com Halteres', sets: 3, repRange: '10-12', suggestedLoad: '10', attentionShoulder: false }
      ],
      'Pernas': [
        { id: 'arn_11', name: 'Agachamento Livre', sets: 4, repRange: '8-10', suggestedLoad: '50', attentionShoulder: false },
        { id: 'arn_12', name: 'Leg Press 45°', sets: 4, repRange: '10-12', suggestedLoad: '120', attentionShoulder: false },
        { id: 'arn_13', name: 'Stiff com Barra', sets: 3, repRange: '8-10', suggestedLoad: '40', attentionShoulder: false },
        { id: 'arn_14', name: 'Cadeira Extensora', sets: 3, repRange: '12-15', suggestedLoad: '35', attentionShoulder: false },
        { id: 'arn_15', name: 'Panturrilha em Pé', sets: 4, repRange: '15-20', suggestedLoad: '45', attentionShoulder: false }
      ]
    }
  }
];
