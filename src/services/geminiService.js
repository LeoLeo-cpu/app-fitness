import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateWorkoutPlan(apiKey, userProfile, answers) {
  if (!apiKey) throw new Error('API Key não configurada.');
  
  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
Você é um personal trainer especialista e esportivo.
Perfil do usuário: ${userProfile.age || 30} anos, ${userProfile.weight || 75}kg, ${userProfile.height || 175}cm, Sexo ${userProfile.gender || 'Masculino'}.
Respostas do questionário do usuário:
- Objetivo principal: ${answers.goal}
- Local de treino: ${answers.location}
- Frequência: ${answers.frequency}
- Restrições/Dores: ${answers.restrictions}
- Nível de experiência: ${answers.experience}

Crie um plano de treino dividido estritamente em Push (Empurrar), Pull (Puxar) e Legs (Pernas), adaptado a este perfil e que respeite a frequência solicitada (${answers.frequency}). Ajuste o volume e intensidade baseado nos dias de treino. Se ele treinar apenas 3 dias, o treino de cada grupo pode ser um pouco mais volumoso.
Gere IDs únicos simples (ex: p1, pu1, l1).
Se o usuário tiver dor no ombro e algum exercício envolver pressão excessiva sobre a cabeça ou abdução pesada, marque "attentionShoulder" como true. Senão, false.

Retorne ESTRITAMENTE E APENAS um objeto JSON válido sem formatações Markdown (não use \`\`\`json) no seguinte formato exato:
{
  "Push": [ { "id": "p1", "name": "Exemplo Supino", "sets": 3, "repRange": "8-12", "suggestedLoad": "10", "attentionShoulder": false, "alternatives": ["Supino Máquina", "Flexão de Braço"], "searchQuery": "como fazer supino reto corretamente" } ],
  "Pull": [ ],
  "Legs": [ ]
}
`;

  try {
    let model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (e) {
      if (e.message && e.message.includes('not found')) {
        model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' }); // fallback to 3.5
        result = await model.generateContent(prompt);
      } else {
        throw e;
      }
    }
    
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Erro na API do Gemini:', error);
    let errorMsg = error.message;
    if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      errorMsg = "A chave não possui acesso aos modelos mais recentes ou foi gerada no local errado. Certifique-se de gerar a chave no 'Google AI Studio' (aistudio.google.com) e não no Google Cloud Platform.";
    } else if (errorMsg.includes('API key not valid')) {
      errorMsg = "A chave da API é inválida. Verifique se copiou corretamente (sem espaços no final).";
    }
    throw new Error('Falha ao gerar treino: ' + errorMsg);
  }
}

export async function generateDietPlan(apiKey, profile, mealsCount, previousPlanStr, userFeedback) {
  if (!apiKey) throw new Error('API Key não configurada.');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  let prompt = `
Você é um nutricionista esportivo de elite. Seu objetivo é criar ou ajustar um cardápio de 1 dia para o usuário.
O usuário tem as seguintes metas diárias calculadas:
- Calorias Totais Alvo: ${profile.calTarget} kcal
- Proteínas: ${profile.macros?.protein}g
- Carboidratos: ${profile.macros?.carbs}g
- Gorduras: ${profile.macros?.fat}g

O usuário solicitou que a dieta seja dividida em ${mealsCount} refeições ao longo do dia.
Sua sugestão DEVE tentar atingir as metas calóricas e de macronutrientes da melhor forma possível, distribuindo de maneira inteligente. Forneça quantidades de calorias e gramas de macros reais para os alimentos sugeridos.
`;

  if (previousPlanStr && userFeedback) {
    prompt += `
ATENÇÃO: O usuário pediu uma alteração no cardápio anterior. 
Cardápio anterior gerado: ${previousPlanStr}
Pedido de alteração do usuário: "${userFeedback}"

Faça as alterações solicitadas e regenere o plano inteiro.
`;
  }

  prompt += `
Retorne ESTRITAMENTE E APENAS um objeto JSON válido sem formatações Markdown (não use \`\`\`json) no seguinte formato exato:
{
  "plan": [
    {
      "mealName": "Nome da Refeição (ex: Café da Manhã)",
      "foods": [
        { "name": "Nome do Alimento", "calories": 150, "protein": 10, "carbs": 20, "fat": 5 }
      ]
    }
  ]
}
`;

  try {
    let model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (e) {
      if (e.message && e.message.includes('not found')) {
        model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
        result = await model.generateContent(prompt);
      } else {
        throw e;
      }
    }
    
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Erro na API do Gemini (Dieta):', error);
    let errorMsg = error.message;
    if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      errorMsg = "A chave não possui acesso aos modelos mais recentes ou foi gerada no local errado. Certifique-se de gerar a chave no 'Google AI Studio' (aistudio.google.com).";
    } else if (errorMsg.includes('API key not valid')) {
      errorMsg = "A chave da API é inválida. Verifique se copiou corretamente (sem espaços no final).";
    }
    throw new Error('Falha ao gerar cardápio: ' + errorMsg);
  }
}
