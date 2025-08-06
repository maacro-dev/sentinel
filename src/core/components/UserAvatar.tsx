import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "@/features/users";
import { cn } from "../utils/style";

interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
  user: User
}

export const UserAvatar = memo(({ user, className, ...rest }: UserAvatarProps) => {
  return(
    <Avatar className={cn("size-8 circle", className)} {...rest}>
      <AvatarImage src="/hamster.avif"/>
      <AvatarFallback className="circle bg-humay-bg">
        {user.first_name.charAt(0)}
        {user.last_name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
})
