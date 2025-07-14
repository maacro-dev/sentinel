import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableRowSkeleton } from "@/components/ui/table";
import { User } from "@/lib/types";
import { LastActiveCell } from "../cells";
import { UserActionsCell } from "../cells/user-actions-cell";
import { usersQueryOptions } from "@/queries";
import { useSuspenseQuery } from "@tanstack/react-query";


interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    // <FadeInDiv direction="up" offset={2} duration={0.15}>
      <ScrollArea className="h-96 md:h-[32rem] rounded-md border">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} >
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-muted-foreground/60">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <Badge variant={user.role === "data_collector" ? "outline" : "secondary"} className="text-xs py-1 px-2">
                        {user.role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell className="">
                      {user.status == "active" && (
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                      )}
                      {user.status == "inactive" && (
                        <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                      )}
                    </TableCell>
                    <TableCell><LastActiveCell lastActive={user.last_sign_in_at} /></TableCell>
                    <TableCell className="text-center"><UserActionsCell user={user} /></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-sm">No users found</span>
                      <span className="text-xs text-muted-foreground">
                        Add a new user to get started.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </ScrollArea>
    // {/* </FadeInDiv> */}
  )
}

export function UsersTableSkeleton() {
  return (
    // <FadeInDiv direction="up" offset={2} duration={0.15}>
      <Table className="w-full">
        <TableBody>
          <TableRowSkeleton className="h-8" />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </TableBody>
      </Table>
    // </FadeInDiv>
  )
}


export function UsersTableSuspense() {
  const { data: users = []} = useSuspenseQuery(usersQueryOptions({ includeAdmin: false }))
  return <UsersTable users={users} />
}
