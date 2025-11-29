import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import heroImage from '@/assets/hero-hoodies.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
            Under the Hoodies
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Premium comfort meets modern style
          </p>
          <Link to="/shop">
            <Button size="lg" className="text-lg px-8">
              Shop Collection
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg bg-card border border-border">
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Premium Quality</h3>
              <p className="text-muted-foreground">
                Crafted from the finest materials for ultimate comfort
              </p>
            </div>
            <div className="text-center p-8 rounded-lg bg-card border border-border">
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Modern Design</h3>
              <p className="text-muted-foreground">
                Contemporary styles that never go out of fashion
              </p>
            </div>
            <div className="text-center p-8 rounded-lg bg-card border border-border">
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Cozy Comfort</h3>
              <p className="text-muted-foreground">
                Experience warmth and comfort like never before
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;