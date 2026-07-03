import type { ReactNode } from "react";
import {
  Blocks,
  Guitar,
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { StudioAtmosphere } from "../dashboard";
import { Button } from "../../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet";
import { Separator } from "../../ui/separator";
import type { AdminModuleListItem } from "../../../services/gmusic-api/admin";

export type AdminNavView = "list" | "detail" | "edit" | "attempts";

interface AdminLayoutProps {
  children: ReactNode;
  setPage: (page: string) => void;
  navView: AdminNavView;
  modules: AdminModuleListItem[];
  activeModuleId: string | null;
  activeModuleTitle: string | null;
  onGoList: () => void;
  onGoModule: (moduleId: string) => void;
  onLogout: () => void;
  toast: ReactNode;
}

function SidebarNav({
  navView,
  modules,
  activeModuleId,
  activeModuleTitle,
  onGoList,
  onGoModule,
  onHome,
  onLogout,
}: {
  navView: AdminNavView;
  modules: AdminModuleListItem[];
  activeModuleId: string | null;
  activeModuleTitle: string | null;
  onGoList: () => void;
  onGoModule: (moduleId: string) => void;
  onHome: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="admin-sidebar__inner">
      <div className="admin-sidebar__brand">
        <Guitar className="admin-sidebar__brand-icon" aria-hidden="true" />
        <div>
          <p className="admin-sidebar__brand-title">Admin Creador</p>
          <p className="admin-sidebar__brand-sub">Gmusic · R-008</p>
        </div>
      </div>

      <Separator className="admin-sidebar__sep" />

      <nav className="admin-sidebar__nav" aria-label="Navegación admin">
        <button
          type="button"
          className={`admin-sidebar__link${navView === "list" ? " admin-sidebar__link--active" : ""}`}
          onClick={onGoList}
        >
          <Blocks aria-hidden="true" />
          <span>Todos los bloques</span>
        </button>

        {activeModuleId && activeModuleTitle ? (
          <button
            type="button"
            className={`admin-sidebar__link admin-sidebar__link--nested${
              navView === "detail" || navView === "edit" ? " admin-sidebar__link--active" : ""
            }`}
            onClick={() => onGoModule(activeModuleId)}
          >
            <span className="admin-sidebar__link-dot" aria-hidden="true" />
            <span className="admin-sidebar__link-truncate">{activeModuleTitle}</span>
          </button>
        ) : null}
      </nav>

      {modules.length > 0 ? (
        <>
          <p className="admin-sidebar__section-label">Recientes</p>
          <div className="admin-sidebar__recents">
            {modules.slice(0, 6).map((module) => (
              <button
                key={module.id}
                type="button"
                className={`admin-sidebar__recent${
                  module.id === activeModuleId ? " admin-sidebar__recent--active" : ""
                }`}
                onClick={() => onGoModule(module.id)}
              >
                <span>B{module.order}</span>
                <span className="admin-sidebar__link-truncate">{module.title}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="admin-sidebar__footer">
        <Separator className="admin-sidebar__sep" />
        <button type="button" className="admin-sidebar__link" onClick={onHome}>
          <Home aria-hidden="true" />
          <span>Inicio público</span>
        </button>
        <button type="button" className="admin-sidebar__link admin-sidebar__link--muted" onClick={onLogout}>
          <LogOut aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

export function AdminLayout({
  children,
  setPage,
  navView,
  modules,
  activeModuleId,
  activeModuleTitle,
  onGoList,
  onGoModule,
  onLogout,
  toast,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarProps = {
    navView,
    modules,
    activeModuleId,
    activeModuleTitle,
    onGoList: () => {
      onGoList();
      setMobileOpen(false);
    },
    onGoModule: (moduleId: string) => {
      onGoModule(moduleId);
      setMobileOpen(false);
    },
    onHome: () => {
      setPage("home");
      setMobileOpen(false);
    },
    onLogout: () => {
      onLogout();
      setMobileOpen(false);
    },
  };

  return (
    <StudioAtmosphere className="admin-app">
      <div className={`admin-app__frame${collapsed ? " admin-app__frame--collapsed" : ""}`}>
        <aside className="admin-sidebar admin-sidebar--desktop" aria-label="Panel lateral admin">
          <SidebarNav {...sidebarProps} />
          <button
            type="button"
            className="admin-sidebar__collapse"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expandir panel" : "Colapsar panel"}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </button>
        </aside>

        <div className="admin-main">
          <header className="admin-main__mobile-bar">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="admin-main__menu-btn" aria-label="Abrir menú">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="admin-sheet w-[280px] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menú admin</SheetTitle>
                </SheetHeader>
                <SidebarNav
                  navView={navView}
                  modules={modules}
                  activeModuleId={activeModuleId}
                  activeModuleTitle={activeModuleTitle}
                  onGoList={sidebarProps.onGoList}
                  onGoModule={sidebarProps.onGoModule}
                  onHome={sidebarProps.onHome}
                  onLogout={sidebarProps.onLogout}
                />
              </SheetContent>
            </Sheet>
            <p className="admin-main__mobile-title">Admin Creador</p>
          </header>

          <main className="admin-main__content">{children}</main>
        </div>
      </div>
      {toast}
    </StudioAtmosphere>
  );
}
