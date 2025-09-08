-- Create category_types table for dynamic type management
CREATE TABLE public.category_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.category_types ENABLE ROW LEVEL SECURITY;

-- Create policies for category_types
CREATE POLICY "Anyone can view active category types" 
ON public.category_types 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage category types" 
ON public.category_types 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Insert default category types
INSERT INTO public.category_types (name, description) VALUES
('food', 'Food items and meals'),
('beverage', 'Drinks and beverages'),
('shop', 'General shop items'),
('other', 'Other miscellaneous items');

-- Add foreign key constraint to categories table
ALTER TABLE public.categories 
ADD CONSTRAINT fk_categories_type 
FOREIGN KEY (type) REFERENCES public.category_types(name)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Add foreign key constraint to products table  
ALTER TABLE public.products 
ADD CONSTRAINT fk_products_type 
FOREIGN KEY (type) REFERENCES public.category_types(name)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Create indexes for better performance
CREATE INDEX idx_category_types_active ON public.category_types(is_active);
CREATE INDEX idx_categories_type ON public.categories(type);
CREATE INDEX idx_products_type ON public.products(type);

-- Create updated_at trigger for category_types
CREATE TRIGGER update_category_types_updated_at
  BEFORE UPDATE ON public.category_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();