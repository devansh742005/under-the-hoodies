import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  image_url: string;
  in_stock: boolean;
}

const AdminProducts = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sizes: 'S,M,L,XL',
    image_url: '',
  });

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/');
    } else if (user && isAdmin) {
      fetchProducts();
    }
  }, [user, isAdmin, isLoading, navigate]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive',
      });
      return null;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = formData.image_url;
    
    if (imageFile) {
      const uploadedUrl = await handleImageUpload(imageFile);
      if (!uploadedUrl) {
        setLoading(false);
        return;
      }
      imageUrl = uploadedUrl;
    }

    const sizesArray = formData.sizes.split(',').map(s => s.trim());
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      sizes: sizesArray,
      image_url: imageUrl,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingId));
    } else {
      ({ error } = await supabase
        .from('products')
        .insert(productData));
    }

    setLoading(false);

    if (error) {
      toast({
        title: editingId ? 'Update failed' : 'Create failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: editingId ? 'Product updated' : 'Product created',
      });
      resetForm();
      fetchProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      sizes: product.sizes.join(','),
      image_url: product.image_url || '',
    });
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Product deleted successfully',
      });
      fetchProducts();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      sizes: 'S,M,L,XL',
      image_url: '',
    });
    setImageFile(null);
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Manage Products</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sizes">Sizes (comma separated)</Label>
                  <Input
                    id="sizes"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S,M,L,XL"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">All Products</h2>
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      <p className="font-bold text-primary mt-1">*{product.price}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this product? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
