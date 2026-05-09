export const createChallongeTournament = async (name: string, tournamentType: string = 'single elimination') => {
  const apiKey = process.env.CHALLONGE_API_KEY;
  if (!apiKey) {
    console.warn('CHALLONGE_API_KEY is not set.');
    return null;
  }

  const response = await fetch(`https://api.challonge.com/v1/tournaments.json?api_key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tournament: {
        name,
        tournament_type: tournamentType,
        url: `kaf_${Date.now()}`,
      }
    })
  });

  return response.json();
};

export const addChallongeParticipant = async (tournamentId: string, name: string) => {
  const apiKey = process.env.CHALLONGE_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(`https://api.challonge.com/v1/tournaments/${tournamentId}/participants.json?api_key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participant: { name } })
  });

  return response.json();
};
