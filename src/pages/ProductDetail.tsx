import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  image_url: string;
  in_stock: boolean;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', parseInt(id))
      .maybeSingle();

    if (!error && data) {
      setProduct(data);
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
    }
    setLoading(false);
  };

  const handleOrder = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to place an order',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!selectedSize) {
      toast({
        title: 'Select a size',
        description: 'Please select a size before ordering',
        variant: 'destructive',
      });
      return;
    }

    navigate(`/checkout?product=${id}&size=${selectedSize}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-foreground">Product not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-foreground">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">${product.price}</p>
            <p className="text-lg text-muted-foreground">{product.description}</p>
            
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Select Size</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                <div className="flex gap-4">
                  {product.sizes.map((size) => (
                    <div key={size} className="flex items-center">
                      <RadioGroupItem value={size} id={size} />
                      <Label htmlFor={size} className="ml-2 cursor-pointer">
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
            
            <Button size="lg" className="w-full md:w-auto px-12" onClick={handleOrder}>
              Order Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;