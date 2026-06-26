export default function handler(_request, response) {
  response.status(200).json({
    matches: [
      {
        id: "K3",
        homeScore: 1,
        awayScore: 0,
        status: "finished",
        updatedAt: "2026-06-24T22:30:00-03:00",
      },
      {
        id: "GC5",
        homeScore: 2,
        awayScore: 1,
        status: "finished",
        updatedAt: "2026-06-24T22:35:00-03:00",
      },
    ],
  });
}
