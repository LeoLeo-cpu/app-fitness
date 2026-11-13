# Training Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar pausa/retomada, conclusão por série, histórico ampliado, PRs/metas e progressão sugerida ao fluxo de treino.

**Architecture:** Regras de domínio ficam em utilitários puros e testáveis; `Workout.jsx`, `WorkoutCard.jsx` e `History.jsx` apenas armazenam estado e renderizam os resultados. Os novos campos serão opcionais para manter sessões antigas compatíveis.

**Tech Stack:** React 19, hooks existentes, `useLocalStorage`, Vitest, Testing Library, CSS atual.

**Spec:** `docs/superpowers/specs/2026-11-13-training-flow-design.md`

## Global Constraints

- Não adicionar dependências.
- Preservar sessões antigas sem `durationSeconds`, `volume`, `maxLoad` ou `completedSets`.
- Pausar congela cronômetros e estado; retomar continua do mesmo ponto.
- Progressão só aparece com dados válidos da sessão anterior.

## Review Focus

- Sessão antiga sem campos novos deve continuar renderizando — teste em `History`.
- Série vazia ou com texto inválido não pode inflar volume/PR — teste em `workoutProgress`.
- Pausa durante timer de descanso não pode consumir tempo — teste em `Workout`.
- Alterar número de séries não pode perder os dados já digitados — teste em `WorkoutCard`.
- Meta zerada ou ausente não pode renderizar porcentagem inválida — teste em `workoutGoals`.

### Task 1: Regras de progresso e metas

**Files:**
- Create: `src/utils/workoutProgress.js`
- Create: `src/utils/workoutGoals.js`
- Test: `src/utils/workoutProgress.test.js`
- Test: `src/utils/workoutGoals.test.js`

- [ ] Escrever testes falhos para `getCompletedSetCount`, `getSessionVolume`, `getMaxLoad`, `getProgressionSuggestion`, `getPersonalRecords` e `getGoalProgress`.
- [ ] Executar os testes e confirmar falha por funções ausentes.
- [ ] Implementar funções puras com coerção segura de números e retorno estável para dados vazios.
- [ ] Executar os testes e confirmar aprovação.
- [ ] Commitar `feat: add workout progress domain rules`.

### Task 2: Pausa e retomada persistentes

**Files:**
- Modify: `src/pages/Workout.jsx`
- Test: `src/pages/Workout.test.jsx`

- [ ] Escrever teste falho para pausar, manter logs/cronômetros e retomar sem alterar o ciclo.
- [ ] Executar o teste e confirmar falha pelo controle inexistente.
- [ ] Adicionar estado persistido `fitness_active_session_paused`, handlers `pauseWorkout`/`resumeWorkout` e congelamento dos intervalos.
- [ ] Executar o teste e confirmar aprovação.
- [ ] Commitar `feat: add workout pause and resume`.

### Task 3: Conclusão individual de séries e progressão

**Files:**
- Modify: `src/components/WorkoutCard.jsx`
- Modify: `src/pages/Workout.jsx`
- Test: `src/components/WorkoutCard.test.jsx`

- [ ] Escrever testes falhos para marcar/desmarcar uma série, atualizar o resumo e exibir a sugestão da utilidade de progresso.
- [ ] Executar os testes e confirmar falha.
- [ ] Adicionar `completed` por série, controles acessíveis e callback de atualização sem apagar valores.
- [ ] Passar a sugestão calculada para o card e exibi-la de forma discreta.
- [ ] Executar os testes e confirmar aprovação.
- [ ] Commitar `feat: track individual workout sets`.

### Task 4: Sessão concluída e histórico ampliado

**Files:**
- Modify: `src/pages/Workout.jsx`
- Modify: `src/pages/History.jsx`
- Test: `src/pages/Workout.test.jsx`

- [ ] Escrever testes falhos para persistir duração, volume, carga máxima e séries concluídas, e renderizar sessões antigas sem esses campos.
- [ ] Executar os testes e confirmar falha.
- [ ] Montar o resumo da sessão na conclusão e renderizar cards/resumos compatíveis no Histórico.
- [ ] Executar os testes e confirmar aprovação.
- [ ] Commitar `feat: enrich workout history`.

### Task 5: PRs e metas

**Files:**
- Modify: `src/pages/History.jsx`
- Modify: `src/pages/Workout.jsx`
- Modify: `src/index.css`
- Test: `src/utils/workoutGoals.test.js`

- [ ] Escrever testes falhos para PR de carga/volume e metas ausentes, zeradas e atingidas.
- [ ] Executar os testes e confirmar falha.
- [ ] Adicionar resumo de PRs e metas locais com progresso visual sem bloquear o treino.
- [ ] Executar os testes e confirmar aprovação.
- [ ] Commitar `feat: add personal records and workout goals`.

### Task 6: Verificação final

- [ ] Executar `npm test`.
- [ ] Executar `npm run lint`.
- [ ] Executar `npm run build`.
- [ ] Executar `git diff --check`.
- [ ] Revisar compatibilidade de sessões antigas e comportamento mobile.
