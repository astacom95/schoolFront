import { cards } from "../../../lib/routes";

export default function StudentDashboard() {
  return (
    <div className="card">
      <h2>áæÍÉ ÇáØÇáÈ</h2>
      <p style={{ opacity: 0.8 }}>ÈæÇÈÉ æÇÍÏÉ áãÊÇÈÚÉ ÇáÌÏæá¡ ãÊÇÈÚÉ ÇáÏÑæÓ¡ ÇáãåÇã¡ æÇáÇÎÊÈÇÑÇÊ.</p>
      <ul>
        {cards.student.map((item) => (
          <li key={item.title}>{item.title} - {item.description}</li>
        ))}
      </ul>
    </div>
  );
}
