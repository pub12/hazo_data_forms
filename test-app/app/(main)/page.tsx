export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">hazo_data_forms Test App</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the test application for hazo_data_forms. Use the sidebar
          to navigate to different test cases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeatureCard
          title="Basic Fields"
          description="Text, number, date, boolean, select, email, tel, and more"
          href="/basic-fields"
        />
        <FeatureCard
          title="Nested Sections"
          description="Complex forms with sections and sub-sections"
          href="/nested-sections"
        />
        <FeatureCard
          title="Tables & Worksheets"
          description="Dynamic table fields with add/remove rows"
          href="/tables-worksheets"
        />
        <FeatureCard
          title="Document Links"
          description="PDF viewer integration with doc_link fields"
          href="/document-links"
        />
        <FeatureCard
          title="Edit vs View Mode"
          description="Switch between editable and read-only modes"
          href="/edit-vs-view"
        />
      </div>

      <div className="border rounded-lg p-6 bg-muted/30">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>- JSON schema-driven dynamic form rendering</li>
          <li>- 12 built-in field types with extensible registry</li>
          <li>- Edit and view modes</li>
          <li>- Document links with PDF viewer panel</li>
          <li>- INI-based configuration</li>
          <li>- React Hook Form integration</li>
          <li>- Computed fields with formula support</li>
          <li>- Horizontal and vertical field layouts</li>
          <li>- Collapsible sections</li>
        </ul>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block p-6 border rounded-lg hover:border-primary hover:shadow-sm transition-all"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </a>
  );
}
