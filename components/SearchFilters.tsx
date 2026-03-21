export function SearchFilters({ defaultCategory, defaultQuery, defaultDate }: { defaultCategory?: string; defaultQuery?: string; defaultDate?: string }) {
  return (
    <form className="card filter-grid">
      <input name="q" defaultValue={defaultQuery} placeholder="Search title or keyword" className="input" />
      <select name="category" defaultValue={defaultCategory || ''} className="input">
        <option value="">All categories</option>
        <option value="football">Football</option>
        <option value="cricket">Cricket</option>
      </select>
      <input name="date" type="date" defaultValue={defaultDate} className="input" />
      <button className="button button-primary">Apply filters</button>
    </form>
  );
}
