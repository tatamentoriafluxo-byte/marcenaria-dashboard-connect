import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">M</span>
            </div>
            <span className="hidden font-bold text-foreground sm:inline-block">
              Painel Marcenaria
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link to="/">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link to="/projetos">Projetos</Link>
          </Button>
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link to="/vendedores">Vendedores</Link>
          </Button>
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link to="/clientes">Clientes</Link>
          </Button>
          <Button variant="ghost" onClick={signOut} size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </nav>
      </div>
    </header>
  );
};
