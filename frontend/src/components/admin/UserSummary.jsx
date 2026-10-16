function Card({ item }) {
  const tone = {
    primary: "border-blue-500",
    success: "border-green-500",
    danger: "border-red-500",
  };

  return (
    <div
      className={`p-4 bg-white rounded-xl shadow-sm border-l-4 ${tone[item.tone]}`}
    >
      <span className="text-sm text-gray-500">{item.label}</span>
      <h2 className="text-2xl font-bold">{item.value}</h2>
      <p className="text-xs text-gray-400">{item.note}</p>
    </div>
  );
}

function UserSummary({ data }) {
  return (
    <section className="grid md:grid-cols-3 gap-4">
      {data.map((item) => (
        <Card key={item.label} item={item} />
      ))}
    </section>
  );
}

export default UserSummary;
