import { Input } from "@/components/ui/input";
import { useUserColumns } from "@/components/users";
import { AddUserForm } from "@/components/users/user-create-dialog";
import { UserCreate } from "@/lib/types/user";
import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, Users } from "lucide-react";

export const Route = createFileRoute("/admin/user_management")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "User Management | Humay" }],
  }),
  loader: async () => {
    // const result = await fetchAllUsers();
    // if (!result.success) throw result.error;
    // return { users: result.data };
  },
  staticData: {
    routeFor: "admin",
    label: "User Management",
    icon: Users,
    group: "Access Control",
    navItemOrder: 1,
  },
});

function RouteComponent() {
  const columns = useUserColumns();
  // console.log(columns);
  // const { users } = Route.useLoaderData();

  const onSubmit = (fields: UserCreate) => {
    console.log(fields);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex justify-between">
        <div>
          <h1 className="text-4xl font-semibold">User Management</h1>
          <p className="text-muted-foreground">
            Manage data collectors and data managers
          </p>
        </div>
        <AddUserForm onSubmit={onSubmit} />
      </div>
      <div>
        <div className="w-72 flex items-center gap-2">
          <SearchIcon className="text-muted-foreground" />
          <Input placeholder="Search" />
        </div>
      </div>
      {/* <Tabs defaultValue="all">
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
          <TabsTrigger
            className="px-4 py-1 text-muted-foreground data-[state=active]:text-primary data-[state=active]:shadow-none"
            value="admins"
          >
            Admins
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="flex-1 container w-full h-full">
            <DataTable columns={columns} data={users} />
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
        <TabsContent value="admins">
          <div className="flex-1 container w-full h-full">
            <DataTable columns={columns} data={users.filter((u) => u.role === "admin")} />
          </div>
        </TabsContent>
      </Tabs> */}
    </div>
  );
}
