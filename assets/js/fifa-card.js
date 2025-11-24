// 1. Dados do Jogador (Exemplo)
const falcao = {
    name: "FALCÃO",
    rating: 96,
    pos: "AT",
    nation: "🇧🇷",
    club: "Lenda Futsal",
    image: "https://i.imgur.com/GzB9v0L.png", // URL da foto do Falcão
    stats: {
        rit: 96, // Ritmo
        fin: 95, // Finalização
        pas: 94, // Passe
        drib: 97, // Drible
        def: 50, // Defesa
        fis: 90  // Físico
    }
};

const ferrao = {
    name: "FERRÃO",
    rating: 93,
    pos: "PI",
    nation: "🇧🇷",
    club: "Barça",
    image: "https://i.imgur.com/y8W6YyO.png", // Exemplo de outra imagem
    stats: {
        rit: 88,
        fin: 96,
        pas: 85,
        drib: 92,
        def: 55,
        fis: 93
    }
};

/**
 * Atualiza o card com as informações dinâmicas de um jogador.
 * @param {Object} player Objeto contendo os dados do jogador.
 */
function updatePlayerCard(player) {
    document.getElementsByClassName('fifa-card').classList.remove('fifa-card-hidden')
    // 1. Atualizar Header
    document.getElementById('cardRating').textContent = player.rating;
    document.getElementById('cardPos').textContent = player.pos;

    // 2. Atualizar Imagem
    document.getElementById('cardImage').src = player.image;
    document.getElementById('cardImage').alt = player.name;

    // 3. Atualizar Informações
    document.getElementById('cardName').textContent = player.name;
    document.getElementById('cardNation').textContent = player.nation;
    document.getElementById('cardClub').textContent = player.club;

    // 4. Atualizar Estatísticas
    document.querySelectorAll('.card-stats .stat-value').forEach(statElement => {
        const statKey = statElement.getAttribute('data-stat'); // rit, fin, pas, etc.
        if (player.stats[statKey] !== undefined) {
            statElement.textContent = player.stats[statKey];
        }
    });
}

// Inicializa o card ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    updatePlayerCard(falcao); // Carrega o primeiro jogador por padrão
});