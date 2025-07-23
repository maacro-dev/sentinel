import { ComponentProps, memo } from "react";
import { getRoleLabel } from "@/features/users/utils";
import { useSignOut } from "@/features/authentication";
import { useSession } from "@/features/authentication/hooks/useSession";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { User } from "@/features/users";
import { UserAvatar } from "./UserAvatar";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/core/components/ui/dropdown-menu";

export const UserMenu = memo(() => {

  const navigate = useNavigate();
  const { user } = useSession();
  const { signOut } = useSignOut({
    onSignOut: async () => {
      navigate({ to: "/login", replace: true });
    },
  });

  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <UserAvatar user={user} className="cursor-pointer"/>
      </DropdownMenuTrigger>
      <UserMenuDropdown
        user={user}
        onSignOut={async () => signOut()}
        side="bottom"
      />
    </DropdownMenu>
  )
})

interface UserMenuDropdownProps extends DropdownMenuContentProps {
  user: User;
  onSignOut: () => Promise<void>;
}

export const UserMenuDropdown = memo(({
  user,
  onSignOut,
  align = "end",
  side = "right",
  sideOffset = 4,
  ...props
}: UserMenuDropdownProps) => (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width)
                  p-2 shadow-none min-w-56 rounded-lg
                  font-jetbrains-mono"
      align={align}
      side={side}
      sideOffset={sideOffset}
      {...props}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <DropdownMenuItem className="p-2">
          <UserAvatar user={user} />
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-xs font-medium">{user.first_name}</span>
            <span className="truncate text-muted-foreground/75 text-[0.7rem]">
              {getRoleLabel(user.role)}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="mx-2 my-1"/>
      <DropdownMenuGroup>
        <UserMenuDropdownItem
          icon={<LogOut />}
          label="Log out"
          onClick={onSignOut}
        />
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
);

interface UserMenuDropdownItemProps extends ComponentProps<typeof DropdownMenuItem> {
  icon: React.ReactNode;
  label: string;
}

export const UserMenuDropdownItem = ({ icon, label, ...props }: UserMenuDropdownItemProps) => {

  return (
    <DropdownMenuItem className="text-xs p-2" {...props}>
      {icon}{label}
    </DropdownMenuItem>
  )
};
