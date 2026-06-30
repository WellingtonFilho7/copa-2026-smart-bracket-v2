import type { OfficialGroup } from "../lib/feed/schema";

type GroupCardsProps = {
  groups: OfficialGroup[];
};

const topGroups = ["A", "B", "C", "D", "E", "F"];
const bottomGroups = ["G", "H", "I", "J", "K", "L"];

export function GroupCards({ groups }: GroupCardsProps) {
  const map = new Map(groups.map((group) => [group.group, group]));

  return (
    <>
      <div className="group-strip">
        {topGroups.map((groupCode) => (
          <GroupCard key={groupCode} group={map.get(groupCode)} />
        ))}
      </div>
      <div className="group-strip group-strip-bottom">
        {bottomGroups.map((groupCode) => (
          <GroupCard key={groupCode} group={map.get(groupCode)} />
        ))}
      </div>
    </>
  );
}

function GroupCard({ group }: { group: OfficialGroup | undefined }) {
  if (!group) {
    return null;
  }

  return (
    <section className={`group-card group-${group.group.toLowerCase()}`} data-group={group.group}>
      <header className="group-card-header">
        <p className="eyebrow">Grupo {group.group}</p>
        <h3>Grupo {group.group}</h3>
        <span className="group-card-count">{group.teams.length} seleções</span>
      </header>

      <div className="group-standings-head" aria-hidden="true">
        <span>Pos</span>
        <span>Seleção</span>
        <span>P</span>
        <span>J</span>
        <span>SG</span>
      </div>

      <ul className="group-team-list">
        {group.teams.map((team) => (
          <li key={team.code} className={`group-team-status-${team.status}`}>
            <span className="group-team-seed">{team.rank}</span>
            <span className="group-team-name">
              <strong>{team.code}</strong>
              <small>{team.name}</small>
            </span>
            <span>{team.points}</span>
            <span>{team.played}</span>
            <span>{team.goalDifference >= 0 ? `+${team.goalDifference}` : team.goalDifference}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
