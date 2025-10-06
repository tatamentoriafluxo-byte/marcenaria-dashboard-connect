import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const Header = () => {
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <SidebarTrigger />

        <Button variant="ghost" onClick={signOut} size="icon">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
