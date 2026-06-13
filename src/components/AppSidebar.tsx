import { Receipt, Tags, CreditCard, BarChart3, GitCompareArrows, ShieldCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Despesas", url: "/", icon: Receipt },
  { title: "Origens", url: "/origens", icon: Tags },
  { title: "Pagadores", url: "/pagadores", icon: CreditCard },
  { title: "Regras", url: "/regras", icon: ShieldCheck },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Evolução Trimestral", url: "/evolucao", icon: GitCompareArrows },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Controle Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
