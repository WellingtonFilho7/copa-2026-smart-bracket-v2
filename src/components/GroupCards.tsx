import type { TeamDefinition } from "../lib/types";

type GroupCardsProps = {
  teams: TeamDefinition[];
};

const topGroups = ["A", "B", "C", "D", "E", "F"];
const bottomGroups = ["G", "H", "I", "J", "K", "L"];

export function GroupCards({ teams }: GroupCardsProps) {
  return (
    <>
      <div className="group-strip">
        {topGroups.map((group) => (
          <GroupCard key={group} group={group} teams={teams.filter((team) => team.group === group)} />
        ))}
      </div>
      <div className="group-strip group-strip-bottom">
        {bottomGroups.map((group) => (
          <GroupCard key={group} group={group} teams={teams.filter((team) => team.group === group)} />
        ))}
      </div>
    </>
  );
}

function GroupCard({ group, teams }: { group: string; teams: TeamDefinition[] }) {
  return (
    <section className={`group-card group-${group.toLowerCase()}`}>
      <header className="group-card-header">
        <p className="eyebrow">Grupo {group}</p>
        <h3>Grupo {group}</h3>
        <span className="group-card-count">{teams.length} seleções</span>
      </header>
      <ul className="group-team-list">
        {teams.map((team) => (
          <li key={team.code}>
            <span className="group-team-seed">{team.code}</span>
            <span>{team.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
