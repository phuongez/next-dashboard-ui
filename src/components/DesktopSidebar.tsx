import { usePathname } from "next/navigation";
import { menuItems } from "./Menu";
import Link from "next/link";

export const DesktopSidebar = ({ role }: { role: string }) => {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen text-sm flex-col">
      {menuItems.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          {/* <span className="text-white font-semibold my-4">{group.title}</span> */}

          {group.items.map((item) => {
            if (!item.visible.includes(role)) return null;

            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                    flex items-center gap-4 px-4 py-2 rounded-md transition
                    ${
                      isActive
                        ? "bg-[#F2D25C] text-black"
                        : "text-white hover:bg-[#F2D25C] hover:text-black"
                    }
                  `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
};
