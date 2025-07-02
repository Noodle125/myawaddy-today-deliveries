import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Utensils, Car, Award, Star, Clock, Shield, MapPin } from 'lucide-react';

const Index = () => {
  const services = [
    {
      title: 'Shop',
      description: 'Browse and order from our wide selection of products',
      icon: ShoppingBag,
      link: '/shop',
      color: 'from-primary to-primary-glow'
    },
    {
      title: 'Food Delivery',
      description: 'Delicious meals delivered fresh to your door',
      icon: Utensils,
      link: '/food',
      color: 'from-secondary to-orange-400'
    },
    {
      title: 'Car Service',
      description: 'Reliable transportation around Myawaddy',
      icon: Car,
      link: '/car-order',
      color: 'from-accent to-green-400'
    },
    {
      title: 'Rewards',
      description: 'Collect cashback codes and earn rewards',
      icon: Award,
      link: '/rewards',
      color: 'from-delivery-gold to-yellow-400'
    }
  ];

  const features = [
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Quick delivery within Myawaddy and surrounding areas'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your orders and payments are protected'
    },
    {
      icon: Star,
      title: 'Quality Service',
      description: 'Rated highly by our satisfied customers'
    },
    {
      icon: MapPin,
      title: 'Local Focus',
      description: 'Serving Myawaddy, Myanmar with local expertise'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-float">
              <span className="text-gradient">Today Delivery</span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-medium text-muted-foreground">
                Service
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Fast, reliable delivery service in <span className="font-semibold text-accent">Myawaddy, Myanmar</span>
              <br />
              Shop, Food, Transportation & Rewards - All in one place!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/shop">
                <Button size="lg" className="btn-hero text-lg px-8 py-4">
                  Start Shopping
                </Button>
              </Link>
              <Link to="/food">
                <Button size="lg" variant="outline" className="btn-outline-vibrant text-lg px-8 py-4">
                  Order Food
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-r from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gradient">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need, delivered with care
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Link key={service.title} to={service.link}>
                <Card className="card-product hover:shadow-2xl transition-all duration-500 h-full group">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing the best delivery experience in Myawaddy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="text-center group">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gradient-to-r from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">About Today Delivery Service</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We are Myawaddy's premier delivery service, connecting our community with fast, 
                reliable, and affordable delivery solutions. From daily shopping needs to delicious 
                meals and transportation services, we've got you covered.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Our reward system makes every order count - collect cashback codes and enjoy 
                discounts on future services. We're more than just a delivery service; 
                we're your local partners in convenience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button className="btn-hero">
                    Join Today
                  </Button>
                </Link>
                <Link to="/rewards">
                  <Button variant="outline" className="btn-outline-vibrant">
                    Learn About Rewards
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-24 h-24 mx-auto mb-4 text-primary animate-float" />
                  <p className="text-2xl font-bold text-primary">Myawaddy</p>
                  <p className="text-lg text-muted-foreground">Myanmar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Security Section */}
      <section className="py-16 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Terms & Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg">Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your personal information is protected and never shared with third parties.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg">Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All transactions are secured with industry-standard encryption.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-lg">Service Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fair and transparent terms of service for all our customers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
