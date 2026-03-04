import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
  const navItems = [
    { path: '/', label: '介绍' },
    { path: '/projects', label: '项目' },
    { path: '/growth', label: '个人成长' },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 z-[100] flex items-center justify-between px-8 md:px-12">
        <div className="font-serif text-sm text-gray-500 select-none">
          陈泓利的...
        </div>
        <ul className="flex items-center gap-6 md:gap-10 h-full">
          {navItems.map((item, index) => {
            const colors = ['text-brand-orange', 'text-brand-red', 'text-brand-green'];
            const activeColor = colors[index % colors.length];
            
            return (
              <li key={item.path} className="h-full">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `h-full flex items-center justify-center min-w-[80px] font-serif transition-colors duration-150 ${
                      isActive
                        ? `text-2xl font-bold ${activeColor}`
                        : 'text-lg text-gray-500 hover:text-gray-800'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </header>

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
