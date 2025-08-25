
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYelp,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";

// Define the type for the store data prop
interface StoreData {
  // Brand-level
  brandName: string;
  description: string;

  // Store basics
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
    locality: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  category: string;
  tags: string[];

  // Store operational info
  hours: Record<string, string>;
  paymentMethods?: string[];
  parkingOptions?: string[];
  plusCode?: string;

  // Hero
  heroImage?: string;
  heroHint?: string;
  tagline: string;

  // Catalog
  products: {
    name: string;
    description: string;
    image: string;
    hint: string;
    price?: number;
    ctaUrl?: string;
  }[];
  gallery: { src: string; alt: string; hint: string }[];

  // Ratings & reviews
  rating?: number; // 0-5
  reviews?: { author: string; date: string; rating: number; text: string }[];

  // QR / assets
  qrImage?: string;
  qrDownloadUrl?: string;

  // Nearby stores/cards
  nearbyStores?: {
    name: string;
    address: string;
    phone?: string;
    rating?: number;
    websiteUrl?: string;
    directionsUrl?: string;
  }[];

  otherStoresLinks?: { label: string; href: string }[];
  popularCities?: { label: string; href: string }[];

  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    yelp?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

// This component now receives storeData as a prop
export default function ClassicTemplate({ storeData }: { storeData?: StoreData }) {
  
  // If no storeData is provided, show a message or return null
  if (!storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Template Preview</h1>
          <p className="text-gray-600">This is a preview of the Classic template.</p>
          <p className="text-sm text-gray-500 mt-2">Store data is required to display the full template.</p>
        </div>
      </div>
    );
  }

  const socialIcons: { [key: string]: React.ElementType } = {
    facebook: FaFacebook,
    twitter: FaTwitter,
    instagram: FaInstagram,
    yelp: FaYelp,
  }

  const fullAddress = `${storeData.address.line1}${storeData.address.line1 ? ", " : ""}${storeData.address.line2 ? storeData.address.line2 + ", " : ""}${storeData.address.locality}, ${storeData.address.city}, ${storeData.address.postalCode}`;

