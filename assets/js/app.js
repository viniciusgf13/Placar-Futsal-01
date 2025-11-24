let state = {
            teams: [],
            history: [],
            currentMatch: {
                home: null,
                away: null,
                timeLeft: 600,
                running: false,
                events: [],
                score: { home: 0, away: 0 }
            },
            goalRegistration: {
                selectedTeamSide: 'home',
                selectedScorer: null,
                selectedAssist: null
            },
            theme: 'light',
            bestDefenseVotes: {}
        };

        let timerInterval = null;

        function uid(prefix = 'id') {
            return `${prefix}_${Math.random().toString(36).slice(2,9)}`;
        }

        function loadState() {
            try {
                const teams = localStorage.getItem('futsal_teams_v2');
                const history = localStorage.getItem('futsal_history_v2');
                const theme = localStorage.getItem('futsal_theme_v2');
                const votes = localStorage.getItem('futsal_best_defense_v2');
                state.teams = teams ? JSON.parse(teams) : [];
                state.history = history ? JSON.parse(history) : [];
                state.theme = theme || 'light';
                state.bestDefenseVotes = votes ? JSON.parse(votes) : {};
                applyTheme();
            } catch(e) {
                console.error('Erro ao carregar:', e);
            }
        }

        function saveState() {
            localStorage.setItem('futsal_teams_v2', JSON.stringify(state.teams));
            localStorage.setItem('futsal_history_v2', JSON.stringify(state.history));
            localStorage.setItem('futsal_theme_v2', state.theme);
            localStorage.setItem('futsal_best_defense_v2', JSON.stringify(state.bestDefenseVotes));
        }

        function toggleTheme() {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            applyTheme();
            saveState();
        }

        function applyTheme() {
            const body = document.body;
            const themeIcon = document.getElementById('themeIcon');
            
            if (state.theme === 'dark') {
                body.classList.add('dark-mode');
                themeIcon.textContent = '☀️';
            } else {
                body.classList.remove('dark-mode');
                themeIcon.textContent = '🌙';
            }
        }

        function showTab(tabName, evt) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            if (evt && evt.target) evt.target.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.remove('hidden');
            
            if (tabName === 'times') renderTeams();
            if (tabName === 'ranking') renderRankings();
            if (tabName === 'historico') renderHistory();
        }

        function startTimer() {
            if (timerInterval) clearInterval(timerInterval);
            state.currentMatch.running = true;
            timerInterval = setInterval(() => {
                if (state.currentMatch.timeLeft <= 0) {
                    stopTimer();
                    return;
                }
                state.currentMatch.timeLeft--;
                updateTimerDisplay();
            }, 1000);
            updateMatchStatus();
        }

        function stopTimer() {
            state.currentMatch.running = false;
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            updateMatchStatus();
        }

        function updateTimerDisplay() {
            const mm = Math.floor(state.currentMatch.timeLeft / 60).toString().padStart(2, '0');
            const ss = (state.currentMatch.timeLeft % 60).toString().padStart(2, '0');
            document.getElementById('timerDisplay').textContent = `${mm}:${ss}`;
        }

        function updateMatchStatus() {
            const status = state.currentMatch.running ? '🟢 Em andamento' : '⏸️ Pausado';
            document.getElementById('matchStatus').textContent = status;
        }

        function startMatch() {
            const homeId = document.getElementById('selectHome').value;
            const awayId = document.getElementById('selectAway').value;
            
            if (!homeId || !awayId) return alert('Selecione ambos os times!');
            if (homeId === awayId) return alert('Escolha times diferentes!');
            
            const home = state.teams.find(t => t.id === homeId);
            const away = state.teams.find(t => t.id === awayId);
            
            if (!home || !away) return alert('Times não encontrados');
            if (home.players.length < 1 || away.players.length < 1) {
                return alert('Cada time precisa ter pelo menos 1 jogador!');
            }
            
            state.currentMatch = {
                home: homeId,
                away: awayId,
                timeLeft: 600,
                running: false,
                events: [],
                score: { home: 0, away: 0 }
            };
            
            updateScoreboard();
            updateGoalSelects();
            startTimer();
        }

        function pauseMatch() {
            stopTimer();
        }

        function resumeMatch() {
            if (state.currentMatch.timeLeft === 0) {
                return alert('Tempo esgotado! Use Reset Tempo para reiniciar.');
            }
            startTimer();
        }

        function resetTimer() {
            stopTimer();
            state.currentMatch.timeLeft = 600;
            updateTimerDisplay();
        }

        function adjustTime(seconds) {
            state.currentMatch.timeLeft = Math.max(0, Math.min(600, state.currentMatch.timeLeft + seconds));
            updateTimerDisplay();
        }

        function endTime() {
            state.currentMatch.timeLeft = 0;
            stopTimer();
            updateTimerDisplay();
        }

        function updateScoreboard() {
            const home = state.teams.find(t => t.id === state.currentMatch.home);
            const away = state.teams.find(t => t.id === state.currentMatch.away);
            
            document.getElementById('homeTeamName').textContent = home ? home.name : '-';
            document.getElementById('awayTeamName').textContent = away ? away.name : '-';
            document.getElementById('scoreHome').textContent = state.currentMatch.score.home;
            document.getElementById('scoreAway').textContent = state.currentMatch.score.away;
            
            document.getElementById('scoreboard').classList.add('goal-animation');
            setTimeout(() => {
                document.getElementById('scoreboard').classList.remove('goal-animation');
            }, 500);
        }

        function playGoalAnimation() {
            const celebration = document.createElement('div');
            celebration.className = 'goal-celebration';
            document.body.appendChild(celebration);
            
            const goalText = document.createElement('div');
            goalText.className = 'goal-text';
            goalText.textContent = 'GOOOL!';
            document.body.appendChild(goalText);
            
            const ball = document.createElement('div');
            ball.className = 'soccer-ball-fly';
            ball.textContent = '⚽';
            celebration.appendChild(ball);
            
            const colors = ['#0a8d0a', '#ffffff', '#000000', '#ffd700', '#ff6b6b', '#4ecdc4'];
            const confettiCount = 50;
            
            for (let i = 0; i < confettiCount; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.left = Math.random() * 100 + '%';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.animationDelay = Math.random() * 0.5 + 's';
                    confetti.style.animationDuration = (Math.random() * 1 + 2) + 's';
                    celebration.appendChild(confetti);
                }, i * 30);
            }
            
            setTimeout(() => {
                celebration.remove();
                goalText.remove();
            }, 3000);
        }

        function updateGoalSelects() {
            const side = state.goalRegistration.selectedTeamSide;
            const teamId = side === 'home' ? state.currentMatch.home : state.currentMatch.away;
            const team = state.teams.find(t => t.id === teamId);
            
            const homeTeam = state.teams.find(t => t.id === state.currentMatch.home);
            const awayTeam = state.teams.find(t => t.id === state.currentMatch.away);
            document.getElementById('goalBtnHomeName').textContent = homeTeam ? homeTeam.name : 'Casa';
            document.getElementById('goalBtnAwayName').textContent = awayTeam ? awayTeam.name : 'Visitante';
            
            document.getElementById('btnSelectHome').className = side === 'home' 
                ? 'goal-team-btn border-4 border-green-600 bg-green-50 p-4 rounded-lg font-bold transition-all'
                : 'goal-team-btn border-2 border-gray-300 bg-white p-4 rounded-lg font-bold transition-all';
            document.getElementById('btnSelectAway').className = side === 'away'
                ? 'goal-team-btn border-4 border-green-600 bg-green-50 p-4 rounded-lg font-bold transition-all'
                : 'goal-team-btn border-2 border-gray-300 bg-white p-4 rounded-lg font-bold transition-all';
            
            const playersList = document.getElementById('goalPlayersList');
            const assistList = document.getElementById('assistPlayersList');
            
            if (!team || team.players.length === 0) {
                playersList.innerHTML = '<p class="text-gray-400 text-sm text-center">Nenhum jogador disponível</p>';
                assistList.innerHTML = '';
                document.getElementById('assistSection').classList.add('hidden');
                document.getElementById('btnConfirmGoal').classList.add('hidden');
                return;
            }
            
            playersList.innerHTML = '<label class="block text-sm font-semibold mb-2 text-center">⚽ Quem fez o gol?</label>' +
                team.players.map(p => {
                    const isSelected = state.goalRegistration.selectedScorer === p.id;
                    return `
                        <button class="player-goal-btn w-full ${isSelected ? 'selected' : ''}" 
                                onclick="selectScorer('${p.id}')">
                            ${p.name} ${p.isGoalkeeper ? '🧤' : ''}
                        </button>
                    `;
                }).join('');
            
            if (state.goalRegistration.selectedScorer) {
                document.getElementById('assistSection').classList.remove('hidden');
                assistList.innerHTML = team.players
                    .filter(p => p.id !== state.goalRegistration.selectedScorer)
                    .map(p => {
                        const isSelected = state.goalRegistration.selectedAssist === p.id;
                        return `
                            <button class="player-goal-btn w-full ${isSelected ? 'assist-selected' : ''}" 
                                    onclick="selectAssist('${p.id}')">
                                ${p.name} ${p.isGoalkeeper ? '🧤' : ''}
                            </button>
                        `;
                    }).join('');
                assistList.innerHTML += `
                    <button class="player-goal-btn w-full ${state.goalRegistration.selectedAssist === null && state.goalRegistration.selectedScorer ? 'assist-selected' : ''}" 
                            onclick="selectAssist(null)">
                        Sem assistência
                    </button>
                `;
                document.getElementById('btnConfirmGoal').classList.remove('hidden');
            } else {
                document.getElementById('assistSection').classList.add('hidden');
                document.getElementById('btnConfirmGoal').classList.add('hidden');
            }
        }
        
        function selectGoalTeam(side) {
            state.goalRegistration.selectedTeamSide = side;
            state.goalRegistration.selectedScorer = null;
            state.goalRegistration.selectedAssist = null;
            updateGoalSelects();
        }
        
        function selectScorer(playerId) {
            state.goalRegistration.selectedScorer = playerId;
            state.goalRegistration.selectedAssist = null;
            updateGoalSelects();
        }
        
        function selectAssist(playerId) {
            state.goalRegistration.selectedAssist = playerId;
            updateGoalSelects();
        }
        
        function confirmGoal() {
            const side = state.goalRegistration.selectedTeamSide;
            const scorerId = state.goalRegistration.selectedScorer;
            const assistId = state.goalRegistration.selectedAssist;
            
            if (!scorerId) return alert('Selecione quem fez o gol!');
            
            const teamId = side === 'home' ? state.currentMatch.home : state.currentMatch.away;
            const elapsed = 600 - state.currentMatch.timeLeft;
            const mm = Math.floor(elapsed / 60);
            const ss = elapsed % 60;
            const time = `${mm}:${String(ss).padStart(2,'0')}`;
            
            const event = {
                id: uid('ev'),
                time,
                type: 'goal',
                teamId,
                scorerId,
                assistId,
                minute: mm,
                second: ss
            };
            
            state.currentMatch.events.push(event);
            state.currentMatch.score[side]++;
            
            playGoalAnimation();
            
            updateScoreboard();
            renderEvents();
            
            state.goalRegistration.selectedScorer = null;
            state.goalRegistration.selectedAssist = null;
            updateGoalSelects();
        }

        function renderEvents() {
            const container = document.getElementById('eventsList');
            if (state.currentMatch.events.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-sm">Nenhum evento registrado</p>';
                return;
            }
            
            container.innerHTML = state.currentMatch.events.map(ev => {
                const team = state.teams.find(t => t.id === ev.teamId);
                const scorer = getPlayerNameById(ev.scorerId);
                const assist = ev.assistId ? getPlayerNameById(ev.assistId) : null;
                return `
                    <div class="event-item">
                        <div class="font-semibold">⚽ ${ev.time} - ${team ? team.name : 'Time'}</div>
                        <div class="text-sm event-details">${scorer}${assist ? ` (assist: ${assist})` : ''}</div>
                    </div>
                `;
            }).join('');
        }

        function endMatch() {
            if (!confirm('Deseja finalizar esta partida?')) return;
            
            stopTimer();
            
            const home = state.teams.find(t => t.id === state.currentMatch.home);
            const away = state.teams.find(t => t.id === state.currentMatch.away);
            
            if (!home || !away) return alert('Times inválidos');
            
            const match = {
                id: uid('match'),
                date: new Date().toISOString(),
                home: { id: home.id, name: home.name, score: state.currentMatch.score.home },
                away: { id: away.id, name: away.name, score: state.currentMatch.score.away },
                events: state.currentMatch.events,
                duration: 600 - state.currentMatch.timeLeft
            };
            
            state.history.unshift(match);
            saveState();
            
            state.currentMatch = {
                home: null,
                away: null,
                timeLeft: 600,
                running: false,
                events: [],
                score: { home: 0, away: 0 }
            };
            
            document.getElementById('selectHome').value = '';
            document.getElementById('selectAway').value = '';
            updateScoreboard();
            renderEvents();
            
            alert('Partida finalizada e salva no histórico!');
        }

        function renderTeams() {
            document.getElementById('teamCount').textContent = state.teams.length;
            const container = document.getElementById('teamsList');
            
            if (state.teams.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center text-sm">Nenhum time cadastrado. Clique em "Novo Time" para começar!</p>';
                return;
            }
            
            container.innerHTML = state.teams.map(team => `
                <div class="team-card p-3 rounded-lg">
                    <div class="flex flex-col gap-2 mb-2">
                        <input class="font-bold text-base border-b-2 border-transparent hover:border-green-600 focus:border-green-600 outline-none px-2 w-full input-field" 
                               value="${team.name}" 
                               onchange="renameTeam('${team.id}', this.value)">
                        <div class="flex gap-2">
                            <button class="btn-secondary text-xs flex-1 py-2" onclick="addPlayerToTeam('${team.id}')">➕ Jogador</button>
                            <button class="btn-danger text-xs px-3 py-2" onclick="removeTeam('${team.id}')">🗑️</button>
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        ${team.players.length === 0 ? '<p class="text-gray-400 text-xs text-center py-2">Nenhum jogador</p>' : ''}
                        ${team.players.map(p => `
                            <div class="flex flex-col bg-white p-2 rounded border gap-1.5">
                                <input class="outline-none px-1 text-sm font-medium w-full input-field" 
                                       value="${p.name}" 
                                       onchange="editPlayerName('${team.id}', '${p.id}', this.value)">
                                <div class="flex gap-1 items-center justify-between">
                                    ${p.isGoalkeeper ? 
                                        '<span class="text-xs bg-green-600 text-white px-2 py-1 rounded flex-1 text-center">🧤 Goleiro</span>' : 
                                        `<button class="text-xs btn-secondary py-1 px-2 flex-1" onclick="setGoalkeeper('${team.id}', '${p.id}')">Tornar GK</button>`
                                    }
                                    <button class="text-xs btn-secondary py-1 px-2" onclick="movePlayerPrompt('${p.id}')">↔️</button>
                                    <button class="text-xs text-red-600 font-bold px-2" onclick="removePlayer('${team.id}', '${p.id}')">❌</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
            
            updateTeamSelects();
        }

        function updateTeamSelects() {
            const selectHome = document.getElementById('selectHome');
            const selectAway = document.getElementById('selectAway');
            const currentHome = selectHome.value;
            const currentAway = selectAway.value;
            
            selectHome.innerHTML = '<option value="">Selecione o time...</option>';
            selectAway.innerHTML = '<option value="">Selecione o time...</option>';
            
            state.teams.forEach(t => {
                selectHome.innerHTML += `<option value="${t.id}" ${t.id === currentHome ? 'selected' : ''}>${t.name}</option>`;
                selectAway.innerHTML += `<option value="${t.id}" ${t.id === currentAway ? 'selected' : ''}>${t.name}</option>`;
            });
        }

        function addTeam() {
            if (state.teams.length >= 5) return alert('Máximo de 5 times permitido!');
            const name = prompt('Nome do time:') || `Time ${state.teams.length + 1}`;
            state.teams.push({
                id: uid('team'),
                name,
                players: []
            });
            saveState();
            renderTeams();
        }

        function removeTeam(teamId) {
            if (!confirm('Remover este time e todos os seus jogadores?')) return;
            state.teams = state.teams.filter(t => t.id !== teamId);
            saveState();
            renderTeams();
        }

        function renameTeam(teamId, name) {
            const team = state.teams.find(t => t.id === teamId);
            if (team) team.name = name;
            saveState();
        }

        function addPlayerToTeam(teamId) {
            const team = state.teams.find(t => t.id === teamId);
            if (!team) return;
            if (team.players.length >= 6) return alert('Máximo 6 jogadores por team!');
            
            const name = prompt('Nome do jogador:') || `Jogador ${team.players.length + 1}`;
            team.players.push({
                id: uid('player'),
                name,
                isGoalkeeper: team.players.length === 0
            });
            saveState();
            renderTeams();
        }

        function removePlayer(teamId, playerId) {
            if (!confirm('Remover este jogador?')) return;
            const team = state.teams.find(t => t.id === teamId);
            if (!team) return;
            team.players = team.players.filter(p => p.id !== playerId);
            if (team.players.length > 0 && !team.players.some(p => p.isGoalkeeper)) {
                team.players[0].isGoalkeeper = true;
            }
            saveState();
            renderTeams();
        }

        function editPlayerName(teamId, playerId, name) {
            const team = state.teams.find(t => t.id === teamId);
            if (!team) return;
            const player = team.players.find(p => p.id === playerId);
            if (player) player.name = name;
            saveState();
        }

        function setGoalkeeper(teamId, playerId) {
            const team = state.teams.find(t => t.id === teamId);
            if (!team) return;
            team.players.forEach(p => p.isGoalkeeper = (p.id === playerId));
            saveState();
            renderTeams();
        }

        function movePlayerPrompt(playerId) {
            const dest = prompt('Mover para qual time? (digite o nome)');
            if (!dest) return;
            const target = state.teams.find(t => t.name.toLowerCase() === dest.toLowerCase());
            if (!target) return alert('Time não encontrado!');
            
            let moving = null;
            state.teams.forEach(team => {
                const idx = team.players.findIndex(p => p.id === playerId);
                if (idx >= 0) {
                    moving = team.players.splice(idx, 1)[0];
                }
            });
            
            if (moving) {
                moving.isGoalkeeper = false;
                target.players.push(moving);
                saveState();
                renderTeams();
            }
        }

        function computePlayerStats() {
            const playersMap = {};
            const goalkeeperStats = {};
            
            state.history.forEach(match => {
                match.events.forEach(ev => {
                    if (ev.type === 'goal') {
                        if (ev.scorerId) {
                            playersMap[ev.scorerId] = playersMap[ev.scorerId] || { 
                                name: getPlayerNameById(ev.scorerId), 
                                goals: 0, 
                                assists: 0 
                            };
                            playersMap[ev.scorerId].goals++;
                        }
                        if (ev.assistId) {
                            playersMap[ev.assistId] = playersMap[ev.assistId] || { 
                                name: getPlayerNameById(ev.assistId), 
                                goals: 0, 
                                assists: 0 
                            };
                            playersMap[ev.assistId].assists++;
                        }
                    }
                });
                
                const concededHome = match.away.score;
                const concededAway = match.home.score;
                const homeGKId = findGoalkeeperId(match.home.id);
                const awayGKId = findGoalkeeperId(match.away.id);
                
                if (homeGKId) {
                    goalkeeperStats[homeGKId] = goalkeeperStats[homeGKId] || { conceded: 0, matches: 0 };
                    goalkeeperStats[homeGKId].conceded += concededHome;
                    goalkeeperStats[homeGKId].matches++;
                }
                if (awayGKId) {
                    goalkeeperStats[awayGKId] = goalkeeperStats[awayGKId] || { conceded: 0, matches: 0 };
                    goalkeeperStats[awayGKId].conceded += concededAway;
                    goalkeeperStats[awayGKId].matches++;
                }
            });
            
            return { playersMap, goalkeeperStats };
        }

        function renderRankings() {
            const { playersMap, goalkeeperStats } = computePlayerStats();
            
            const artilheiros = Object.entries(playersMap).map(([id, data]) => ({
                id,
                name: data.name,
                goals: data.goals,
                assists: data.assists,
                points: data.goals + data.assists
            })).sort((a, b) => b.points - a.points || b.goals - a.goals);
            
            const artilheirosContainer = document.getElementById('artilheirosList');
            if (artilheiros.length === 0) {
                artilheirosContainer.innerHTML = '<p class="text-gray-500 text-center">Nenhum dado disponível ainda</p>';
            } else {
                let lastPoints = null, rank = 0, count = 0;
                artilheirosContainer.innerHTML = artilheiros.slice(0, 20).map(p => {
                    count++;
                    if (p.points !== lastPoints) { rank = count; lastPoints = p.points; }
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                    return `
                        <div class="rank-item ${rank <= 3 ? 'top3' : ''} p-3 rounded">
                            <div class="font-bold">${medal} ${p.name}</div>
                            <div class="rank-details">⚽ Gols: ${p.goals} | 🎯 Assists: ${p.assists} | 📊 Pontos: ${p.points}</div>
                        </div>
                    `;
                }).join('');
            }
            
            const goleiros = Object.entries(goalkeeperStats).map(([id, data]) => ({
                id,
                name: getPlayerNameById(id),
                conceded: data.conceded,
                matches: data.matches,
                average: data.matches > 0 ? (data.conceded / data.matches).toFixed(2) : 0
            })).sort((a, b) => parseFloat(a.average) - parseFloat(b.average) || a.conceded - b.conceded);
            
            const goleirosContainer = document.getElementById('goleirosList');
            if (goleiros.length === 0) {
                goleirosContainer.innerHTML = '<p class="text-gray-500 text-center">Nenhum dado disponível ainda</p>';
            } else {
                let lastAvg = null, rank = 0, count = 0;
                goleirosContainer.innerHTML = goleiros.slice(0, 20).map(g => {
                    count++;
                    if (g.average !== lastAvg) { rank = count; lastAvg = g.average; }
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                    return `
                        <div class="rank-item ${rank <= 3 ? 'top3' : ''} p-3 rounded">
                            <div class="font-bold">${medal} ${g.name}</div>
                            <div class="rank-details">🧤 Média: ${g.average} gols/jogo | ⚽ Sofridos: ${g.conceded} | 🎮 Partidas: ${g.matches}</div>
                        </div>
                    `;
                }).join('');
            }
            
            const selectBestDefense = document.getElementById('selectBestDefense');
            selectBestDefense.innerHTML = '<option value="">Selecione o goleiro com melhor defesa</option>';
            goleiros.forEach(g => {
                selectBestDefense.innerHTML += `<option value="${g.id}">${g.name}</option>`;
            });
            
            const voteCounts = {};
            Object.values(state.bestDefenseVotes).forEach(gkId => {
                voteCounts[gkId] = (voteCounts[gkId] || 0) + 1;
            });
            
            if (Object.keys(voteCounts).length > 0) {
                const maxVotes = Math.max(...Object.values(voteCounts));
                const bestDefenseId = Object.keys(voteCounts).find(id => voteCounts[id] === maxVotes);
                const bestDefenseName = getPlayerNameById(bestDefenseId);
                
                document.getElementById('bestDefenseResult').style.display = 'block';
                document.getElementById('bestDefenseText').innerHTML = `
                    <div class="text-base font-bold text-center mt-2">${bestDefenseName}</div>
                    <div class="text-sm text-center">Votos: ${maxVotes}</div>
                `;
            } else {
                document.getElementById('bestDefenseResult').style.display = 'none';
            }
        }
        
        function voteBestDefense() {
            const selectBestDefense = document.getElementById('selectBestDefense');
            const selectedGKId = selectBestDefense.value;
            
            if (!selectedGKId) {
                return alert('Selecione um goleiro para votar!');
            }
            
            const voterKey = `voter_${Math.random().toString(36).slice(2,9)}`;
            state.bestDefenseVotes[voterKey] = selectedGKId;
            saveState();
            selectBestDefense.value = '';
            renderRankings();
            alert('Voto registrado com sucesso!');
        }

        function renderHistory() {
            const container = document.getElementById('historyList');
            if (state.history.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center">Nenhuma partida no histórico</p>';
                return;
            }
            
            container.innerHTML = state.history.map(m => `
                <div class="card p-4">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <div class="font-bold text-lg">${m.home.name} ${m.home.score} x ${m.away.score} ${m.away.name}</div>
                            <div class="text-xs text-gray-500">${new Date(m.date).toLocaleString('pt-BR')}</div>
                        </div>
                        <div class="text-sm text-gray-600">
                            ⏱️ ${Math.floor(m.duration/60)}m ${m.duration%60}s
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="font-semibold text-sm mb-1">Eventos:</div>
                        ${m.events.length === 0 ? '<p class="text-gray-400 text-xs">Sem eventos</p>' : ''}
                        ${m.events.map(ev => {
                            const team = state.teams.find(t => t.id === ev.teamId);
                            const scorer = getPlayerNameById(ev.scorerId);
                            const assist = ev.assistId ? getPlayerNameById(ev.assistId) : null;
                            return `
                                <div class="text-xs border-l-2 border-green-600 pl-2 py-1">
                                    ⚽ ${ev.time} - ${team ? team.name : 'Time'}: ${scorer}${assist ? ` (${assist})` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('');
        }

        function clearHistory() {
            if (!confirm('Deseja limpar todo o histórico? Esta ação não pode ser desfeita!')) return;
            state.history = [];
            state.bestDefenseVotes = {}; // limpar também os votos de melhor defesa
            saveState();
            renderHistory();
            renderRankings();
        }

        function exportHistory() {

    if (!state.history || state.history.length === 0)
        return alert('Nenhuma partida no histórico para exportar');

    // ---- 1) COLETA DE DADOS ----
    const { playersMap, goalkeeperStats } = computePlayerStats();

    let txt = "";
    txt += "===============================\n";
    txt += "      HISTÓRICO DE PARTIDAS\n";
    txt += "===============================\n\n";

    // ---- 2) PARTIDAS ----
    state.history.forEach(m => {
        txt += `${new Date(m.date).toLocaleString('pt-BR')}\n`;
        txt += `${m.home.name} ${m.home.score} x ${m.away.score} ${m.away.name}\n\n`;

        if (m.events.length === 0) {
            txt += "  - Sem eventos\n\n";
        } else {
            m.events.forEach(ev => {
                const team = state.teams.find(t => t.id === ev.teamId);
                const scorer = getPlayerNameById(ev.scorerId);
                const assist = ev.assistId ? getPlayerNameById(ev.assistId) : null;

                txt += `  - ${ev.time} | ${team ? team.name : 'Time'}: ${scorer}`;
                if (assist) txt += ` (assist: ${assist})`;
                txt += "\n";
            });
            txt += "\n";
        }
        txt += "--------------------------------\n\n";
    });

    // ---- 3) RANKING DE ARTILHEIROS ----
    txt += "===============================\n";
    txt += "        RANKING: ARTILHEIROS\n";
    txt += "===============================\n\n";

    const artilheiros = Object.entries(playersMap)
        .map(([id, d]) => ({
            id,
            name: d.name,
            goals: d.goals,
            assists: d.assists,
            points: d.goals + d.assists
        }))
        .sort((a, b) => b.points - a.points || b.goals - a.goals);

    if (artilheiros.length === 0) {
        txt += "Nenhum dado disponível.\n\n";
    } else {
        artilheiros.forEach((p, i) => {
            txt += `${i+1}. ${p.name} — ${p.goals}G / ${p.assists}A (Total: ${p.points})\n`;
        });
        txt += "\n";
    }

    // ---- 4) RANKING DE GOLEIROS ----
    txt += "===============================\n";
    txt += "      RANKING: GOLEIROS\n";
    txt += "===============================\n\n";

    const goleiros = Object.entries(goalkeeperStats)
        .map(([id, d]) => ({
            id,
            name: getPlayerNameById(id),
            conceded: d.conceded,
            matches: d.matches,
            media: d.matches > 0 ? (d.conceded / d.matches).toFixed(2) : "0.00"
        }))
        .sort((a, b) => a.media - b.media);

    if (goleiros.length === 0) {
        txt += "Nenhum dado disponível.\n\n";
    } else {
        goleiros.forEach((g, i) => {
            txt += `${i+1}. ${g.name} — Sofridos: ${g.conceded} | Jogos: ${g.matches} | Média: ${g.media}\n`;
        });
        txt += "\n";
    }

    // ---- 5) DOWNLOAD DO TXT ----
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `historico_completo_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
        }

        function getPlayerNameById(playerId) {
            if (!playerId) return '(ex)';
            for (const t of state.teams) {
                for (const p of t.players) {
                    if (p.id === playerId) return p.name;
                }
            }
            return 'Desconhecido';
        }

        function findGoalkeeperId(teamId) {
            const team = state.teams.find(t => t.id === teamId);
            if (!team) return null;
            const gk = team.players.find(p => p.isGoalkeeper);
            return gk ? gk.id : (team.players[0] ? team.players[0].id : null);
        }

        document.addEventListener('DOMContentLoaded', () => {
            loadState();
            renderTeams();
            updateTeamSelects();
            updateTimerDisplay();
            updateMatchStatus();
            updateScoreboard();
            updateGoalSelects();
        });
    
        // --------- SORTEADOR: adiciona funcionalidade de sortear nomes em times (max 5 por time) ---------
        function parseNamesInput(raw) {
            if (!raw) return [];
            // split by newlines or commas, trim, filter empties
            const list = raw.split(/\n|,/).map(s => s.trim()).filter(Boolean);
            // remove duplicate empty entries
            return list;
        }

        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function sortearTimes() {
            const raw = document.getElementById('sorteadorInput').value;
            const names = parseNamesInput(raw);
            if (!names || names.length === 0) return alert('Insira pelo menos um nome para sortear.');
            
            // Máximo por time = 5
            const maxPerTeam = 5;
            const numTeams = Math.ceil(names.length / maxPerTeam);
            const shuffled = shuffleArray(names.slice());
            
            // Limpa todos os times existentes (Opção A)
            state.teams = [];
            
            // Criar times dividindo os nomes em grupos de até 5
            for (let t = 0; t < numTeams; t++) {
                const start = t * maxPerTeam;
                const group = shuffled.slice(start, start + maxPerTeam);
                const teamObj = {
                    id: uid('team'),
                    name: `Time ${t + 1}`,
                    players: group.map((nm, idx) => ({
                        id: uid('player'),
                        name: nm,
                        isGoalkeeper: idx === 0 // primeiro jogador do time vira goleiro por padrão
                    }))
                };
                state.teams.push(teamObj);
            }
            
            saveState();
            renderTeams();
            updateTeamSelects();
            
            // Mostrar resultado no painel do sorteador para pré-visualização
            const res = document.getElementById('sorteadorResult');
            res.innerHTML = state.teams.map(t => `
                <div class="team-card p-3 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <div class="font-bold">${t.name} <span class="text-xs text-gray-500">(${t.players.length} jogadores)</span></div>
                    </div>
                    <div class="space-y-1">${t.players.map(p => `<div class="text-sm">${p.name}${p.isGoalkeeper ? ' 🧤' : ''}</div>`).join('')}</div>
                </div>
            `).join('');
            
            // ir automaticamente para aba Times para ver resultado (mantemos a aba Sorteador visível também)
            // showTab('times');
        }

        function clearSorteador() {
            document.getElementById('sorteadorInput').value = '';
            document.getElementById('sorteadorResult').innerHTML = '';
        }
        // ---------------------------------------------------------------------------------------------