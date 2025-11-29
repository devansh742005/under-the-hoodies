-- Create profiles table for user information
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create admins table
CREATE TABLE public.admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admins RLS Policies
CREATE POLICY "Admins table is readable by authenticated users"
  ON public.admins FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create products table
CREATE TABLE public.products (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  sizes text[] NOT NULL,
  image_url text,
  in_stock boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products RLS Policies
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "Only admins can update products"
  ON public.products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "Only admins can delete products"
  ON public.products FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Create orders table
CREATE TABLE public.orders (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id bigint REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  size text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders RLS Policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();