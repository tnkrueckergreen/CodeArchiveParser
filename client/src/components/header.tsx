export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-lg p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v1.816a2 2 0 00.586 1.414l2.848 2.849A2 2 0 004 12.416V15a2 2 0 002 2h8a2 2 0 002-2v-2.584a2 2 0 00-.586-1.414l-2.848-2.849A2 2 0 0014 6.184V5a2 2 0 00-2-2H4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">CodeArchive Parser</h1>
              <p className="text-sm text-slate-500">Extract & format your codebase for AI</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
