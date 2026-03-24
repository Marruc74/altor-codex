import { loreEntries } from "../data/locations";

const categoryColors = {
  History: "#8b2020",
  Politics: "#1e4a5a",
  Peoples: "#2d5a2d",
  Factions: "#5a3a1e",
  Magic: "#3a1e5a",
};

export default function LoreSection() {
  return (
    <section id="lore" className="lore-section">
      <div className="section-header">
        <p className="section-eyebrow">THE CODEX</p>
        <h2 className="section-title">Entries of Altor</h2>
        <p className="section-subtitle">
          Gathered knowledge from scholars, wanderers, and those who survived long enough to write things down.
        </p>
      </div>

      <div className="lore-grid">
        {loreEntries.map((entry, i) => (
          <article
            key={entry.id}
            className="lore-card"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div
              className="lore-card__category-bar"
              style={{ background: categoryColors[entry.category] || "#3a3a3a" }}
            />
            <div className="lore-card__inner">
              <span className="lore-card__category">{entry.category}</span>
              <h3 className="lore-card__title">{entry.title}</h3>
              <p className="lore-card__excerpt">{entry.excerpt}</p>
              <button className="lore-card__cta">
                Read Entry <span>→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="lore-disclaimer">
        ✦ More entries will be added as the Codex expands ✦
      </p>
    </section>
  );
}