  const renderStars = (value: number | undefined) => {
    if (!value || value <= 0) return null;
    const stars: JSX.Element[] = [];
    const full = Math.floor(value);
    const half = value - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    for (let i = 0; i < full; i += 1) stars.push(<FaStar key={`f-${i}`} className="text-yellow-500" />);
    if (half === 1) stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    for (let i = 0; i < empty; i += 1) stars.push(<FaRegStar key={`e-${i}`} className="text-yellow-500" />);
    return <div className="flex items-center gap-1">{stars}<span className="ml-2 text-sm font-medium">{value.toFixed(1)}</span></div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-gray-800 font-body">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/60 backdrop-blur-md border-b border-white/40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">{storeData.brandName}</span>
          </h1>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#menu" className="hover:text-primary transition-colors">Featured</a>
            <a href="#reviews" className="hover:text-primary transition-colors">Reviews</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>
          <Button className="hidden sm:inline-flex shadow-sm">Order Now</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative">
        <Image src={storeData.heroImage || "https://placehold.co/1600x900.png"} alt="Hero Image" width={1600} height={900} className="w-full h-[70vh] md:h-[75vh] object-cover" data-ai-hint={storeData.heroHint || "store hero"} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tight drop-shadow-xl">{storeData.name}</h2>
            {storeData.tagline && (
              <p className="mt-4 text-base md:text-xl max-w-2xl mx-auto text-white/90">{storeData.tagline}</p>
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              {storeData.phone && (
                <Button asChild size="lg" className="shadow-md">
                  <a href={`tel:${storeData.phone}`}>Call Now</a>
                </Button>
              )}
              <Button size="lg" variant="outline" className="backdrop-blur bg-white/10 text-white border-white/40 hover:bg-white/20">
                Directions
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        <div className="text-xs md:text-sm text-muted-foreground mb-8 flex items-center gap-2">
          <span className="text-muted-foreground/70">Stores</span>
          <span className="opacity-40">/</span>
          <span className="text-muted-foreground/70">{storeData.address.state}</span>
          <span className="opacity-40">/</span>
          <span className="text-muted-foreground/70">{storeData.address.city}</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-foreground">{storeData.address.locality}</span>
        </div>

        {/* Heading + Contact card */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-sm border-gray-200/70">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl tracking-tight">{storeData.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">{renderStars(storeData.rating)}</div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <p className="text-sm">{fullAddress}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0" />
                <p className="text-sm">{storeData.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0" />
                <p className="text-sm">{storeData.email}</p>
              </div>
              <div>
                <Button className="mt-2">Directions</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200/70">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Get In Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border rounded-md p-2" placeholder="Name *" />
                <input className="border rounded-md p-2" placeholder="Email *" />
                <input className="border rounded-md p-2 md:col-span-1" placeholder="Mobile No. *" />
                <select className="border rounded-md p-2 md:col-span-1">
                  <option>I Want to Apply For</option>
                  {storeData.products.map((p) => (
                    <option key={p.name}>{p.name}</option>
                  ))}
                </select>
                <div className="md:col-span-2">
                  <Button type="button" className="w-full">Submit</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        {/* About Section (Brand-level) */}
        <section id="about" className="py-16 text-center">
          <h3 className="text-3xl font-bold mb-4">About {storeData.brandName}</h3>
          <p className="max-w-3xl mx-auto leading-relaxed">{storeData.description}</p>
        </section>

        <Separator className="my-12" />

        {/* Menu/Products Section (Brand-level) */}
        <section id="menu" className="py-16">
          <h3 className="text-3xl font-bold text-center mb-12">Featured Products</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {storeData.products.map((product, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-xl transition-shadow duration-300 rounded-xl border-gray-200/70">
                <div className="relative">
                  <Image src={product.image} alt={product.name} width={400} height={300} className="w-full h-48 object-cover" data-ai-hint={product.hint} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {typeof product.price === "number" && (
                    <span className="absolute bottom-3 left-3 text-xs font-semibold px-2 py-1 rounded-md bg-white/90 shadow">₹ {product.price}</span>
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-lg tracking-tight">{product.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <a href={product.ctaUrl || "#"}>Buy Now</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Gallery Section (Brand-level) */}
        <section id="gallery" className="py-16">
          <h3 className="text-3xl font-bold text-center mb-12">Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {storeData.gallery.map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl shadow-md group">
                <Image src={image.src} alt={image.alt} width={400} height={300} className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-300" data-ai-hint={image.hint} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-0 inset-x-0 p-3 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                  <div className="text-white text-xs">{image.alt}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Discover + Reviews + Contact Sections */}
        <section id="reviews" className="py-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="shadow-sm border-gray-200/70">
              <CardHeader>
                <CardTitle>Discover More With Us</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="w-48 h-48 bg-white border rounded-md flex items-center justify-center overflow-hidden">
                  {storeData.qrImage ? (
                    <Image src={storeData.qrImage} alt="QR" width={192} height={192} className="object-contain" />
                  ) : (
                    <Image src="https://placehold.co/192x192.png" alt="QR" width={192} height={192} />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tell us about your experience. Scan this QR code to discover more with us.</p>
                  <Button asChild>
                    <a href={storeData.qrDownloadUrl || "#"}>Download QR</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200/70">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3">Store Ratings {renderStars(storeData.rating)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {storeData?.reviews?.slice(0, 3).map((r, i) => (
                  <div key={i} className="border-b pb-4">
                    <p className="font-medium">{r.author}</p>
                    <p className="text-xs text-muted-foreground">Posted on: {r.date}</p>
                    <div className="mt-1">{renderStars(r.rating)}</div>
                    <p className="text-sm mt-1">{r.text}</p>
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button>Submit a Review</Button>
                  <Button variant="outline">View All</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact & Hours Section (Store-specific) */}
        <section id="contact" className="py-16">
          <h3 className="text-3xl font-bold text-center mb-12">Visit Us</h3>
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                <div className="bg-muted rounded-xl overflow-hidden h-96 shadow-sm">
                    <Image src="https://placehold.co/800x600.png" alt="Map" width={800} height={600} className="w-full h-full object-cover" data-ai-hint="map location" />
                </div>
            </div>
            <div className="space-y-6">
                <Card className="shadow-sm border-gray-200/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary"/> Business Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                           {Object.entries(storeData.hours).map(([day, time]) => (
                                <li key={day} className="flex justify-between">
                                    <span>{day}</span>
                                    <span className="font-medium">{time}</span>
                                </li>
                           ))}
                        </ul>
                    </CardContent>
                </Card>
               <Card className="shadow-sm border-gray-200/70">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/> Get In Touch</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 mt-1 shrink-0" />
                            <p className="text-sm">{fullAddress}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 shrink-0" />
                            <p className="text-sm">{storeData.phone}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 shrink-0" />
                            <p className="text-sm">{storeData.email}</p>
                        </div>
                        {storeData.plusCode && (
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 mt-1 shrink-0" />
                            <p className="text-sm">Plus Code: {storeData.plusCode}</p>
                          </div>
                        )}
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Utilities blocks */}
        <section className="py-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-gray-200/70">
            <CardHeader>
              <CardTitle>Other Stores of {storeData.brandName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(storeData.otherStoresLinks || []).map((l) => (
                <a key={l.label} className="text-primary underline" href={l.href}>{l.label}</a>
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-sm border-gray-200/70">
            <CardHeader>
              <CardTitle>Parking Options</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm">
                {(storeData.parkingOptions || ["Free parking on site"]).map((opt) => (
                  <li key={opt}>{opt}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-gray-200/70">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm">
                {(storeData.paymentMethods || ["Cash", "Credit Card", "Debit Card", "Online Payment"]).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-gray-200/70">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <span className="border rounded px-2 py-1 text-sm">{storeData.category}</span>
            </CardContent>
          </Card>
        </section>

        {/* Nearby stores */}
        {storeData.nearbyStores && storeData.nearbyStores.length > 0 && (
          <section className="py-16">
            <h3 className="text-3xl font-bold text-center mb-10">Nearby {storeData.brandName} Stores</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeData.nearbyStores.map((s, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-2">
                    <h4 className="font-semibold">{s.name}</h4>
                    {s.rating && <div>{renderStars(s.rating)}</div>}
                    <p className="text-sm text-muted-foreground">{s.address}</p>
                    {s.phone && <p className="text-sm">{s.phone}</p>}
                    <div className="flex gap-3 pt-2">
                      {s.websiteUrl && (
                        <Button asChild variant="outline"><a href={s.websiteUrl}>Website</a></Button>
                      )}
                      {s.directionsUrl && (
                        <Button asChild><a href={s.directionsUrl}>Directions</a></Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Nearby locality and tags */}
        <section className="py-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Nearby Locality</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="border rounded px-2 py-1 text-sm">{storeData.address.locality}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {storeData.tags.map((t) => (
                <span key={t} className="border rounded px-2 py-1 text-sm">{t}</span>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-900 to-black text-white">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-sm text-white/80">&copy; {new Date().getFullYear()} {storeData.brandName}. All Rights Reserved.</p>
              <div className="flex space-x-4">
                  {Object.entries(storeData.socialLinks).map(([key, href]) => {
                    const Icon = socialIcons[key];
                    if (!Icon || !href || href === "#") return null;
                    return (
                      <a key={key} href={href} className="text-white/50 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                        <Icon className="h-6 w-6" />
                      </a>
                    )
                  })}
              </div>
          </div>
          {storeData.popularCities && storeData.popularCities.length > 0 && (
            <div className="mt-6 text-center text-sm">
              <span className="text-white/60">Popular Cities: </span>
              {storeData.popularCities.map((c, idx) => (
                <a key={c.label} href={c.href} className="text-primary underline mx-2">
                  {c.label}
                  {idx < storeData.popularCities!.length - 1 ? " |" : ""}
                </a>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
