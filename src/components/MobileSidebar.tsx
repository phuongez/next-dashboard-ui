import { usePathname } from "next/navigation";
import { useState } from "react";
import { menuItems } from "./Menu";
import Link from "next/link";

export const MobileSidebar = ({ role }: { role: string }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Nút mở menu */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 text-white text-2xl"
      >
        ☰
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
            lg:hidden fixed top-0 left-0 h-screen w-56 bg-lamaYellow
            z-50 p-4 transform transition-transform
            ${open ? "translate-x-0" : "-translate-x-full"}
          `}
      >
        <button
          onClick={() => setOpen(false)}
          className="text-white text-xl mb-4"
        >
          ✕
        </button>

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
                  onClick={() => setOpen(false)}
                  className={`
                      flex items-center gap-4 px-4 py-2 rounded-md
                      ${
                        isActive
                          ? "bg-[#F2D25C] text-black"
                          : "text-white hover:bg-[#F2D25C] hover:text-black"
                      }
                    `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </aside>
    </>
  );
};
