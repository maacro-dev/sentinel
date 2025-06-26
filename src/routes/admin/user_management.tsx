import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllUsers } from "@/features/admin/api/fetch-all-users";
import { useUserColumns } from "@/features/admin/components/users-table/columns";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search as SearchIcon, Users } from "lucide-react";

export const Route = createFileRoute("/admin/user_management")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "User Management | Humay" }],
  }),
  loader: async () => {
    const result = await fetchAllUsers();
    if (!result.success) throw result.error;
    return { users: result.data };
  },
  staticData: {
    metadata: {
      group: "Access Control",
      title: "User Management",
      icon: Users,
      sidebarOptions: {
        showInSidebar: true,
        order: 1,
      },
      for: "admin",
    },
  },
});

function RouteComponent() {
  const columns = useUserColumns();
  const { users } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex justify-between">
        <div>
          <h1 className="text-4xl font-semibold">User Management</h1>
          <p className="text-muted-foreground">
            Manage data collectors and data managers
          </p>
        </div>
        <Button>
          <Plus />
          Add User
        </Button>
      </div>
      <div>
        <div className="w-72 flex items-center gap-2">
          <SearchIcon className="text-muted-foreground" />
          <Input placeholder="Search" />
        </div>
      </div>
      <Tabs defaultValue="all">
        <TabsList className="p-1">
          <TabsTrigger
            className="px-2 py-1 min-w-16 text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none"
            value="all"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            className="px-4 py-1 text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none"
            value="data_collectors"
          >
            Data Collectors
          </TabsTrigger>
          <TabsTrigger
            className="px-4 py-1 text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none"
            value="data_managers"
          >
            Data Managers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="flex-1 container w-full h-full">
            <DataTable columns={columns} data={users.filter((u) => u.role != "admin")} />
          </div>
        </TabsContent>
        <TabsContent value="data_collectors">
          <div className="flex-1 container w-full h-full">
            <DataTable
              columns={columns}
              data={users.filter((u) => u.role === "data_collector")}
            />
          </div>
        </TabsContent>
        <TabsContent value="data_managers">
          <div className="flex-1 container w-full h-full">
            <DataTable
              columns={columns}
              data={users.filter((u) => u.role === "data_manager")}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
