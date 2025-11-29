import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { Package, ShoppingCart, Plus } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Admin Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-6 h-6" />
                Manage Products
              </CardTitle>
              <CardDescription>Add, edit, or remove hoodie products</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/products">
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Products
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                View Orders
              </CardTitle>
              <CardDescription>See all customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/orders">
                <Button variant="secondary" className="w-full">
                  View All Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;