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
