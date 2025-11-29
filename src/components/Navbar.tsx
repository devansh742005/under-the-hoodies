import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
            Under the Hoodies
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/shop">
              <Button variant="ghost" size="sm">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop
              </Button>
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="secondary" size="sm">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};