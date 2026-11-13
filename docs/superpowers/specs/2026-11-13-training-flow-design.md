# Evolução do Fluxo de Treino

## Intenção

Tornar o treino mais resiliente para quem não consegue seguir todos os dias da semana e mais útil para progressão de força. O atleta deve conseguir pausar e retomar sem perder contexto, concluir séries individualmente, entender melhor o histórico, acompanhar PRs/metas e receber uma sugestão simples para a próxima série.

## Objetivos

- Pausar e retomar a sessão sem avançar o ciclo ou apagar o progresso.
- Registrar conclusão por série e refletir isso no progresso do exercício.
- Mostrar duração, volume, séries concluídas e carga máxima no histórico.
- Exibir PRs e metas de carga/volume de forma compreensível.
- Sugerir progressão baseada na última sessão e na faixa de repetições do exercício.

## Fora de escopo

- Sincronização em nuvem, contas ou integrações com wearables.
- Prescrição médica ou ajuste automático de uma rotina completa.
- Alteração do algoritmo de divisão semanal já configurado.

## Regras de produto

- Pausar congela o cronômetro geral, o timer de descanso e o estado da sessão; retomar continua do mesmo ponto.
- Concluir uma série não conclui o exercício inteiro. O exercício só pode ser gravado quando houver pelo menos uma série preenchida; séries não concluídas permanecem identificáveis.
- PR de carga é o maior `load` registrado para um exercício; PR de volume é o maior somatório `load × reps` por sessão.
- Metas iniciais são metas locais de carga máxima e volume semanal, configuráveis pelo usuário e sem obrigatoriedade para concluir treinos.
- Progressão recomenda primeiro atingir o topo da faixa de reps; depois sugere incremento de carga pequeno. Nunca recomenda carga quando os dados anteriores estão vazios ou inválidos.
- Dados novos são retrocompatíveis: sessões antigas sem os novos campos continuam renderizando.

## Abordagens consideradas

1. Adicionar toda a lógica nas telas existentes. Menor alteração imediata, mas duplicaria cálculos entre treino e histórico.
2. Extrair regras para utilitários de domínio e manter as telas como consumidoras. Escolhida por centralizar cálculos, facilitar testes e reduzir regressões.
3. Criar um estado global novo. Rejeitada porque o app já usa `useLocalStorage` e não precisa de outra dependência ou camada de estado.

## Desenho aprovado

- `src/utils/workoutProgress.js`: cálculo de séries concluídas, volume, carga máxima, PRs e sugestão de progressão.
- `src/utils/workoutGoals.js`: leitura e cálculo de metas de carga/volume.
- `src/pages/Workout.jsx`: estado persistido de pausa/retomada, passagem das metas e gravação dos novos campos da sessão.
- `src/components/WorkoutCard.jsx`: checkboxes/botões por série, resumo de progresso e sugestão contextual.
- `src/pages/History.jsx`: cards/resumos de duração, volume, PRs e metas.
- Testes unitários para regras de domínio e testes de componente para pausa, série individual e histórico.

## Critérios de sucesso

- Uma sessão pausada pode ser retomada sem alterar séries ou duração já acumulada.
- O atleta consegue distinguir séries concluídas de séries ainda pendentes.
- Uma sessão concluída contém duração, volume, carga máxima e séries concluídas.
- PRs e metas são calculados de forma consistente no treino e no histórico.
- Sugestões são determinísticas, explicáveis e não aparecem quando faltam dados.
