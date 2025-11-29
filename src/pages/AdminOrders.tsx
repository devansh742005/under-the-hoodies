import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  size: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  created_at: string;
  products: {
    name: string;
    price: number;
  };
  profiles: {
    email: string;
    full_name: string;
  };
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/');
    } else if (user && isAdmin) {
      fetchOrders();
    }
  }, [user, isAdmin, isLoading, navigate]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (name, price),
        profiles (email, full_name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">All Orders</h1>
        
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No orders yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>Order #{order.id}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-semibold">{order.profiles.full_name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{order.profiles.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-semibold">{order.products.name}</p>
                      <p className="text-sm">Size: {order.size} | Qty: {order.quantity}</p>
                      <p className="text-primary font-bold">${order.products.price}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Shipping Address</p>
                      <p className="text-sm">
                        {order.address}<br />
                        {order.city}, {order.state} {order.postal_code}<br />
                        {order.country}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;