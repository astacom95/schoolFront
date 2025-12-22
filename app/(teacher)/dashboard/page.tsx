import { cards } from "../../../lib/routes";

export default function TeacherDashboard() {
  return (
    <div className="card">
      <h2>áæÍÉ ÇáãÚáã</h2>
      <p style={{ opacity: 0.8 }}>ßá ãÇ íÍÊÇÌå ÇáãÚáã ãä ÅÏÇÑÉ ÇáÏÑæÓ æÇáÈË æÇáÍÖæÑ æÇáÊŞííãÇÊ.</p>
      <ul>
        {cards.teacher.map((item) => (
          <li key={item.title}>{item.title} - {item.description}</li>
        ))}
      </ul>
    </div>
  );
}
