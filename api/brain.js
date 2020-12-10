const brain = require("brain");
const openLigaDb = require("./openLigaDb");

exports.getPrediction = async function (matches, team1, team2) { 
    const net = new brain.NeuralNetwork();
    const teams = await openLigaDb.teams();
    const matches = await openLigaDb.matches();
    const trainData = matches.filter(match => match.MatchIsFinished)
        .sort(( a, b ) => {
            if ( a.MatchDateTimeUTC < b.MatchDateTimeUTC ){
                return -1;
            }
            if ( a.MatchDateTimeUTC > b.MatchDateTimeUTC ){
                return 1;
            }
                return 0;
            })
        .map(match => {
            const host = teams.map(team => team.TeamId === match.Team1.TeamId ? 1 : 0),
                  guest = teams.map(team => team.TeamId === match.Team2.TeamId ? 1 : 0),
                  matchResult = match.MatchResults.find(matchResult => matchResult.ResultTypeID === 2);

            var winner = [0,0];
            if(matchResult.PointsTeam1 > matchResult.PointsTeam2) {
              winner[0] = 1;
            }

            if(matchResult.PointsTeam1 < matchResult.PointsTeam2) {
              winner[1] = 1;
            }

            var goalsHost = [], goalsGuest = [];

            do {
              goalsHost.push(matchResult.PointsTeam1 === goalsHost.length + 1 || goalsHost.length === 10 ? 1 : 0;
              goalsGuest.push(matchResult.PointsTeam2 === goalsGuest.length + 1 || goalsGuest.length === 10 ? 1 : 0;
            } while(goalsHost.length < 10)

            return {
                input: [...host, ...guest],
                output: [...winner, ...goalsHost, ...goalsGuest]
            };
    });
    
    net.train(trainData);

    const host = teams.map(team => team.TeamId === team1 ? 1 : 0),
          guest = teams.map(team => team.TeamId === team2 ? 1 : 0);

    return net.run([...host, ...guest]);

}
