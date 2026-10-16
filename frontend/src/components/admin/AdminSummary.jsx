function Card({ title, value, note, color }) {
  return (
    <div
      className={`p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm border-l-4 ${color}`}
    >
      <span className="text-sm text-gray-500 dark:text-slate-400">{title}</span>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
        {value}
      </h2>
      <p className="text-xs text-gray-400 dark:text-slate-500">{note}</p>
    </div>
  );
}

function AdminSummary() {
  return (
    <section className="grid md:grid-cols-1 gap-4">
      <Card
        title="Total Documents"
        value="6"
        note="Across documents, faq, and manuals"
        color="border-blue-500"
      />
      {/* <Card
        title="Healthy Pipelines"
        value="09"
        note="No ingestion failures detected"
        color="border-green-500"
      />
      <Card
        title="Total Documents"
        value="6"
        note="Pending source validation"
        color="border-red-500"
      /> */}
    </section>
  );
}

export default AdminSummary;
