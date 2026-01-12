import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, Mail, Settings, LogOut, BookOpen, Award } from 'lucide-react';

export const UserDropdown = () => {
  const { t } = useTranslation();
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = () => {
    if (isAdmin()) return t('userDropdown:admin');
    if (isTeacher()) return t('userDropdown:instructor');
    if (isStudent()) return t('userDropdown:student');
    return t('userDropdown:user');
  };

  const getRoleIcon = () => {
    if (isAdmin()) return <Award className="h-4 w-4" />;
    if (isTeacher()) return <BookOpen className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full hover:bg-accent/50 transition-colors"
        >
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground flex items-center gap-1 mt-1">
              {getRoleIcon()}
              {getRoleLabel()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
     
      
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="cursor-pointer hover:bg-accent/50"
        >
          <Settings className="mr-2 h-4 w-4" />
          {t('userDropdown:settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('userDropdown:logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
