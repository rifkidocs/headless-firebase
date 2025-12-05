export default function DashboardPage() {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Welcome to your Headless CMS</h2>
          <p className="text-gray-600">
            Select a collection from the sidebar to manage your content.
          </p>
        </div>
      </div>
    );
  }
